var express = require('express');
var http = require('http');
var lodash = require('lodash');
var Promise = require('bluebird');
var bodyParser = require('body-parser');

function Stub(log){
  this.log = log;
  this.app = express();
  this.app.use(require('express-bunyan-logger')({
    logger: this.log
  }));
  this.app.use(bodyParser.json())
  this.server = http.Server(this.app);
  this.router = express.Router();
  this.app.use(this.router);
  this.routes = {};
};

Stub.prototype.start = function(port){
  var self = this;
  return new Promise( function(resolve) {
    self.server.listen(port);
    self.server.on('listening', function() {
      self.log.info('Stub listening on '+port);
      resolve();
    });
  });
};

Stub.prototype.addRoute = function(name,path, fun){
  var self = this;
  return new Promise ( function(resolve,reject) {
    if ( ! self.routes[name] ) self.routes[name]=[];
    self.log.info({routes: self.routes, path: path});
    self.router.all(path, function(req,res,next) {
      self.routes[name].push({method: req.method, params: req.params, body: req.body});
      if ( fun ) fun(req,res);
      else res.status(200).json({name: 'rest stub route:'+name});
    });
    resolve();
  });
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
