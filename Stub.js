var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var portFinder = require('svp-portfinder');

function Stub(log){
  this.log = log;
  this.app = express();
  this.app.use(require('express-bunyan-logger')({
    logger: this.log
  }));
  this.app.use(bodyParser.json())
  this.server = http.createServer(this.app);
  this.router = express.Router();
  this.app.use(this.router);
  this.routes = {};
  this.responses = {};
}

Stub.prototype.start = function(_port){
  var portPromise = _port ? Promise.resolve(_port) : portFinder();
  return portPromise
    .then((port) => {
      return new Promise((resolve, reject) => {
        this.server.listen(port);
        this.server.on('listening', () => {
          this.log.info('Stub listening on '+port);
          var url = 'http://localhost:' + port;
          resolve(url);
        });
        this.server.on('error', (e) => {
          this.log.info({err: e.message}, 'Stub error');
          reject(e);
        });
    });
  });
};

Stub.prototype.addRoute = function(name, path, fun){
  var self = this;
  if ( ! self.routes[name] ) self.routes[name]=[];
  self.log.info({routes: self.routes, path: path});
  self.router.all(path, function(req,res) {
    var call = {
      method: req.method,
      params: req.params,
      body: req.body,
      query: req.query,
    };
    self.routes[name].push(call);
    if ( fun ) fun(req,res);
    else res.status(200).json({name: 'rest stub route:'+name});
  });
  return Promise.resolve();
};

Stub.prototype.setResponse = function(name, path, obj, status) {
  this.routes[name] = this.routes[name] || [];

  // if this hasn't been previously configured; add the route
  if(!this.responses[name]) {
    this.router.all(path, (req, res) => {
      var call = {
        method: req.method,
        params: req.params,
        body: req.body,
        query: req.query,
      };
      this.routes[name].push(call);
      var r = this.responses[name];
      return res.status(r.status).json(r.obj);
    });
  }

  // store the response
  this.responses[name] = {
    obj: obj,
    status: status || 200
  };
};

Stub.prototype.stop = function(){
  var self = this;
  return new Promise( function(resolve) {
    self.server.close();
    self.server.unref();
    resolve();
  });
};

module.exports = Stub;
