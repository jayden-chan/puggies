## Description of the change

> Describe your changes in detail

## Type of change

- [ ] Refactoring (no change in functionality)
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation or Development tools (readme, specs, tests, code formatting)

## Checklists

### Development

- [ ] [Prettier](https://www.npmjs.com/package/prettier) was run on frontend
- [ ] `go fmt` was run on backend

##### (if new config variable was added):
- [ ] Configuration documentation was updated 
- [ ] Docker Compose example file was updated (for required variables with no default)

##### (if new dependency was added):
- [ ] New dependencies have been audited and are justified
- [ ] Development documentation has been updated

##### (if database schema was updated):
- [ ] New database migrations have been generated with `migrate` tool
- [ ] Migrations have been tested in both directions (cleanly migrates up and down)

### Paperwork

- [ ] This pull request has a descriptive title and information useful to a reviewer
- [ ] `AUTHORS.txt` was updated if there are new contributors (welcome!)

### Code review

- [ ] Security impacts of this change have been considered
