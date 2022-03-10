# Configuration

Puggies runtime configuration is done through the use of environment variables.

## Security & Deployment Options

#### `PUGGIES_TRUSTED_PROXIES`
**Type**: Comma-separated list of IPv4 addresses, IPv4 CIDRs, IPv6 addresses or IPv6 CIDRs <br/>
**Default**: no default value

Represents the list of IP addresses which will be set as trusted proxies in the Gin web
framework. See the [Gin Docs](https://github.com/gin-gonic/gin#dont-trust-all-proxies)
for more information on this topic.

If you are running in Docker behind a trusted reverse proxy, set this to the subnet of
your docker network. For a standalone container it will likely be `172.16.0.0/12`, and
for a docker-compose managed container it will likely be somewhere in the
`192.168.0.0/16` range (you should double check though.).

If you are running on bare metal behind a trusted reverse proxy, set this to the IP
address of your proxy.

If you leave this variable un-set, a default value of `nil` will be passed to Gin and
**no** proxies will be trusted.

#### `PUGGIES_JWT_SECRET`
**Type**: String <br/>
**Default**: no default value

Secret key which will be used to sign JWTs for user login/session management. Set this to
a long, random string.

#### `PUGGIES_JWT_SESSION_LENGTH_HOURS`
**Type**: Int <br/>
**Default**: `336` (14 days)

The length of time a user's session token will be valid for. After this period they will
need to log in again.

#### `PUGGIES_MATCH_VISIBILITY`
**Type**: `public` or `private` <br/>
**Default**: `public`

Configure the visibility of matches. If set to `public`, all matches will be visible
without requiring an account. If set to `private`, visitors will not be able to view
matches without logging in with an account.

#### `PUGGIES_ALLOW_DEMO_DOWNLOAD`
**Type**: Boolean <br/>
**Default**: `true`

Enable or disable downloading the demo file (`.dem`) through the web interface/API.

#### `PUGGIES_ALLOW_SELF_SIGNUP`
**Type**: Boolean <br/>
**Default**: `false`

Whether or not users should be allowed to sign up for an account on their own. Defaults
to false -- the only account will be the admin account which you must set up when first
installing Puggies. Accounts can still be created manually by the admin user.

#### `PUGGIES_SHOW_LOGIN_BUTTON`
**Type**: Boolean <br/>
**Default**: `true`

Whether or not to show the Login button on the frontend. This option will not prevent
users from logging in if set to false. Users will still be able to log in by navigating
to the `/login` URL.

This is just a small tweak to help reduce the visibility of the login feature and limit
the number of failed login attempts for publicly hosted instances.

## Paths

#### `PUGGIES_DATA_PATH`
**Type**: String <br/>
**Default**: `/data`

The full path to the location where Puggies should store its generated data.

If you are running in Docker it is recommended to leave this at the default. Create a
docker volume or use a bind-mount and mount it to `/data` when setting up your Docker
installation.

#### `PUGGIES_DEMOS_PATH`
**Type**: String <br/>
**Default**: `/demos`

The full path to the location where Puggies will search for CS:GO demo files.

If you are running in Docker it is recommended to leave this at the default. Bind-mount
your demos folder to `/demos` when setting up your Docker installation.

#### `PUGGIES_DB_TYPE`
**Type**: String <br/>
**Default**: `postgres`

Database type. Currently only `postgres` is supported.

#### `PUGGIES_DB_CONNECTION_STRING`
**Type**: String <br/>
**Default**: no default value

Database connection string. For example: `postgres://user:password@hostname/puggies`

#### `PUGGIES_TZ`
**Type**: String <br/>
**Default**: `Etc/UTC`

Timezone to use when parsing demo dates. The name should be a location name corresponding
to a file in the IANA Time Zone database, such as "America/New_York"

#### `PUGGIES_ASSETS_PATH`
**Type**: String <br/>
**Default**: `/backend/assets`

The full path to the location where the frontend and backend assets are located.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/backend/assets`

#### `PUGGIES_MIGRATIONS_PATH`
**Type**: String <br/>
**Default**: `/backend/migrations`

The full path to the location where the SQL migrations are located.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/backend/migrations`

#### `PUGGIES_STATIC_PATH`
**Type**: String <br/>
**Default**: `/frontend/build`

The full path to the location of the built React frontend.

If you are running in Docker you must leave this at the default setting.

If you are running on bare metal you should set this to `/<path to puggies git
root>/frontend/build`

#### `PUGGIES_FRONTEND_PATH`
**Type**: String <br/>
**Default**: `/app`

The base path in the URL where the Puggies frontend will be accessed. (ex.
http://puggies.example.com/app/)

If you are running in Docker you must leave this at the default setting.

## Misc

#### `PUGGIES_HTTP_PORT`
**Type**: String <br/>
**Default**: `9115`

The port that the HTTP server will run on.

If you are running in Docker it is recommended to leave this at the default. You can
access Puggies on a different port by changing the port mapping in your Docker Compose
file (for example if you wanted to access Puggies on port 9999 you should change it to
`9999:9115`).

#### `PUGGIES_DEMOS_RESCAN_INTERVAL_MINUTES`
**Type**: Number <br/>
**Default**: 180

The interval period in minutes for how often the server should re-scan the demos folder.

The server will detect when a file is added to the demos folder, so the full re-scan is
only a precaution in case a file event was somehow missed (unlikely). You can set this to
a pretty long interval to avoid re-scanning the demos folder too often. A demo will only
be parsed if its information is missing from the data folder, so a re-scan won't trigger
the demo parser unless necessary.

#### `PUGGIES_DEBUG`
**Type**: Boolean <br/>
**Default**: `false`

Whether to print verbose debug information in the logs. If you are having an issue with
the software and need to debug, it's a good idea to enable this.
