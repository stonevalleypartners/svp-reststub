# svp-reststub: server for creating REST stubs for testing

[![Circle CI](https://circleci.com/gh/stonevalleypartners/svp-reststub.svg?style=svg&circle-token=47d0cca2b56df13e2b84e34eceb9b18c28ae4a7a)](https://circleci.com/gh/stonevalleypartners/svp-reststub)

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

