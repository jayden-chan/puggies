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

### Frontend
* Use only Chakra Components (`<Box>` / `<Flex>` / `<Text>` as opposed to plain React
    components like `<div>` or `<p>`). The
    [Chakra Documentation](https://chakra-ui.com/docs/getting-started) is your best friend!
* Use `setState` where possible for component-local state. Use `zustand` for global
    state by updating one of the stores in `src/stores` or by creating a new one.
* Maintain type safety as much as possible. Avoid the use of `any` or `object` types

#### Documentation
* [React](https://reactjs.org/)
* [Chakra](https://chakra-ui.com/docs/getting-started)
* [FontAwesome](https://fontawesome.com/search?s=solid%2Cregular%2Cbrands)
* [date-fns](https://date-fns.org/)
* [zustand](https://github.com/pmndrs/zustand)

### Backend
* Use the `http` package for status codes (`http.StatusOK` instead of `200`)
* The response type for API routes should always be JSON. For a successful response,
    place the data in the `message` field. For error responses, place the error string in
    the `error` field.

### Performing database schema upgrades
Database migrations are managed through
[golang-migrate](https://github.com/golang-migrate/migrate). If you need to make an
update to the database schema you must do so by generating a new migration. Use the
following command inside the `backend` directory:
```bash
migrate create -ext sql -dir migrations -seq descriptive_migration_name_here
```

Use a descriptive yet concise name for the migration so developers know what it does. See the
[migration best practices](https://github.com/golang-migrate/migrate/blob/master/MIGRATIONS.md)
documentation for more info.

### Demo Parser Versioning
When making updates to the demo parser it is important to increment the `ParserVersion`
if necessary. Parsed matches are tagged in the database with the version of the demo
parser used to parse them. Breaking changes to the parser will require incrementing the
`ParserVersion` so that the demos in the database get re-analyzed with the new logic.

Some examples of changes to the parser that would require changing the `ParserVersion`:
* Changing the `Match`, `MatchData` or `MetaData` types
* Changing the semantic meaning of any field in the `MatchData` type, whether as a bug
    fix or feature change

#### Documentation
* [demoinfocs-golang](https://pkg.go.dev/github.com/markus-wa/demoinfocs-golang/v2#section-readme)
* [Gin](https://github.com/gin-gonic/gin)
* [gocron](https://github.com/go-co-op/gocron)
* [fsnotify](https://github.com/fsnotify/fsnotify)
* [golang-jwt/jwt](https://github.com/golang-jwt/jwt)
* [golang-migrate](https://github.com/golang-migrate/migrate)
* [pgx](https://github.com/jackc/pgx)
* [crypto](https://pkg.go.dev/crypto)
