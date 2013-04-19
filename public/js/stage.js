var socket = io.connect('http://stagemanager.herokuapp.com')
var nextId = null
var display = 'timer'

$(document).ready(function () {
  socket.emit('setRoom', { room: room })
  
  /* !--- Add New Segment Row --- */

  socket.on('createSegment', function(data) {
    //segmentList[data.rowId] = {title: data.rowTitle, trt: data.rowTrt, type: data.rowType, order: data.rowOrder}
    if (data.rowType == 'red') {
      $('#list ul').append('<li id="'+data.rowId+'" class="header red"><div class="title">'+data.rowTitle+'</div></li>')
    } else if ( data.rowType == 'green') {
      $('#list ul').append('<li id="'+data.rowId+'" class="header green"><div class="title">'+data.rowTitle+'</div></li>')
    } else if ( data.rowType == 'blue') {
      $('#list ul').append('<li id="'+data.rowId+'" class="header blue"><div class="title">'+data.rowTitle+'</div></li>')
    } else {
      $('#list ul').append('<li id="'+data.rowId+'"><div class="icon"><img src="../img/ico_'+data.rowType+'.png" /></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div></li>')
    }
  })
  
  /* !--- Remove Segment --- */
  socket.on('updateRemove', function(data) {
    if (data.rowId == current) {
      $('#stage #currentTitle').text('')
      $('#stage #currentTimer').text('')
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
      })
      current = ''
      currentTrt = null
    } else if (data.rowId == nextId) {
      
      // TODO
       
    }
    $('#list ul li#'+data.rowId).remove()
  })
  
  /* !--- Reorder Segments --- */

  socket.on('updateReorder', function(data) {
    //var i = 0
    //data.sortedIds.forEach(function(id) {
      //$('#list ul').append()
      //segmentList[id].order = i
      //i++
    //})
    //alert('sorted: '+data.sortedIds)
  })
  
  
    // CHECK ABOVE HERE!!!
  
  
  /* !--- Update Segment --- */
  socket.on('updateSegment', function(data) {
    if (data.rowType != 'red' && data.rowType != 'green' && data.rowType != 'blue')
      $('#list ul li#'+data.rowId+' .icon img').attr('src','../img/ico_'+data.rowType+'.png')
      $('#list ul li#'+data.rowId+' .title').text(data.rowTitle)
      $('#list ul li#'+data.rowId+' .trt').text(data.rowTrt)
    } else {
      $('#list ul li#'+data.rowId).removeClass('red green blue')
      $('#list ul li#'+data.rowId).addClass(data.rowType)
      $('#list ul li#'+data.rowId+' .title').text(data.rowTitle)
    }
    if(data.rowId == current) {
      $('#stage #currentTitle').text($('#list ul li#'+current+' .title').text())
    }
    if(data.rowId == nextId) {
      $('#stage #nextTitle').text($('#list ul li#'+nextId+' .title').text())
      $('#stage #nextTrt').text($('#list ul li#'+nextId+' .trt').text())
    }
  })
  
  /* !--- Current Segment --- */
  if (current != '') {
    currentTrt = $('#list ul li#'+current+' .trt').text()
    $('#list ul li').removeClass('highlight')
    $('#list ul li#'+current).addClass('highlight')
    // Find Next
    nextId = $('#list ul li#'+current).next().attr('id')
    if(nextId == '') {nextId = null}
    
    $('#stage #currentTitle').text($('#list ul li#'+current+' .title').text())
    if(nextId != null) {
      $('#stage #nextTitle').text($('#list ul li#'+nextId+' .title').text())
      $('#stage #nextTrt').text($('#list ul li#'+nextId+' .trt').text())
      $('#stage #next').slideDown('fast')
    } else {
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
      })    
    }
  } else {
    currentTrt = ''
  }
  
  socket.on('updateCurrent', function(data) {
    var id = data.rowId
    current = id
    if(id != '') {
      
      currentStart = data.start
      currentTrt = data.rowTrt
      $('#list ul li').removeClass('highlight')
      $('#list ul li#'+current).addClass('highlight')
      
      // Find Next
      var order = data.rowOrder
      nextId = null
      nextId = $('#list ul li#'+current).next().attr('id')
      
      $('#stage #currentTitle').text($('#list ul li#'+current+' .title').text())
      if(nextId != null) {
        $('#stage #nextTitle').text($('#list ul li#'+nextId+' .title').text())
        $('#stage #nextTrt').text($('#list ul li#'+nextId+' .trt').text())
        $('#stage #next').slideDown('fast')
      } else {
        $('#stage #next').slideUp('fast', function() {
          $('#stage #nextTitle').text('')
          $('#stage #nextTrt').text('')
        })
      }
    } else {
      currentTrt = null
      $('#stage #currentTitle').text('')
      $('#stage #currentTimer').text('')
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
      })
    }
  })
  
  function tick() {
    if(current != ''){
      var now = new Date()
      var start = new Date(currentStart)
      var diff = (now - start) / 1000
      var trtArray = currentTrt.split(':')
      var trt = parseInt(trtArray[0]*60)+parseInt(trtArray[1])
      var total = trt - diff
      var min = null
      var sec = null
      if(total >= 0) {
        min = Math.abs(Math.floor(total/60))
        sec = Math.abs(Math.floor(total%60))
        $('#stage #currentTimer').removeClass('inTheRed')
        $('#list ul li#'+current+' .trt').removeClass('inTheRed')
      } else if(total < 0) {
        min = Math.abs(Math.floor((total/60)+1))
        sec = Math.abs(Math.floor((total+1)%60))
        $('#stage #currentTimer').addClass('inTheRed')
        $('#list ul li#'+current+' .trt').addClass('inTheRed')
      }
      if(sec<10){sec='0'+sec}
      $('#stage #currentTimer').text(min + ':' + sec)
      $('#list ul li#'+current+' .trt').text(min + ':' + sec)
    } else {
    
      // Do nothing?
      
    }
    setTimeout(tick, 1000)

  }
  tick()
  /* !--- Current Time --- */
  var currentTime = null
  function getCurrentTime() {
    var date = new Date()
    var hour = date.getHours()
    var period = 'AM'
    if(hour>11){period = 'PM'}
    if(hour == 0){hour = 12}
    if(hour>12){hour = hour-12}
    var minute = date.getMinutes()
    if(minute<10){minute = '0'+minute}
    currentTime = hour + ':' + minute
    $('.time span.actualtime').text(currentTime)
    $('.time span.period').text(period)
    setTimeout(getCurrentTime,1000)
  }
  getCurrentTime()
  
  /* !--- Alerts --- */
  if (alert != '') {
    $('div#stage div#alert').text(alert)
    $('div#stage div#alert').css('top','0')
  }
  socket.on('alertUpdate', function(data) {
    if(data.alertText == '') {
      $('div#stage div#alert').animate({
        top: '-360px'
      }, 1000, function() {
        $('div#stage div#alert').text(data.alertText)
      })
    } else {
      $('div#stage div#alert').text(data.alertText)
      $('div#stage div#alert').animate({
        top: '0'
      })
    }    
  })
})