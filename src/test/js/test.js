var PORT = 9090;

require('./env');
var q = require('q');
var Server = require('../../main/js');

describe('server', function() {
  var server;

  function newClient() {
    return require('socket.io-client').connect('http://localhost:' + PORT, {'force new connection': true });
  }

  beforeEach(function() {
    server = Server().listen(PORT);
  });

  afterEach(function() {
    server.close();
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