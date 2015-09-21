# svp-reststub: server for creating REST stubs for testing

## install

`npm install --save-dev git@github.com:stonevalleypartners/svp-reststub.git`

## use

```
var log = require('bunyan').createLogger();
var rest = new require('svp-reststub')(log);

return rest.start(port)
  .then(() => {
    rest.addRoute(string, path, func);
  })
```
