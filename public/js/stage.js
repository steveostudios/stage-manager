var socket = io.connect('http://localhost')
var nextId = null
var currentTrt = null

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
    } else {
      currentTrt = null
      $('#stage #currentTimer').text('')
      $('#stage #currentTitle').text('')
      $('#stage #next').slideUp('fast', function() {
        $('#stage #nextTitle').text('')
        $('#stage #nextTrt').text('')
      })
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
    currentTime = hour + ':' + minute + '<span id="period">' + period + '</span>'
    $('#stage #time').html(currentTime)
    setTimeout(getCurrentTime,1000)
  }
  getCurrentTime()
})