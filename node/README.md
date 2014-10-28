node.js Datasucker
===

Usage:

    $ npm install && npm start

To fetch data from CardGameDB, run the following while an instance is running:

    $ npm run update


HTTPS
---

If the following files are present, the Datasucker will set up HTTPS servers
instead of bare HTTP:

 - `ssl/key.pem` - Private key file
 - `ssl/cert.pem` - Certificate file (public key with CA signature)
