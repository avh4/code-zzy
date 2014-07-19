module.exports = function() {
  var subscribers = {};
  var lastValue;
  return {
    subscribe: function(path, callback) {
      if (!subscribers[path]) subscribers[path] = [];
      subscribers[path].push(callback);
      callback(lastValue);
    },
    set: function(path, value, callback) {
      lastValue = value;
      subscribers[path].forEach(function(sub) {
        sub(value);
      });
      if (callback) callback();
    }
  };
}