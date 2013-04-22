var socket = io.connect('http://stagemanager.herokuapp.com')
var nextId = null
var display = 'timer'

$(document).ready(function () {
  socket.emit('setRoom', { room: room })
  
  /* !--- Add New Segment Row --- */

  socket.on('createSegment', function(data) {
    //segmentList[data.rowId] = {title: data.rowTitle, trt: data.rowTrt, type: data.rowType, order: data.rowOrder}
    if (data.rowType == 'red') {
      $('#list ul#flow').append('<li id="'+data.rowId+'" class="header red"><div class="title">'+data.rowTitle+'</div></li>')
    } else if ( data.rowType == 'green') {
      $('#list ul#flow').append('<li id="'+data.rowId+'" class="header green"><div class="title">'+data.rowTitle+'</div></li>')
    } else if ( data.rowType == 'blue') {
      $('#list ul#flow').append('<li id="'+data.rowId+'" class="header blue"><div class="title">'+data.rowTitle+'</div></li>')
    } else {
      $('#list ul#flow').append('<li id="'+data.rowId+'"><div class="icon"><img src="../img/ico_'+data.rowType+'.png" /></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div></li>')
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
    $('#list ul#flow li#'+data.rowId).remove()
  })
  
  /* !--- Reorder Segments --- */

  socket.on('updateReorder', function(data) {
    $('ul#flow').append('<li>Another</li>')
    //$('#list ul#flow').after('<ul id="new"><li>this works</li></ul>')
    $('ul#flow > li').clone().appendTo('ul#temp')
    $('ul#flow').empty()
    var i = 0
    data.sortedIds.forEach(function(id) {
      $('ul#flow').append($('ul#temp li#'+sortedIds[i]))  /// STILL WORKING RIGHT HERE!
      //segmentList[id].order = i
      i++
    })
    $('ul#temp').empty()
  })
  
  
    // CHECK ABOVE HERE!!!
  
  /* !--- Update Header --- */
  socket.on('updateHeader', function(data) {
    $('#list ul#flow li#'+data.rowId).removeClass('red green blue')
    $('#list ul#flow li#'+data.rowId).addClass(data.rowType)
    $('#list ul#flow li#'+data.rowId+' .title').text(data.rowTitle)
  })
  /* !--- Update Segment --- */
  socket.on('updateSegment', function(data) {
    $('#list ul#flow li#'+data.rowId+' .icon img').attr('src','../img/ico_'+data.rowType+'.png')
    $('#list ul#flow li#'+data.rowId+' .title').text(data.rowTitle)
    $('#list ul#flow li#'+data.rowId+' .trt').text(data.rowTrt)
    if(data.rowId == current) {
      $('#stage #currentTitle').text($('#list ul#flow li#'+current+' .title').text())
    }
    if(data.rowId == nextId) {
      $('#stage #nextTitle').text($('#list ul#flow li#'+nextId+' .title').text())
      $('#stage #nextTrt').text($('#list ul#flow li#'+nextId+' .trt').text())
    }
  })
  
  /* !--- Current Segment --- */
  if (current != '') {
    currentTrt = $('#list ul#flow li#'+current+' .trt').text()
    $('#list ul#flow li').removeClass('highlight')
    $('#list ul#flow li#'+current).addClass('highlight')
    // Find Next
    nextId = $('#list ul#flow li#'+current).next().attr('id')
    if(nextId == '') {nextId = null}
    
    $('#stage #currentTitle').text($('#list ul#flow li#'+current+' .title').text())
    if(nextId != null) {
      $('#stage #nextTitle').text($('#list ul#flow li#'+nextId+' .title').text())
      $('#stage #nextTrt').text($('#list ul#flow li#'+nextId+' .trt').text())
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
      $('#list ul#flow li').removeClass('highlight')
      $('#list ul#flow li#'+current).addClass('highlight')
      
      // Find Next
      var order = data.rowOrder
      nextId = null
      nextId = $('#list ul#flow li#'+current).next().attr('id')
      
      $('#stage #currentTitle').text($('#list ul#flow li#'+current+' .title').text())
      if(nextId != null) {
        $('#stage #nextTitle').text($('#list ul#flow li#'+nextId+' .title').text())
        $('#stage #nextTrt').text($('#list ul#flow li#'+nextId+' .trt').text())
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
        $('#list ul#flow li#'+current+' .trt').removeClass('inTheRed')
      } else if(total < 0) {
        min = Math.abs(Math.floor((total/60)+1))
        sec = Math.abs(Math.floor(((total)%60)+1))
        $('#stage #currentTimer').addClass('inTheRed')
        $('#list ul#flow li#'+current+' .trt').addClass('inTheRed')
      }
      if(sec<10){sec='0'+sec}
      $('#stage #currentTimer').text(min + ':' + sec)
      $('#list ul#flow li#'+current+' .trt').text(min + ':' + sec)
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