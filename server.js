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
//app.listen(port)
console.log('Express app started on port '+port)

io.sockets.on('connection', function (socket) {
  socket.join('room1')
  var events = require('./app/controllers/events')
  var segments = require('./app/controllers/segments')

    socket.on('segmentSave', function (data) {
      segments.saveRow(data)
      io.sockets.in('room1').emit('updateSegment', data)
    });
    socket.on('segmentCreate', function (data) {
      segments.createRow(data)
      io.sockets.in('room1').emit('createSegment', data)
    });
    socket.on('segmentCurrent', function (data) {
      events.saveCurrent(data) // Save to DB
      //console.log(data.rowId)
      io.sockets.in('room1').emit('updateCurrent', data)
    });
    
});
