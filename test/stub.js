var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
var bunyan = require('bunyan');
var request = require('request-promise');

var Stub = require('../Stub');

describe('Stub', () => {
  var stub, stubUrl;
  var logOpts = {
    name: 'stub',
    streams: [{path: 'mocha.log', level: 'debug'}],
    serializers: bunyan.stdSerializers,
  };
  var log = bunyan.createLogger(logOpts);
  log.info('logger created');

  it('start a stub', () => {
    stub = new Stub(log);
    return stub.start()
      .then((url) => stubUrl = url);
  });

  it('register a handler', () => {
    var route = function(req, res) {
      return res.status(200).json({foo: 'test succeeded'});
    };
    stub.addRoute('test', '/test', route);
  });

  it('call handler', () => {
    return request(stubUrl + '/test')
      .then(() => {
        log.debug({stub: stub.routes}, 'look correct?');
        stub.routes.test.should.be.an('array').of.length(1);
        stub.routes.test[0].should.have.property('method', 'GET');
        stub.routes.test[0].params.should.be.empty;
        stub.routes.test[0].query.should.be.empty;
        stub.routes.test[0].body.should.be.empty;
      });
  });

  it('call handler w/ query param', () => {
    return request(stubUrl + '/test?cursor=foo&count=1')
      .then(() => {
        log.debug({stub: stub.routes}, 'look correct?');
        stub.routes.test.should.be.an('array').of.length(2);
        stub.routes.test[1].should.have.property('method', 'GET');
        stub.routes.test[1].params.should.be.empty;
        stub.routes.test[1].query.should.not.be.empty;
        stub.should.have.deep.property('routes.test[1].query.cursor', 'foo');
        stub.should.have.deep.property('routes.test[1].query.count', '1');
        stub.routes.test[1].body.should.be.empty;
      });
  });

  it('call handler w/ path param', () => {
    var route = function(req, res) {
      return res.status(200).json({foo: 'test succeeded'});
    };
    stub.addRoute('paramTest', '/paramHandler/:param', route);
    return request(stubUrl + '/paramHandler/123')
      .then(() => {
        log.debug({stub: stub.routes}, 'look correct? (param)');
        var testObj = stub.routes.paramTest;
        testObj.should.be.an('array').of.length(1);
        testObj[0].should.have.property('method', 'GET');
        testObj[0].params.should.not.be.empty;
        testObj[0].query.should.be.empty;
        testObj.should.have.deep.property('[0].params.param', '123');
        testObj[0].body.should.be.empty;
      });
  });

  it('call handler w/ body', () => {
    var route = function(req, res) {
      return res.status(200).json({foo: 'test succeeded'});
    };
    stub.addRoute('bodyTest', '/bodyHandler', route);
    var reqObj = {
      url: stubUrl + '/bodyHandler',
      method: 'POST',
      json: {foo: 123, bar: 'abc'},
    };
    return request(reqObj)
      .then(() => {
        log.debug({stub: stub.routes}, 'look correct? (body)');
        var testObj = stub.routes.bodyTest;
        testObj.should.be.an('array').of.length(1);
        testObj[0].should.have.property('method', 'POST');
        testObj[0].params.should.be.empty;
        testObj[0].query.should.be.empty;
        testObj[0].body.should.not.be.empty;
        testObj.should.have.deep.property('[0].body.foo', 123);
        testObj.should.have.deep.property('[0].body.bar', 'abc');
      });
  });

  it('call w/o handler', () => {
    return request(stubUrl + '/nohandler')
      .catch((reason) => {
        reason.statusCode.should.equal(404);
      });
  });

  it('stop a stub', () => {
    log.info({url: stubUrl}, 'stubUrl');
    log.debug({stub: stub}, 'look correct?');
    return stub.stop();
  });
});
