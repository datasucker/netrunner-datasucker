Datasucker API compliance validator
===

This is a utility that tests whether a target Datasucker satisfies the
[Required API][required-api].

Usage
---

 1. Set the base URL, without trailing slash, of the Datasucker to test in
 `test-params.js`:

      module.exports = {
          targetBaseUrl: 'http://my.datasucker.domain:8080',
      };

 2. Run the test:

        $ npm install && npm test


[required-api]: https://github.com/datasucker/netrunner-datasucker#required-api
