var PORT = 9090;

function newServer(port) {
  var lastValue;
  var io;
  var http = require('http');
  var server = http.createServer();
  return {
    start: function() {
      io = require('socket.io').listen(server);
      io.on('connection', function(socket) {
        console.log("CONN", lastValue);
        socket.emit('value', lastValue);
        socket.on('set', function(value, ack) {
          io.emit('value', value);
          lastValue = value;
          ack();
        });
      });
      server.listen(port);
      return this;
    },
    destroy: function() {
      server.close();
    }
  }
}

require('./env');
var q = require('q');

describe('server', function() {
  var server;

  function newClient() {
    return require('socket.io-client').connect('http://localhost:' + PORT, {'force new connection': true });
  }

  beforeEach(function() {
    server = newServer(PORT).start();
  });

  afterEach(function() {
    server.destroy();
  });

  describe('setting a value', function() {
    var client1Value;

    function newSubscribedClient(receiveCount) {
      var client = newClient();
      var p = q.defer();
      var i = 0;
      client.on('value', function(val) {
        if (i++ == receiveCount) p.resolve(val);
      });
      return p.promise;
    }

    beforeEach(function(done) {
      client1Value = newSubscribedClient(1);
      newClient().emit('set', {a: 1, b: '2'}, done);
    });

    it('sends the value to subscribed clients', function() {
      return client1Value.then(function(val) {
        expect(val).to.eql({a: 1, b: '2'});
      });
    });

    it('sends the value to clients that subscribe later', function() {
      return newSubscribedClient(0).then(function(val) {
        expect(val).to.eql({a: 1, b: '2'});
      });
    });
  });
});