# Development

Puggies is developed with Go, React and Docker. If you want to contribute to Puggies you
will need the following tools installed on your computer:

* [Git](https://git-scm.com/)
* [Go](https://go.dev/)
* [NodeJS LTS](https://nodejs.org/en/)
* [Yarn](https://classic.yarnpkg.com/lang/en/)
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/install/)

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

**Chakra components should be used exclusively on the frontend** (use `<Box>` / `<Flex>`
/ `<Text>` as opposed to plain React components like `<div>` or `<p>`).

The Puggies backend also has a few dependencies. You might find the documentation for
these useful:

* [demoinfocs-golang](https://pkg.go.dev/github.com/markus-wa/demoinfocs-golang/v2#section-readme)
* [Gin](https://github.com/gin-gonic/gin)
* [gocron](https://github.com/go-co-op/gocron)
* [fsnotify](https://github.com/fsnotify/fsnotify)
