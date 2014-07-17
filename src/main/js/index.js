module.exports = function() {
  var lastValue;
  var io;
  var http = require('http');
  var server = http.createServer();
  return {
    listen: function(port) {
      io = require('socket.io').listen(server);
      io.on('connection', function(socket) {
        socket.emit('value', lastValue);
        socket.on('set', function(value, ack) {
          io.emit('value', value);
          lastValue = value;
          ack();
        });
      });
      server.listen(port);
      return this;
    },
    close: function() {
      server.close();
    }
  }
}