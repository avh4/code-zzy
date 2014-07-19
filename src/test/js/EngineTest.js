var PORT = 9090;

require('./env');
var q = require('q');

describe('engine', function() {
  var engine;

  beforeEach(function() {
    engine = require('../../main/js/engine')();
  });

  function newSubscribedClient(path, receiveCount) {
    var p = q.defer();
    var i = 0;
    engine.subscribe(path, function(val) {
      if (i++ == receiveCount) p.resolve(val);
    });
    return p.promise;
  }

  describe('setting a value', function() {
    var client1Value;

    beforeEach(function() {
      client1Value = newSubscribedClient('', 1);
      return engine.set('', {a: 1, b: '2'});
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

  describe('setting values at different paths', function() {
    it('keeps the values separate', function() {
      var dropboxValue = newSubscribedClient('dropbox', 1);
      var evernoteValue = newSubscribedClient('evernote', 1);
      return q().then(function() {
        return engine.set('dropbox', {username: 'bobama'});
      }).then(function() {
        return engine.set('evernote', {username: 'wadama'});
      }).then(function() {
        return dropboxValue.then(function(val) { expect(val).to.eql({username: 'bobama'})});
      }).then(function() {
        return evernoteValue.then(function(val) { expect(val).to.eql({username: 'wadama'})});
      });
    });

    it('remembers last values', function() {
      return q().then(function() {
        return engine.set('yelp', {username: 'wyankovi'});
      }).then(function() {
        return engine.set('otherStuff', 'junk');
      }).then(function() {
        return newSubscribedClient('yelp', 0);
      }).then(function(val) {
        expect(val).to.eql({username: 'wyankovi'});
      });
    });
  });
});