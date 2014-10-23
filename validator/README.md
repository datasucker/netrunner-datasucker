Datasucker API compliance validator
===

This is a utility that tests whether a target Datasucker satisfies the
[Required API][required-api].

[required-api]: https://github.com/datasucker/netrunner-datasucker#required-api


Usage
---

    $ npm install && npm test --target='http://my.datasucker.domain:8080'

That's it!


Alternative usage
---

Set the base URL (without trailing slash) of the Datasucker to test in
`test-params.js`:


    module.exports = _.defaults({
        // ...
    }, {
        // Default parameter values
        // ...
        targetBaseUrl: 'http://my.datasucker.domain:8080',
    });

Then simply run it as

    $ npm test

If you specify `--target=URL` on the command line, that will override the
setting in the file.
