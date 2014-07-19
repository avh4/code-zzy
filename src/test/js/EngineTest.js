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

  describe('setting values at different paths', function() {
    it('keeps the values separate', function() {
      dropboxValue = newSubscribedClient('dropbox', 1);
      evernoteValue = newSubscribedClient('evernote', 1);
      engine.set('dropbox', {username: 'bobama'});
      engine.set('evernote', {username: 'wadama'});
      return q.all([
        dropboxValue.then(function(val) { expect(val).to.eql({username: 'bobama'})}),
        evernoteValue.then(function(val) { expect(val).to.eql({username: 'wadama'})}),
      ]);
    });

    it('doesn\'t blow up when setting a path that is not subscribed to', function() {
      engine.set('secretToEverybody', 'jewel');
    });
  });
});