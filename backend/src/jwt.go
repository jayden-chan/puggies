package main

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
)

func createJwt(c Context, user User) (string, error) {
	now := time.Now()
	exprDuration, err := time.ParseDuration(strconv.Itoa(c.config.jwtSessionMinutes) + "m")
	if err != nil {
		return "", err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username":    user.Username,
		"displayname": user.DisplayName,
		"exp":         now.Add(exprDuration).Unix(),
		"iat":         now.Unix(),
	})

	tokenString, err := token.SignedString(c.config.jwtSecret)
	return tokenString, err
}

func validateJwt(c Context, jwtString string) (string, error) {
	token, err := jwt.Parse(jwtString, func(token *jwt.Token) (interface{}, error) {
		// validate that the alg is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New(fmt.Sprintf("Unexpected signing method: %v", token.Header["alg"]))
		}

		return c.config.jwtSecret, nil
	})

	if err != nil {
		return "", err
	}

	if token == nil {
		return "", errors.New("nil token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		username, claimOK := claims["username"].(string)
		if !claimOK {
			return "", errors.New("Failed to parse userid from jwt")
		}
		return username, nil
	} else {
		return "", err
	}
}
