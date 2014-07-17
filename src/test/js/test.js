var PORT = 9090;

var io = require('socket.io').listen(PORT);
io.on('connection', function(socket) {
  socket.on('set', function(value) {
    socket.emit('value', value);
  })
});

require('./env');

describe('server', function() {
  it('can store an object', function(done) {
    var io = require('socket.io-client')('http://localhost:' + PORT);
    io.on('value', function(val) {
      expect(val).to.eql({ a: 1, b: '2'});
      done();
    });

    io.emit('set', {a: 1, b: '2'});
  });
});