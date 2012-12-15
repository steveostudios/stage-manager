var socket = io.connect('http://localhost');

$(document).ready(function () {
  socket.emit('setRoom', { room: room });
  
  socket.on('updateCurrentTime', function(data) {
    $('#stage #time').text(data.time)
    $('#stage #currentTimer').text(data.timer)
  })
})