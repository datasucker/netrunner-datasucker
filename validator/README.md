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


Testing an HTTPS Datasucker
---

If you try to validate a Datasucker over HTTPS, the requests will fail if the
CA certificate used to sign the Datasucker's certificate isn't in Node's
distribution of CA certificates (such as if you've signed it with your own
local CA). Sadly, Node doesn't use the host's repository of CA certificates. In
this case, the needed CA certificate must be injected manually using the
`--cacert` option:

    $ npm test --target=https://localhost:8443 --cacert=/etc/ssl/certs/my-root-CA.pem

Alternatively, this can be specified as the `extraCaCert` key in `test-params.js`.

Using either of these methods to inject an extra CA certificate requires the
module `ssl-root-cas`, which is specified as an optional dependency.
