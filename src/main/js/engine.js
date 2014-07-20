var q = require('q');
var im = require('im');

var Notifier = require('./Notifier');

module.exports = function() {
  var indexes = im.map();
  var lastValues = im.map();
  var notifier = new Notifier(lastValues);
  var nextId = 100001;
  return {
    subscribe: function(path, callback) {
      notifier.subscribe(path, callback);
    },
    set: function(path, value) {
      lastValues = lastValues.assoc(path, value);
      notifier.update(lastValues);
      return q();
    },
    add: function(path, value) {
      var last = lastValues.get(path);
      if (!last) last = im.vector();
      value._id = nextId++;
      if (indexes.get(path)) {
        value[indexes.get(path)] = [ value._id+1 ];
      }
      return this.set(path, last.push(value)).then(function() {
        return value;
      });
    },
    addIndex: function(parent, child, childField) {
      indexes = indexes.assoc(parent, child);
    }
  };
}