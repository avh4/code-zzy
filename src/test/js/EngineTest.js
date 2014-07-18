var PORT = 9090;

require('./env');
var q = require('q');

describe('engine', function() {
  var engine;

  beforeEach(function() {
    engine = require('../../main/js/engine')();
  });

  describe('setting a value', function() {
    var client1Value;

    function newSubscribedClient(path, receiveCount) {
      var p = q.defer();
      var i = 0;
      engine.subscribe(path, function(val) {
        if (i++ == receiveCount) p.resolve(val);
      });
      return p.promise;
    }

    beforeEach(function(done) {
      client1Value = newSubscribedClient('', 1);
      engine.set('', {a: 1, b: '2'}, done);
    });

    it('sends the value to subscribed clients', function() {
      return client1Value.then(function(val) {
        expect(val).to.eql({a: 1, b: '2'});
      });
    });

    it('sends the value to clients that subscribe later', function() {
      return newSubscribedClient('', 0).then(function(val) {
        expect(val).to.eql({a: 1, b: '2'});
      });
    });
  });
});