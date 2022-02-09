package main

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	dataPath                         string
	demosPath                        string
	mapsPath                         string
	staticPath                       string
	frontendPath                     string
	port                             string
	incrementalRescanIntervalMinutes int
	trustedProxies                   []string
	debug                            bool
}

func getConfig(logger *Logger) Config {
	return Config{
		dataPath:                         envOrString("PUGGIES_DATA_PATH", "/data"),
		demosPath:                        envOrString("PUGGIES_DEMOS_PATH", "/demos"),
		mapsPath:                         envOrString("PUGGIES_MAPS_PATH", "/backend/maps"),
		staticPath:                       envOrString("PUGGIES_STATIC_PATH", "/frontend/build"),
		frontendPath:                     envOrString("PUGGIES_FRONTEND_PATH", "/app"),
		port:                             envOrString("PUGGIES_HTTP_PORT", "9115"),
		incrementalRescanIntervalMinutes: envOrNumber("PUGGIES_DEMOS_RESCAN_INTERVAL_MINUTES", 30, logger),
		trustedProxies:                   getTrustedProxies(),
		debug:                            logger.debugMode,
	}
}

func (config Config) String() string {
	ret := "\n{\n"
	ret += "\t" + "dataPath: " + config.dataPath + "\n"
	ret += "\t" + "demosPath: " + config.demosPath + "\n"
	ret += "\t" + "mapsPath: " + config.mapsPath + "\n"
	ret += "\t" + "staticPath: " + config.staticPath + "\n"
	ret += "\t" + "frontendPath: " + config.frontendPath + "\n"
	ret += "\t" + "port: " + config.port + "\n"
	ret += "\t" + "incrementalRescanIntervalMinutes: " + strconv.Itoa(config.incrementalRescanIntervalMinutes) + "\n"
	ret += "\t" + "trustedProxies: " + strings.Join(config.trustedProxies, ", ") + "\n"
	ret += "\t" + "debug: " + strconv.FormatBool(config.debug) + "\n"
	ret += "}"
	return ret
}

func envOrString(key, defaultV string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultV
	}
	return val
}

func envOrNumber(key string, defaultV int, logger *Logger) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultV
	}
	i, err := strconv.Atoi(val)
	if err != nil {
		logger.Warnf("invalid number \"%s\" provided for variable %s. Using default value of %d", val, key, defaultV)
		return defaultV
	}
	return i
}

func getTrustedProxies() []string {
	val := os.Getenv("PUGGIES_TRUSTED_PROXIES")
	if val == "" {
		return nil
	}
	proxies := strings.Split(val, ",")
	return proxies
}
