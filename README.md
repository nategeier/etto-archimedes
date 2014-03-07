etto-archimedes
===============================================================================

Coursetto's Backend

The main entry point is `./index.js` so a good ol'...

    npm i
    node index.js

...after cloning the repo will fire things up!

Configuration
-------------------------------------------------------------------------------

The `config` directory contains four JSON config files:
`defualt.json`, `development.json`, `test.json`, `production.json`

A fifth `local.json` file may also be created and is ignored by git.

These files setup various settings used throughout the backend, such as
Mongo and Redis connection configuration.

Grunt Tasks
-------------------------------------------------------------------------------

### Default

    grunt

The main test command, destined for continuous delivery greatness,  which runs:

 - jshint
 - jsbeautify
 - mocha

Green === GOOOO!

### Watch (Testing)

    grunt watch

Sets `NODE_ENV=test` and runs `mocha` when files change.

*Lean on this command the most while writing code.* It is the screaming V8 of
our TDD Ferrari F138. Or. Something.

### Generate Documentation

    grunt dox

Documentation is generated using dox (via grunt-dox and dox-foundation) from
JSDoc comments contained throughout the code.

The generated `docs` directory is ignored by git, so avoid making any edits there.

### Serve Documentation

    grunt serve:dox

Launches a livereload server on port 8080 and watches for code changes.

### Generate Code Coverage Report

    grunt coverage

Generates a code coverage report at `coverage/report.html`

Aim for 100%!

Etcetera
-------------------------------------------------------------------------------

### nginx Config

`etc/nginx/coursetto.com` is currently suitable only for development.

For production, instead of passing all 404s back to `index.html` routes will
need to be defined explicitly. Perhaps via a Grunt task?

### Postman Collections and Environments

Available in `etc/postman/`

Add appropriate requests and update these configs as new routes are added.
