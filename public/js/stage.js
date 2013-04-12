var socket = io.connect('http://stagemanager.herokuapp.com')
var nextId = null
var currentTrt = null
var display = 'timer'

$(document).ready(function () {
  socket.emit('setRoom', { room: room })
  
  /* !--- Add New Segment Row --- */
  socket.on('createSegment', function(data) {
    segmentList[data.rowId] = {title: data.rowTitle, trt: data.rowTrt, type: data.rowType, order: data.rowOrder}
    if (current != '') {
      // Find Next
      var order = segmentList[current].order
      for(var propt in segmentList) {
        if(segmentList[propt].order == (parseInt(order) + 1)){
          nextId = propt
        }
      }
      if(nextId != null) {
        alert('current: '+segmentList[current].order+', next: '+segmentList[nextId].order)
        $('#stage #nextTitle').text(segmentList[nextId].title)
        $('#stage #nextTrt').text(segmentList[nextId].trt)
        $('#stage #next').slideDown('fast')
      }
    }
  })
  
  /* !--- Remove Segment --- */
  socket.on('updateRemove', function(data) {
    delete segmentList[data.rowId]
  })
  
  /* !--- Reorder Segments --- */
  socket.on('updateReorder', function(data) {
    var i = 0
    data.sortedIds.forEach(function(id) {
      segmentList[id].order = i
      i++
    })
  })
  
  /* !--- Update Segment --- */
  socket.on('updateSegment', function(data) {
    segmentList[data.rowId] = {title: data.rowTitle, trt: data.rowTrt, type: data.rowType, order: data.rowOrder}
    if(data.rowId == current) {
      $('#stage #currentTimer').text(segmentList[current].trt)
      $('#stage #currentTitle').text(segmentList[current].title)
    }
    if(data.rowId == nextId) {
      $('#stage #nextTitle').text(segmentList[nextId].title)
      $('#stage #nextTrt').text(segmentList[nextId].trt)
    }
  })
  
  /* !--- Current Segment --- */
  if (current != '') {
    currentTrt = segmentList[current].trt
    // Find Next
    var order = segmentList[current].order
    for(var propt in segmentList) {
      if(segmentList[propt].order == (parseInt(order) + 1)){
        nextId = propt
      }
    }
    $('#stage #currentTimer').text(segmentList[current].trt)
    $('#stage #currentTitle').text(segmentList[current].title)
    if(nextId != null) {
      $('#stage #nextTitle').text(segmentList[nextId].title)
      $('#stage #nextTrt').text(segmentList[nextId].trt)
      $('#stage #next').slideDown('fast')
    } else {
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
        $('#stage #next').slideDown('fast')
      })
    }
    tick()
  }
  
  socket.on('updateCurrent', function(data) {
    var id = data.rowId
    current = id
    if(id != '') {
      currentStart = data.start
      currentTrt = data.rowTrt
      // Find Next
      var order = data.rowOrder
      nextId = null
      for(var propt in segmentList) {
        if(segmentList[propt].order == (parseInt(order) + 1)){
          nextId = propt
          $('#stage #nextTitle').text(segmentList[nextId].title)
          $('#stage #nextTrt').text(segmentList[nextId].trt)
        }
      }
      $('#stage #currentTitle').text(segmentList[id].title)
      if(nextId != null) {
        $('#stage #nextTitle').text(segmentList[nextId].title)
        $('#stage #nextTrt').text(segmentList[nextId].trt)
        $('#stage #next').slideDown('fast')
      } else {
        $('#stage #next').slideUp('fast', function() {
          $('#stage #nextTitle').text('')
          $('#stage #nextTrt').text('')
        })
      }
      tick()
      switch(display) {
        case 'timer':
          displayTimer()
          break
        case 'time':
          displayTime()
          break
        case 'split':
          displaySplit()
          break        
      }
    } else {
      currentTrt = null
      $('#stage #currentTimer').text('')
      $('#stage #currentTitle').text('')
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
      })
      displayTime()
    }   
  })
  
  function tick() {
    if(current != null){
      var now = new Date()
      var start = new Date(currentStart)
      // Difference
      var minDiff = now.getMinutes() - start.getMinutes()
      var secDiff = now.getSeconds() - start.getSeconds()
      var totalDiff = (minDiff*60)+(secDiff)
      // from Total
      var tempTrt = currentTrt.split(':')
      var totalTrt = parseInt(tempTrt[0]*60)+parseInt(tempTrt[1])
      var min = null
      var sec = null
      var total = totalTrt - totalDiff
      if(total == 0) {
        min = 0
        sec = 0
        $('#stage #currentTimer').removeClass('inTheRed')
      } else if(total > 0) {
        min = Math.abs(Math.floor(total/60))
        sec = Math.abs(Math.floor(total%60))
        $('#stage #currentTimer').removeClass('inTheRed')
      } else if(total < 0) {
        min = Math.abs(Math.floor((total/60)+1))
        sec = Math.abs(Math.floor((total+1)%60))
        $('#stage #currentTimer').addClass('inTheRed')
      }
      if(sec<10){sec='0'+sec}
      $('#stage #currentTimer').text(min + ':' + sec)
    } else {
      $('#stage #currentTimer').text('')
    }
    setTimeout(tick, 1000)
  }

  /* !--- Update Time --- */
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
    $('div#stage div#time span#actualtime').text(currentTime)
    $('div#stage div#time span#period').text(period)
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
  /* !--- Settings Display Switcher --- */
  $(document).on('click', 'a#settings', function(e) {
    e.preventDefault()
    $('ul#settings').animate({
      'bottom': '0'
    })
  })
  $(document).on('click', 'ul#settings a#btn_timer', function(e) {
    e.preventDefault()
    displayTimer()
    $('ul#settings').animate({
      'bottom': '-250px'
    })
    display = 'timer'
  })
  $(document).on('click', 'ul#settings a#btn_time', function(e) {
    e.preventDefault()
    displayTime()
    $('ul#settings').animate({
      'bottom': '-250px'
    })
    display = 'time'
  })
  $(document).on('click', 'ul#settings a#btn_split', function(e) {
    e.preventDefault()
    displaySplit()
    $('ul#settings').animate({
      'bottom': '-250px'
    })
    display = 'split'
  })
  function displayTimer() {
    $('div#stage div#time').css({
        'top': '55px'
      , 'font-size': '110px'
      , 'text-align': 'right'
    })
    $('div#stage div#time span#period').css({
        'margin-left': '10px'
      , 'font-size': '84px'
    })
    $('div#stage div#currentTimer').css({
        'top': '80px'
      , 'font-size': '450px'
      , 'text-align': 'left'
    })
  }
  function displayTime() {
    $('div#stage div#time').css({
        'top': '80px'
      , 'font-size': '450px'
      , 'text-align': 'left'
    })
    $('div#stage div#time span#period').css({
        'margin-left': '20px'
      , 'font-size': '200px'
    })
    $('div#stage div#currentTimer').css({
        'top': '55px'
      , 'font-size': '110px'
      , 'text-align': 'right'
    })
  }
  function displaySplit() {
    $('div#stage div#time').css({
        'top': '190px'
      , 'font-size': '280px'
      , 'text-align': 'right'
    })
    $('div#stage div#time span#period').css({
        'margin-left': '10px'
      , 'font-size': '100px'
    })
    $('div#stage div#currentTimer').css({
        'top': '190px'
      , 'font-size': '280px'
      , 'text-align': 'left'
    })
  }
})