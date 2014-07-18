module.exports = function() {
  var subscribers = [];
  var lastValue;
  return {
    subscribe: function(path, callback) {
      subscribers.push(callback);
      callback(lastValue);
    },
    set: function(path, value, callback) {
      lastValue = value;
      subscribers.forEach(function(sub) {
        sub(value);
      });
      callback();
    }
  };
}