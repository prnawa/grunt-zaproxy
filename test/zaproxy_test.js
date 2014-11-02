var expect = require('chai').expect;
var path = require('path');
var exec = require('child_process').exec;
var gruntExec = path.resolve('node_modules/grunt-cli/bin/grunt');
var ZapClient = require('zaproxy');

var execScenario = function(scenario, callback) {
  var scenarioDir = __dirname + '/scenarios/' + scenario;
  exec(gruntExec, {cwd: scenarioDir}, callback);
};

describe('zaproxyStart', function() {
  it('should start proxy', function(done) {
    execScenario('start', function(error, stdout) {
      expect(stdout).to.match(/Zaproxy is started/);
      var options = { proxy: 'http://localhost:8080' };
      var zaproxy = new ZapClient(options);
      zaproxy.core.version(function (err) {
        expect(err).to.be.null;
        done();
      });
    });
  });
});

describe('zaproxyStop', function() {
  it('should stop already running proxy', function(done) {
    execScenario('stop', function(error, stdout) {
      expect(stdout).to.match(/Zaproxy is started/);
      var options = { proxy: 'http://localhost:8081' };
      var zaproxy = new ZapClient(options);
      zaproxy.core.version(function (err) {
        expect(err).not.to.be.null;
        done();
      });
    });
  });
});