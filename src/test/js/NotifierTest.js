require('./env');
var sinon = require('sinon');
var expect = require('./expect');
var im = require('im');

var Notifier = require('../../main/js/Notifier');

describe('Notifier', function() {
  var subject;

  beforeEach(function() {
    data = im.map().assoc('flights', im.map().assoc('aaa', { number: 205 }));
    subject = new Notifier(data);
  });

  it('notifies subscribers when they first subscribe', function() {
    var callback = sinon.spy();
    subject.subscribe('flights', callback);
    expect(callback).toHaveBeenCalledWith(function(arg) {
      expect(arg.toObject()).toEqual({ aaa: { number: 205 }});
    });
  });

  it('notifies subscribers when the data changes', function() {
    var callback = sinon.spy();
    subject.subscribe('flights', callback);
    callback.reset();

    subject.update(data.assoc('flights', data.get('flights').assoc('bbb', { number: 109 })));
    expect(callback).toHaveBeenCalledWith(function(arg) {
      expect(arg.toObject()).toEqual({ aaa: { number: 205}, bbb: { number: 109 }});
    });
  });
});