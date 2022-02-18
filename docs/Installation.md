# Installing Puggies

The following document explains different methods for getting Puggies up and running.
Once you are finished with this you can move on to [configuration](./Configuration.md)
and [deployment](./Deployment.md).

## Docker Compose (Recommended)
The officially supported and recommended way to install Puggies is with
[Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/).
Here is an example of a docker-compose.yml file which you can use to install Puggies:
```yaml
version: "2.1"
services:
  puggies_postgres:
    image: postgres:14-alpine
    container_name: puggies_postgres
    volumes:
      - ./puggies-postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: change_this_password
      POSTGRES_USER: puggies
      POSTGRES_DB: puggies

  puggies:
    # You pin the image version to any of the following:
    # jayden-chan/puggies:1 -- updated whenever version 1.X.X is released
    # jayden-chan/puggies:1.0 -- updated whenever version 1.0.X is released
    # jayden-chan/puggies:1.0.0 -- pinned to specific maj.min.patch version
    # jayden-chan/puggies:latest -- always the latest version

    # It is reccommended to pin to the major version only so you receive minor & patch
    # upgrades
    image: jayden-chan/puggies:1
    container_name: puggies
    # (optional) set this to your uid:gid (find this info by running the `id` command)
    # this way data created by puggies will be owned by your user instead of root.
    user: 1000:1000

    depends_on:
      - puggies_postgres

    # See Configuration.md for a full list of environment variable options.
    environment:
      PUGGIES_DB_TYPE: postgres
      PUGGIES_DB_CONNECTION_STRING: "postgres://puggies:change_this_password@puggies_postgres/puggies?sslmode=disable"
      PUGGIES_TZ: "America/Chicago"

      # Do not set this if you expose the container directly
      # to the internet (which itself is not reccommended)
      #
      # See the PUGGIES_TRUSTED_PROXIES option in the Configuration docs.
      PUGGIES_TRUSTED_PROXIES: 172.16.0.0/12,192.168.0.0/16
    ports:
      - 9115:9115
    volumes:
        # Data created by puggies (mainly heatmap images)
      - ./puggies-data:/data
        # Path to the folder containing your demos
      - /path/to/demos:/demos
```

## Building Docker container from source
You can build the docker container from source by executing the following commands on
Linux (or any system with a POSIX-compliant shell):
```bash
git clone https://github.com/jayden-chan/puggies.git
cd puggies
./docker-build.sh
```

If you have your own self-hosted Docker registry you can push the image up there as well:
```bash
# the trailing slash is important
REGISTRY="registry.example.com/" ./docker-build.sh 1 0 0 --push
```

The resulting image can then be used with the Docker Compose instructions from above.

## Running without Docker (building from source)
Although it is not recommended, Puggies can be built and installed from source. See the
[development](./Development.md) docs for a list of required system
dependencies.

```bash
git clone https://github.com/jayden-chan/puggies.git

cd puggies/frontend
yarn install
yarn build

cd ../backend
go build src/*.go -o puggies

# Set up your environment variables (docs/Configuration.md) before running this
./puggies serve
```
