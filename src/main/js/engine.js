var q = require('q');
var im = require('im');

module.exports = function() {
  var subscribers = {};
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
      return this.set(path, last.push(value));
    }
  };
}