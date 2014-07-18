module.exports = function() {
  var io;
  var http = require('http');
  var server = http.createServer();
  var engine = require('./engine')();
  return {
    listen: function(port) {
      io = require('socket.io').listen(server);
      io.on('connection', function(socket) {
        engine.subscribe('', function(value) {
          socket.emit('value', value);
        });
        socket.on('set', function(value, ack) {
          engine.set('', value, ack);
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