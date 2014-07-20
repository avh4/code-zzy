var q = require('q');
var im = require('im');

function newSubs() {
  return {
    subscribers: {},
    subscribe: function(path, callback) {
      if (!this.subscribers[path]) this.subscribers[path] = [];
      this.subscribers[path].push(callback);
    },
    update: function(path, newValue) {
      if (this.subscribers[path]) {
        this.subscribers[path].forEach(function(sub) {
          sub(newValue);
        });
      }
    }
  };
}

module.exports = function() {
  var subs = newSubs();
  var indexes = im.map();
  var lastValues = im.map();
  var nextId = 100001;
  return {
    subscribe: function(path, callback) {
      subs.subscribe(path, callback);
      callback(lastValues.get(path));
    },
    set: function(path, value) {
      lastValues = lastValues.assoc(path, value);
      subs.update(path, value);
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