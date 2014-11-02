/*
 * grunt-zaproxy
 * https://github.com/prnawa/grunt-zaproxy
 *
 * Copyright (c) 2014 Ruwan Nawarathne
 * Licensed under the MIT license.
 */

var path = require('path');
var spawn = require('child_process').spawn;
var Zaproxy = require('zaproxy');

module.exports = function(grunt) {
  var description = 'Grunt task for the OWASP Zed Attack Proxy (ZAP)';
  grunt.registerTask('zaproxyStart', description, function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      host: 'localhost',
      port: '8080',
      daemon: true,
      binPath: '/usr/local/zap2.3.1/'
    });

    var args = ['-daemon', '-host', options.host, '-port', options.port];

    var cmd =   path.join(options.binPath, 'zap.sh');

    var child = spawn(cmd, args);

    child.on('close', function (code) {
      if (code) {
        grunt.fail.warn('Error launching ZAProxy: ' + code);
      }
    });
    child.on('error', function (err) {
      if (err.code === 'ENOENT') {
        grunt.fail.fatal('Error launching ZAProxy. Make sure that ZAProxy is installed and zap.sh is available on the executable path.');
      }
    });

    // Wait until the proxy is responding
    var done = this.async();
    var retryCount = 0;
    var zaproxy = new Zaproxy({ proxy: 'http://' + options.host + ':' + options.port });
    var wait = function (callback) {
      zaproxy.core.version(function (err) {
        if (err) {
          grunt.log.write('.');
          retryCount += 1;
          if (retryCount > 30) {
            grunt.log.writeln('ZAProxy is taking too long, killing.');
            child.kill('SIGKILL');
            done();
          } else {
            setTimeout(function () {
              wait(callback);
            }, 1000);
          }
        } else {
          zaproxy.core.newSession('', false, function () {
            grunt.log.ok();
            grunt.log.writeln('Zaproxy is started');
            done();
          });
        }
      });
    };
    wait();
  });

  /**
   * Stop a running ZAProxy.
   **/
  grunt.registerTask('zaproxyStop', 'Stop ZAProxy.', function () {
    // Set up options.
    var options = this.options({
      host: 'localhost',
      port: '8080'
    });

    var asyncDone = this.async();


    var zaproxy = new Zaproxy({ proxy: 'http://' + options.host + ':' + options.port });
    grunt.log.write('Stopping ZAProxy: ');
    zaproxy.core.shutdown(function (err) {
      if (err) {
        grunt.log.writeln('ZAProxy does not appear to be running.');
        asyncDone();
        return;
      }

      var retryCount = 0;
      var wait = function (callback) {
        zaproxy.core.version(function (err) {
          if (err) {
            grunt.log.ok();
            asyncDone();
          } else {
            grunt.log.write('.');
            retryCount += 1;
            if (retryCount > 30) {
              grunt.log.writeln('ZAProxy is taking too long, exiting.');
              asyncDone();
            } else {
              setTimeout(function () {
                wait(callback);
              }, 1000);
            }
          }
        });
      };
      wait();
    });
  });
};
