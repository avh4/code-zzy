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

  describe('adding documents to a collection', function() {
    it('sends the documents to future subscribers', function() {
      var movie;
      return q().then(function() {
        return engine.add('movies', { title: 'Maleficent' });
      }).then(function(_movie) {
        movie = _movie;
        return newSubscribedClient('movies', 0);
      }).then(function(val) {
        expect(val.toArray()).to.eql([ { _id: movie._id, title: 'Maleficent' } ]);
      });
    });

    it('can add a multiple documents', function() {
      var m1, m2;
      return q().then(function() {
        return engine.add('movies', { title: 'Maleficent' });
      }).then(function(_m1) {
        m1 = _m1;
        return engine.add('movies', { title: 'Gravity' });
      }).then(function(_m2) {
        m2 = _m2;
        return newSubscribedClient('movies', 0);
      }).then(function(val) {
        expect(val.toArray()).to.eql([
          { _id: m1._id, title: 'Maleficent' },
          { _id: m2._id, title: 'Gravity' }
        ]);
      });
    });

    it('gives documents different ids', function() {
      return q.all([
        engine.add('movies', { title: 'Maleficent' }),
        engine.add('movies', { title: 'Gravity' })
      ]).spread(function(m1, m2) {
        expect(m1._id).to.not.be.undefined;
        expect(m2._id).to.not.be.undefined;
        expect(m1._id).to.not.eql(m2._id);
      });
    });
  });

  describe('one-to-many indexes', function() {
    it('adding a child updates the parent', function() {
      var flight;
      var passenger;
      return q().then(function() {
        return engine.addIndex('flights', 'passengers', 'flight');
      }).then(function() {
        return engine.add('flights', { number: 107 });
      }).then(function(_flight) {
        flight = _flight;
        expect(flight._id).to.not.be.undefined;
        return engine.add('passengers', { flight: flight._id });
      }).then(function(_passenger) {
        passenger = _passenger;
        expect(passenger._id).to.not.be.undefined;
        return newSubscribedClient('flights', 0);
      }).then(function(val) {
        expect(val.toArray()).to.eql([
          { _id: flight._id, number: 107, passengers: [ passenger._id ] }
        ]);
      });
    });
  });
});