var q = require('q');
var im = require('im');

module.exports = function() {
  var subscribers = {};
  var indexes = im.map();
  var lastValues = im.map();
  return {
    subscribe: function(path, callback) {
      if (!subscribers[path]) subscribers[path] = [];
      subscribers[path].push(callback);
      callback(lastValues.get(path));
    },
    set: function(path, value) {
      lastValues = lastValues.assoc(path, value);
      if (subscribers[path]) {
        subscribers[path].forEach(function(sub) {
          sub(value);
        });
      }
      return q();
    },
    add: function(path, value) {
      var last = lastValues.get(path);
      if (!last) last = im.vector();
      value._id = 'a';
      if (indexes.get(path)) {
        value[indexes.get(path)] = [ 'a' ];
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