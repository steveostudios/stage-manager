/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express')
  , fs = require('fs')
  , passport = require('passport')
  , http = require('http')
  , server = http.createServer(app)

require('express-namespace')

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , auth = require('./authorization')

// Bootstrap db connection
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/app/models'
  , model_files = fs.readdirSync(models_path)
model_files.forEach(function (file) {
  require(models_path+'/'+file)
})

// bootstrap passport config
require('./config/passport').boot(passport, config)

var app = express()                                       // express app
require('./settings').boot(app, config, passport)         // Bootstrap application settings

// Bootstrap routes
require('./config/routes')(app, passport, auth)

// Start the app by listening on <port>
var port = process.env.PORT || 3000
var io = require('socket.io').listen(app.listen(port))

console.log('Express app started on port '+port)
var currentId = ''
  var future = null
io.sockets.on('connection', function (socket) {
  // Join Room (EventName)
  var room = '';
  socket.on('setRoom', function (data) {
    room = data.room
    socket.join(data.room)
    console.log('logged into room: ' + data.room)
  });
  
  var events = require('./app/controllers/events')
  var segments = require('./app/controllers/segments')
  socket.on('eventSave', function (data) {
    events.saveEvent(data)
    io.sockets.in(room).emit('updateEvent', data)
  });
  socket.on('segmentSave', function (data) {
    segments.saveRow(data)
    io.sockets.in(room).emit('updateSegment', data)
  });
  socket.on('segmentCreate', function (data) {
    data.rowId = segments.createRow(data)
    io.sockets.in(room).emit('createSegment', data)
  });
  socket.on('segmentCurrent', function (data) {
    events.saveCurrent(data)
    segments.saveCurrent(data)
    currentId = data.rowId
    var temp = data.rowTrt
    var split = temp.split(':')
    var add = (split[0]*60000)+(split[1]*1000)+1000
    var today = new Date()
    future = new Date(today.getTime() + add)
    //future.setDate(future.getSeconds() + add)
    io.sockets.in(room).emit('updateCurrent', data)
  });
  socket.on('segmentRemove', function (data) {
    segments.removeRow(data)
    io.sockets.in(room).emit('updateRemove', data)
  });
  socket.on('segmentReorder', function (data) {
    segments.reorderRows(data)
    io.sockets.in(room).emit('updateReorder', data)
  });
  socket.on('clockClear', function (data) {
    data.rowId = ''
/*
    currentId = ''
    future = null
*/
    events.saveCurrent(data)
    io.sockets.in(room).emit('updateCurrent', data)
  });

/*
function updateCurrentTime() {
    setTimeout(updateCurrentTime, 1000)
    var today = new Date()
    var period = 'AM'
    var h = today.getHours()
    if(h > 12){h = h-12;period='PM'}
    var m = today.getMinutes()
    if(m < 10){m = '0'+m}
    if (currentId != '') {
      var diff = new Date(future - today)
      var tm = diff.getMinutes()
      if(tm < 10){tm = '0'+tm}
      var ts = diff.getSeconds()
      if(ts < 10){ts = '0'+ts}
      timer = tm+':'+ts
    } else {
      timer = ''
    }
    io.sockets.in(room).emit('updateCurrentTime', {time: h+':'+m+period, timer: timer})
  }
  
  updateCurrentTime()
*/

  
});
