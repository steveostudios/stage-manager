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

io.sockets.on('connection', function (socket) {
  var room = ''
  var events = require('./app/controllers/events')
  var segments = require('./app/controllers/segments')
  var users = require('./app/controllers/users')
  
  socket.on('setRoom', function (data) {
    room = data.room
    socket.join(room)
  });
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
  socket.on('headerSave', function (data) {
    segments.saveRow(data)
    io.sockets.in(room).emit('updateHeader', data)
  });
  socket.on('headerCreate', function (data) {
    data.rowId = segments.createHeader(data)
    io.sockets.in(room).emit('createHeader', data)
  });
  socket.on('segmentCurrent', function (data) {
    var start = new Date()
    data.start = start
    events.saveCurrent(data)
    segments.saveCurrent(data)
    console.log("data: " + data.rowId)
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
    events.saveCurrent(data)
    io.sockets.in(room).emit('updateCurrent', data)
  });
  socket.on('alert', function (data) {
    events.alert(data)
    io.sockets.in(room).emit('alertUpdate', data)
  });
  socket.on('alertFavAdd', function (data) {
    console.log('Add AlertFav: ' + data.alertText )
    users.alertFavAdd(data)
    io.sockets.in(room).emit('alertFavAdded', data)
  });
  socket.on('alertFavRemove', function (data) {
    //events.alert(data)
    //io.sockets.in(room).emit('alertUpdate', data)
  });
  socket.on('alertFavReorder', function (data) {
    //events.alert(data)
    //io.sockets.in(room).emit('alertUpdate', data)
  });
});
