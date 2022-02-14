# Configuration

Puggies runtime configuration is done through the use of environment variables.

## Configuration variables reference

### `PUGGIES_TRUSTED_PROXIES`
**Type**: Comma-separated list of IPv4 addresses, IPv4 CIDRs, IPv6 addresses or IPv6 CIDRs

**Default**: null

Represents the list of IP addresses which will be set as trusted proxies in the Gin web
framework. See the [Gin Docs](https://github.com/gin-gonic/gin#dont-trust-all-proxies)
for more information on this topic.

If you are running in Docker behind a trusted reverse proxy, set this to `172.16.0.0/12`.

If you are running on bare metal behind a trusted reverse proxy, set this to the IP
address of your proxy.

If you leave this variable un-set, a default value of `nil` will be passed to Gin and
**no** proxies will be trusted.

**Exposing the container to the public internet without a reverse proxy is not
recommended.**

### `PUGGIES_DB_TYPE`
**Type**: String

**Default**: `postgres`

Database type. Currently only `postgres` is supported.

### `PUGGIES_DB_CONNECTION_STRING`
**Type**: String

**Default**: no default value

Database connection string. For example: `postgres://user:password@hostname/puggies`

### `PUGGIES_JWT_SECRET`
**Type**: String

**Default**: no default value

Secret key which will be used to sign JWTs for user login/session management. Set this to
a long, random string.

### `PUGGIES_JWT_SESSION_LENGTH_SECONDS`
**Type**: Int

**Default**: 259200

Secret key which will be used to sign JWTs for user login/session management. Set this to
a long, random string.

### `PUGGIES_TZ`
**Type**: String

**Default**: `Etc/UTC`

Timezone to use when parsing demo dates. The name should be a location name corresponding
to a file in the IANA Time Zone database, such as "America/New_York"

### `PUGGIES_ALLOW_REGISTRATION`
**Type**: Boolean

**Default**: `false`

Whether or not users should be allowed to sign up for an account on their own. Defaults
to false -- the only account will be the admin account which you must set up when first
installing Puggies. Accounts can be created manually by the admin user if this is set to
false.

### `PUGGIES_DATA_PATH`
**Type**: String

**Default**: `/data`

The full path to the location where Puggies should store its generated data.

If you are running in Docker it is recommended to leave this at the default. Create a
docker volume or use a bind-mount and mount it to `/data` when setting up your Docker
installation.

### `PUGGIES_DEMOS_PATH`
**Type**: String

**Default**: `/demos`

The full path to the location where Puggies will search for CS:GO demo files.

If you are running in Docker it is recommended to leave this at the default. Bind-mount
your demos folder to `/demos` when setting up your Docker installation.

### `PUGGIES_HTTP_PORT`
**Type**: String

**Default**: `9115`

The port that the HTTP server will run on.

If you are running in Docker it is recommended to leave this at the default. You can
access Puggies on a different port by changing the port mapping in your Docker Compose
file (for example if you wanted to access Puggies on port 9999 you should change it to
`9999:9115`).

### `PUGGIES_DEMOS_RESCAN_INTERVAL_MINUTES`
**Type**: Number

**Default**: 180

The interval period in minutes for how often the server should re-scan the demos folder.

The server will detect when a file is added to the demos folder, so the full re-scan is
only a precaution in case a file event was somehow missed (unlikely). You can set this to
a pretty long interval to avoid re-scanning the demos folder too often. A demo will only
be parsed if its information is missing from the data folder, so a re-scan won't trigger
the demo parser unless necessary.

### `PUGGIES_DEBUG`
**Type**: Boolean

**Default**: `false`

Whether to print verbose debug information in the logs. If you are having an issue with
the software and need to debug, it's a good idea to enable this.

### `PUGGIES_ASSETS_PATH`
**Type**: String

**Default**: `/backend/assets`

The full path to the location where the frontend and backend assets are located.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/backend/assets`

### `PUGGIES_MIGRATIONS_PATH`
**Type**: String

**Default**: `/backend/migrations`

The full path to the location where the SQL migrations are located.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/backend/migrations`

### `PUGGIES_STATIC_PATH`
**Type**: String

**Default**: `/frontend/build`

The full path to the location of the built React frontend.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/frontend/build`

### `PUGGIES_FRONTEND_PATH`
**Type**: String

**Default**: `/app`

The base path in the URL where the Puggies frontend will be accessed. (ex.
http://puggies.example.com/app/)

If you are running in Docker you must leave this at the default setting.
