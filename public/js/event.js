var socket = io.connect('http://stagemanager.herokuapp.com')
//var socket = io.connect('http://localhost:3000')
var editing = null
var editingType = null
var currentTrt = null
var timeOffset = 0
  
$(document).ready(function () {
  socket.emit('setRoom', { room: room, current: current }, function(data) {
  	var serverNow = new Date(data)
	  var clientNow = new Date()
	  timeOffset = serverNow-clientNow
	  $('.eta').text(timeOffset)
  })
  
  $('.confirm').submit(function (e) {
    e.preventDefault()
    var self = this
    var msg = 'Are you sure?'
    bootbox.confirm(msg, 'cancel', 'Yes! I am sure', function (action) {
      if (action) {
        $(self).unbind('submit')
        $(self).trigger('submit')
      }
    })
  })
  $(".datepicker").datepicker()

  // on event mouseover
  $(document).on('mouseover', '#event', function(e) {
    if(editing == null) {
      $(this).find('.hidable').show()
    }
  })
  // on event mouseout
  $(document).on('mouseout', '#event', function(e) {
    $('.hidable').hide()
  })
  
  /* !--- Event Update --- */
  // on edit click
  $(document).on('click', '#eventEdit', function(e) {
    e.preventDefault()
    if(editing == null){
      editing = 'event'
      editingType = 'event'
      $('#event').hide()
      $('#event_edit').show()
    }
  })
  function saveEvent() {
    $('#event_edit').hide()
    var date = $('#input_eventDate').val()
    var series = $('#input_eventSeries').val()
    var title = $('#input_eventTitle').val()
    $('#event').show()
    editing = null
    editingType = null
    socket.emit('eventSave', {eventId: room, eventDate: date, eventSeries: series, eventTitle: title})
  }
  function cancelEvent() {
    $('#event_edit').hide()
    $('#input_eventDate').val($('#eventDate').text())
    $('#input_eventSeries').val($('#eventSeries').text())
    $('#input_eventTitle').val($('#eventTitle').text())
    $('#event').show()
    editing = null
    editingType = null
  }

  // on save
  $(document).on('click', '#eventSave', function(e) {
    e.preventDefault()
    saveEvent()
  })
  // on cancel
  $(document).on('click', '#eventCancel', function(e) {
    e.preventDefault()
    cancelEvent()
  })
    // on socket update
  socket.on('updateEvent', function(data) {
    $('#eventDate').text(data.eventDate)
    $('#eventSeries').text(data.eventSeries)
    $('#eventTitle').text(data.eventTitle)
    $('#input_eventDate').val(data.eventDate)
    $('#input_eventSeries').val(data.eventSeries)
    $('#input_eventTitle').val(data.eventTitle)
  })
   
   
   
   
   
   
      
  /* !--- Save Event, Segment, or Header --- */
  $(document).keyup(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      if (editingType == 'event') {
        saveEvent()
      } else if (editingType == 'header') {
        saveHeader()
      } else if (editingType == 'segment') {
        saveSegment()
      }
    }
  })
  /* !--- Cancel Event, Segment, or Header --- */
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      e.preventDefault()
      if (editingType == 'event') {
        cancelEvent()
      } else if (editingType == 'header') {
        cancelHeader()
      } else if (editingType == 'segment') {
        cancelSegment()
      }
    }
  })
    
  
  
  
  
  
  
  
  /* !--- Current Segment --- */
  if (current != '') {
    $('li#'+current+' div.segment').addClass('highlight')
    var title = $('li#'+current+' div.segment div.title').text()
    currentTrt = $('li#'+current+' div.segment div.trt').text()
    $('#sidebar #preview #currentTitle').text(title)
    $('#sidebar #preview #currentTimer').text(currentTrt)
    tick() 
  } else {
    current = null
    currentStart = null
    currentTrt = null
    $('#sidebar #preview #currentTitle').text('')
    $('#sidebar #preview #currentTimer').text('')
    tick()
  }
  checkNext()
  checkPrev()
  checkReset()
  checkClear()
  determineETA()
  
  $(document).on('click', 'div#segment_pane ul#body li.segment div.segment div.title', function(e) {
    e.preventDefault()
    if(editing == null) {
      var id = $(this).parent().parent().attr('id')
      var trt = $(this).parent().find('div.trt').text()
      var order = $(this).parent().parent().attr('rel')
      socket.emit('segmentCurrent', {eventId: room, rowId: id, rowTrt: trt, rowOrder: order, oldId: current })
    }
  })
  socket.on('updateCurrent', function(data) {
    $('div#segment_pane ul#body li.segment div.segment').removeClass('highlight')
    if (data.rowId != '') {
      current = data.rowId
      currentStart = data.start
      currentTrt = data.rowTrt
      var title = $('li#'+data.rowId+' div.segment div.title').text()
      var trt = data.rowTrt
      $('li#'+data.rowId+' div.segment').addClass('highlight')
      $('#sidebar #preview #currentTitle').text(title)
      $('#sidebar #preview #currentTimer').text(trt)
    } else {
      current = null
      currentStart = null
      currentTrt = null
      $('#sidebar #preview #currentTitle').text('')
      $('#sidebar #preview #currentTimer').text('')
    }
    checkNext()
    checkPrev()
    checkReset()
    checkClear()
    determineETA()
  })
  
  
  
  /* !- Next, Previous, Reset, Clear - */
  
  /* !--- Next Segment --- */
  $(document).on('click', 'footer a#btn_clockNext', function(e) {
    e.preventDefault()
    if($('footer a#btn_clockNext').hasClass('disabled') != true) {
      var nextOrder = parseInt($('li#'+current).attr('rel')) + 1
      function findNext(){
        if ($('li[rel="'+nextOrder+'"]').hasClass('header')){
          nextOrder ++
          findNext()
        }
      }
      findNext()
      var nextId = $('li[rel="'+nextOrder+'"]').attr('id')
      var nextTrt = $('li[rel="'+nextOrder+'"] div.segment div.trt').text()
      socket.emit('segmentCurrent', {eventId: room, rowId: nextId, rowTrt: nextTrt, rowOrder: nextOrder, oldId: current })
    }
  })
  
  function checkNext() {
    var currentOrder = parseInt($('li#'+current).attr('rel'))
    var total = $('ul#body li').length
    var nextOrder = currentOrder+1
    function findNext(){
      if ($('li[rel="'+nextOrder+'"]').hasClass('header')){
        nextOrder ++
        findNext()
      }
    }
    if(currentOrder >= total) {
      $('footer a#btn_clockNext').addClass('disabled')
    } else {
      findNext()
      if (nextOrder < total) {
        $('footer a#btn_clockNext').removeClass('disabled')
      } else {
        $('footer a#btn_clockNext').addClass('disabled')
      }
    }
  }
  
  /* !--- Previous Segment --- */
  $(document).on('click', 'footer a#btn_clockPrevious', function(e) {
    e.preventDefault()
    var prevOrder = parseInt($('li#'+current).attr('rel')) - 1
    if($('footer a#btn_clockPrevious').hasClass('disabled') != true) {
      function findPrev(){
        if ($('li[rel="'+prevOrder+'"]').hasClass('header')){
          prevOrder --
          findPrev()
        }
      }
      findPrev()
      var prevId = $('li[rel="'+prevOrder+'"]').attr('id')
      var prevTrt = $('li[rel="'+prevOrder+'"] div.segment div.trt').text()
      socket.emit('segmentCurrent', {eventId: room, rowId: prevId, rowTrt: prevTrt, rowOrder: prevOrder, oldId: current})
    }
  })
  
  function checkPrev() {
    var currentOrder = parseInt($('li#'+current).attr('rel'))
    var total = $('ul#body li').length
    var prevOrder = currentOrder - 1
    function findPrev(){
      if ($('li[rel="'+prevOrder+'"]').hasClass('header')){
        prevOrder --
        findPrev()
      }
    }
    if(currentOrder < 0) {
      $('footer a#btn_clockPrevious').addClass('disabled')
    } else {
      findPrev()
      if (prevOrder >= 0) {
        $('footer a#btn_clockPrevious').removeClass('disabled')
      } else {
        $('footer a#btn_clockPrevious').addClass('disabled')
      }
    }
  }
  
  /* !--- Reset Segment --- */
  $(document).on('click', 'footer a#btn_clockReset', function(e) {
    e.preventDefault()
    if($('footer a#btn_clockReset').hasClass('disabled') != true) {
      var currentOrder = $('li#'+current).attr('rel')
      var resetOrder = parseInt(currentOrder)
      var resetId = $('li[rel="'+resetOrder+'"]').attr('id')
      var resetTrt = $('li[rel="'+resetOrder+'"] div.segment div.trt').text()
      socket.emit('segmentCurrent', {eventId: room, rowId: resetId, rowTrt: resetTrt, rowOrder: resetOrder})
    }
  })
  
  function checkReset() {
    if (current == null || $('li#'+current).hasClass('header')) {
      $('footer a#btn_clockReset').addClass('disabled')
    } else {
      $('footer a#btn_clockReset').removeClass('disabled')
    }
  }
  
  /* !--- Clear Segment --- */
  $(document).on('click', 'footer a#btn_clockClear', function(e) {
    e.preventDefault()
    if($('footer a#btn_clockClear').hasClass('disabled') != true) {
      socket.emit('clockClear', {eventId: room})
    }
  })
  
  function checkClear() {
    if (current == null || $('li#'+current).hasClass('header')) {
      $('footer a#btn_clockClear').addClass('disabled')
    } else {
      $('footer a#btn_clockClear').removeClass('disabled')
    } 
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
    $('#preview #time').html(currentTime)
    setTimeout(getCurrentTime,1000)
  }
  getCurrentTime()
  /* !--- The Tick --- */
  function tick() {
    if(current != null){
      var now = new Date()
      var start = new Date(currentStart)
      // difference
      var diff = now.getTime() - start.getTime()
      // from total
      var tempTrt = currentTrt.split(':')
      var totalTrt = parseInt(tempTrt[0]*60)+parseInt(tempTrt[1])
      var total = totalTrt - (diff/1000)
      // format it
      var hour = null
      var min = null
      var sec = null
      if(total == 0) {
        min = 0
        sec = 0
        $('#sidebar #preview #currentTimer').removeClass('inTheRed')
      } else if(total > 0) {
        min = Math.abs(Math.floor(total/60))
        sec = Math.abs(Math.floor(total%60))
        $('#sidebar #preview #currentTimer').removeClass('inTheRed')
      } else if(total < 0) {
        min = Math.abs(Math.floor((total/60)+1))
        if (min >= 60) {
          hour = Math.abs(Math.floor(total/3600)+1)
          min = min - (60*hour)
          hour = hour + ':'
        }
        
        sec = Math.abs(Math.floor((total+1)%60))
        if (sec == 60) {sec = 0}
        $('#sidebar #preview #currentTimer').addClass('inTheRed')
      }
      if (hour == null) {hour = ''}
      if(sec<10){sec='0'+sec}
      $('#sidebar #preview #currentTimer').text(hour + '' + min + ':' + sec)

    } else {
      $('#sidebar #preview #currentTimer').text('')
    }
    setTimeout(tick, 500)
  }
  
  /* !--- ETA --- */
  function determineETA() {
    var eta = null
    $( "ul#body li.segment .segment div.trt" ).each(function( index ) {
      thisTrt = $(this).text()
      var tempTrt = thisTrt.split(':')
      var trt = parseInt(tempTrt[0]*60)+parseInt(tempTrt[1])
      eta = eta + trt
    })
  }
  
  /* !--- Switch Modes --- */
  $(document).on('click', 'footer a#btn_mode_list', function(e) {
    e.preventDefault()
    $('#segment_pane').show()
    $('a#btn_mode_list').addClass('mode_selected')
    $('#alert_pane').hide()
    $('a#btn_mode_alert').removeClass('mode_selected')
    $('#call_pane').hide()
    $('a#btn_mode_call').removeClass('mode_selected')
  })
  $(document).on('click', 'footer a#btn_mode_alert', function(e) {
    e.preventDefault()
    $('#segment_pane').hide()
    $('a#btn_mode_list').removeClass('mode_selected')
    $('#alert_pane').show()
    $('a#btn_mode_alert').addClass('mode_selected')
    $('#call_pane').hide()
    $('a#btn_mode_call').removeClass('mode_selected')
  })
  $(document).on('click', 'footer a#btn_mode_call', function(e) {
    e.preventDefault()
    $('#segment_pane').hide()
    $('a#btn_mode_list').removeClass('mode_selected')
    $('#alert_pane').hide()
    $('a#btn_mode_alert').removeClass('mode_selected')
    $('#call_pane').show()
    $('a#btn_mode_call').addClass('mode_selected')
  })
})

