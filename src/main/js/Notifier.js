var im = require('im');

function Notifier(data) {
  this.data = data;
  this.subscriptions = im.vector();
}

Notifier.prototype.subscribe = function(path, callback) {
  this.subscriptions = this.subscriptions.push({ path: path, callback: callback });
  callback(this.data.get(path));
};

Notifier.prototype.update = function(newData) {
  var oldData = this.data;
  this.data = newData;
  this.subscriptions.forEach(function(sub) {
    var oldVal = oldData.get(sub.path);
    var newVal = newData.get(sub.path);
    if (oldVal == newVal) return;
    sub.callback(newData.get(sub.path));
  });
}

module.exports = Notifier;