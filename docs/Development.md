# Development

Puggies is developed with Go, React and Docker. If you want to contribute to Puggies you
will need the following tools installed on your computer:

* [Git](https://git-scm.com/)
* [Go](https://go.dev/)
* [NodeJS LTS](https://nodejs.org/en/)
* [Yarn](https://classic.yarnpkg.com/lang/en/)
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [golang-migrate CLI](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate)

Once you have set up your dependencies you can fork the repository and begin developing:
```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/puggies.git
cd puggies/frontend
yarn install
yarn start

# in another terminal window
cd puggies/backend
# edit the example .env file to suit your needs
cp .env.development.example .env
source .env
go run src/* serve
```

## Submitting your changes
To have your changes merged, please submit a pull request on GitHub. Describe your
changes in detail and ensure you have followed the pull request checklist.

## Tips
The Puggies frontend has a few dependencies. You might find the documentation for
these useful:

* [React](https://reactjs.org/)
* [Chakra](https://chakra-ui.com/docs/getting-started)
* [date-fns](https://date-fns.org/)

**Chakra components should be used exclusively in frontend code** (use `<Box>` / `<Flex>`
/ `<Text>` as opposed to plain React components like `<div>` or `<p>`). The [Chakra
Documentation](https://chakra-ui.com/docs/getting-started) is your best friend!

The Puggies backend also has a few dependencies. You might find the documentation for
these useful:

* [demoinfocs-golang](https://pkg.go.dev/github.com/markus-wa/demoinfocs-golang/v2#section-readme)
* [Gin](https://github.com/gin-gonic/gin)
* [gocron](https://github.com/go-co-op/gocron)
* [fsnotify](https://github.com/fsnotify/fsnotify)
* [golang-migrate](https://github.com/golang-migrate/migrate)

### Performing database schema upgrades
Database migrations are managed through
[golang-migrate](https://github.com/golang-migrate/migrate). If you need to make an
update to the database schema you must do so by generating a new migration. Use the
following command inside the `backend` directory:
```bash
migrate create -ext sql -dir migrations -seq descriptive_migration_name_here
```

Use a descriptive yet concise name for the migration so developers know what it does. See the
[migration best practices](https://github.com/golang-migrate/migrate/blob/master/MIGRATIONS.md) documentation for more info.
