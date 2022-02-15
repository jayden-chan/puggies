/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

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

func validateJwt(c Context, jwtString string) (string, int64, error) {
	token, err := jwt.Parse(jwtString, func(token *jwt.Token) (interface{}, error) {
		// validate that the alg is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New(fmt.Sprintf("Unexpected signing method: %v", token.Header["alg"]))
		}

		return c.config.jwtSecret, nil
	})

	if err != nil {
		return "", 0, err
	}

	if token == nil {
		return "", 0, errors.New("nil token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		username, claimOK := claims["username"].(string)
		if !claimOK {
			return "", 0, errors.New("Failed to parse userid from jwt")
		}
		exp, claimOK := claims["exp"].(float64)
		if !claimOK {
			return "", 0, errors.New("Failed to parse exp from jwt")
		}

		return username, int64(exp), nil
	} else {
		return "", 0, err
	}
}
