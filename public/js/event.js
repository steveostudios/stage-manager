var socket = io.connect('http://localhost')
var editing = null
var editingType = null
var currentTrt = null
  
$(document).ready(function () {
  socket.emit('setRoom', { room: room, current: current })
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
  /* !--- Hidable icons --- */
  // hide on init
  $('.hidable').hide()
  // on event mouseover
  $(document).on('mouseover', '#event', function(e) {
    $(this).find('.hidable').show()
  })
  // on event mouseout
  $(document).on('mouseout', '#event', function(e) {
    $('.hidable').hide()
  })
  // on segment mouseover
  $(document).on('mouseover', 'div.segment', function(e) {
    $(this).find('.hidable').show()
  })
  // on segment mouseout
  $(document).on('mouseout', 'div.segment', function(e) {
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
  
  
  
  
  $(document).on('click', '.rowEdit', function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'segment'
      editing = $(this).parent().parent().parent().attr('id')
      $(this).parent().parent().toggle()
      $(this).parent().parent().next().toggle()
    }
  })
  $(document).on('click', 'div#segment_pane ul li.segment div.segment_edit .type .pup_typeSelector img', function(e) {
    $('div#segment_pane ul li.segment div.segment_edit .type .pup_typeSelector img').removeClass('selected')
    $(this).addClass('selected')
    var dataType = $(this).attr('data-type')
    $(this).parent().parent().find('.input_type').val(dataType)
    $(this).parent().prev().attr('src', '../img/ico_' + dataType + '.png')
  })
  
  /* !--- Cancel Segment --- */
  
  $(document).on('click', '.rowCancel', function(e) {
    e.preventDefault()
    cancelSegment()
  })
  function cancelSegment() {
    var id = editing
    editingType = null
    editing = null
    if (id != 'new') {
      var type = $('li#' + id + ' .segment .type img').attr('src')
      type = type.replace('../img/ico_','')
      type = type.replace('.png','')
      $('li#' + id + ' .segment_edit .type .input_type').val(type)
      $('li#' + id + ' .segment_edit .type .img_edit').attr('src', '../img/ico_' + type + '.png')
      $('li#' + id + ' .segment_edit .type .pup_typeSelector img').removeClass('selected')
      $('li#' + id + ' .segment_edit .type .pup_typeSelector').find('[data-type="' + type + '"]').addClass('selected')
      $('li#' + id + ' .segment_edit .title .input_title').val($('li#' + id + ' .segment .title').text())
      $('li#' + id + ' .segment_edit .trt .input_trt').val($('li#' + id + ' .segment .trt').text())
      $('li#' + id + ' .segment_edit').toggle()
      $('li#' + id + ' .segment').toggle()
    } else {
      $('li#new').remove()
    }
  }
    
  /* !--- Save Segment or Header --- */
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
  $(document).on('click', '.rowSave', function(e) {
    e.preventDefault()
    saveSegment()
  })
  function saveSegment() {
    var id = editing
    editingType = null
    editing = null
    var type =  $('li#' + id + ' .segment_edit .type .input_type').val()
    var title = $('li#' + id + ' .segment_edit .title .input_title').val()
    var trt =   $('li#' + id + ' .segment_edit .trt .input_trt').val()
    var order = $('li#' + id).attr('rel')
    /* !--- --- Format TRT --- --- */
    if(trt.indexOf(":") == -1){
      if(parseInt(trt) < 60) {
        var temp = parseInt(trt)
        if(temp < 10){temp = '0'+temp}
        trt = '0:' + temp
      } else if(parseInt(trt) >= 60 && parseInt(trt) < 100) {
        var temp = parseInt(trt)-60
        if(temp < 10){temp = '0'+temp}
        trt = '1:' + temp
      } else {
        var sec = trt.slice(-2);
        var min = trt.substring(0, trt.length - 2);
        trt = min+':'+sec
      }
    }
    $('li#' + id + ' .segment_edit .trt .input_trt').val(trt)
    $('li#' + id + ' .segment .title').text(title)
    if(id == 'new') {
      order = $('ul#body li.segment').length - 1
      socket.emit('segmentCreate', {eventId: room, rowType: type, rowTitle: title, rowTrt: trt, rowOrder: order})
      $('li#new').remove()
    } else {
      socket.emit('segmentSave', { rowId: id , rowType: type, rowTitle: title, rowTrt: trt, rowOrder: order}, function(data) {
        $('li#' + id + ' .segment .type img').attr('src', '../img/ico_' + data.rowType + '.png')
        $('li#' + id + ' .segment .title').text(data.rowTitle)
        $('li#' + id + ' .segment .trt').text(data.rowTrt)
      })
    }
    $('li#' + id + ' .segment_edit').toggle()
    $('li#' + id + ' .segment').toggle()
  }
  socket.on('updateSegment', function(data) {
    $('li#' + data.rowId + ' .segment .type img').attr('src', '../img/ico_' + data.rowType + '.png')
    $('li#' + data.rowId + ' .segment .title').text(data.rowTitle)
    $('li#' + data.rowId + ' .segment .trt').text(data.rowTrt)
  })
  
  /* !--- Current Segment --- */
  if (current != '') {
    $('li#'+current+' div.segment').addClass('highlight')
    var title = $('li#'+current+' div.segment div.title').text()
    currentTrt = $('li#'+current+' div.segment div.trt').text()
    $('#sidebar #preview #currentTitle').text(title)
    $('#sidebar #preview #currentTimer').text(currentTrt)
    tick() 
  }
  $(document).on('click', 'div#segment_pane ul#body li.segment div.segment div.title', function(e) {
    e.preventDefault()
    var id = $(this).parent().parent().attr('id')
    var trt = $(this).parent().find('div.trt').text()
    var order = $(this).parent().parent().attr('rel')
    socket.emit('segmentCurrent', {eventId: room, rowId: id, rowTrt: trt, rowOrder: order})
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
      //tick()
    } else {
      current = null
      currentStart = null
      currentTrt = null
      $('#sidebar #preview #currentTitle').text('')
      $('#sidebar #preview #currentTimer').text('')
    }
  })
  // on add segment click
  $('#controls a#btn_addSegment').click(function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'segment'
      editing = 'new'
      $('ul#body').append('<li id="new" class="segment"><div class="segment_edit" style="display:block"><div class="type"><input type="hidden" value="mic" class="input_type"/><img src="../img/ico_mic.png" width="35" height="35"/><div class="pup_typeSelector"><img src="../img/ico_slate.png" data-type="slate"/><img src="../img/ico_note.png" data-type="note"/><img src="../img/ico_bible.png" data-type="bible"/><img src="../img/ico_mic.png" data-type="mic" class="selected" /><img src="../img/ico_tv.png" data-type="tv"/><img src="../img/ico_megaphone.png" data-type="megaphone"/></div></div><div class="title withInput"><input type="text" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>')
    }
  })
  socket.on('createSegment', function(data) {
    $('ul#body').append('<li id="'+data.rowId+'" class="segment" rel="'+data.rowOrder+'"><div class="segment"><div class="type"><img src="../img/ico_'+data.rowType+'.png" width="35" height="35"/></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div><div class="options"><a href="#" class="rowEdit"><img src="../img/ico_editRow.png" width="17" height="17" class="hidable" /></a><a href="#" class="rowRemove"><img src="../img/ico_removeRow.png" width="17" height="17" class="hidable" /></a><span class="hidable handle"><img src="../img/ico_moveRow.png" width="17" height="17" class="hidable" /></span></div></div><div class="segment_edit"><div class="type"><input type="hidden" value="mic" class="input_type"/><img src="../img/ico_'+data.rowType+'.png" width="35" height="35"/><div class="pup_typeSelector"><img src="../img/ico_slate.png" data-type="slate"/><img src="../img/ico_note.png" data-type="note"/><img src="../img/ico_bible.png" data-type="bible"/><img src="../img/ico_mic.png" data-type="mic" /><img src="../img/ico_tv.png" data-type="tv"/><img src="../img/ico_megaphone.png" data-type="megaphone"/></div></div><div class="title withInput"><input type="text" value="'+data.rowTitle+'" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" value="'+data.rowTrt+'" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>')
    $('ul#body li#' + data.rowId + ' .segment_edit .type .pup_typeSelector').find('[data-type="' + data.rowType + '"]').addClass('selected')
  })
  
  /* !--- Headers --- */
  // on header mouseover
  $(document).on('mouseover', 'div.header', function(e) {
    $(this).find('.hidable').show()
  })
  // on header mouseout
  $(document).on('mouseout', 'div.header', function(e) {
    $('.hidable').hide()
  })
  // add header button
  $('#controls a#btn_addHeader').click(function(e) {
    e.preventDefault()
    if(editing == null){
      $('div#pup_addHeader').fadeToggle()
    }
  })
  // on choosing a color
  $(document).on('click', 'a#btn_addHeader_red', function(){newHeader('red')})
  $(document).on('click', 'a#btn_addHeader_blue', function(){newHeader('blue')})
  $(document).on('click', 'a#btn_addHeader_green', function(){newHeader('green')})
  // add header
  function newHeader(clr) {
    editingType = 'header'
    editing = 'new'
    $('div#pup_addHeader').fadeToggle()
    $('ul#body').append('<li id="new" class="header ' + clr + '"><div class="header_edit" style="display:block"><div class="type"><input type="hidden" class="input_type" value="' + clr + '" /><div class="pup_typeSelector"><img src="../img/ico_headerRed.png", data-type="red" /><img src="../img/ico_headerGreen.png", data-type="green" /><img src="../img/ico_headerBlue.png", data-type="blue" /></div></div><div class="title withInput"><input type="text" placeholder="Title" class="input_title" /></div><div class="options"><a href="#" class="headerSave">S</a><a href="#" class="headerCancel">C</a></div></div></li>')
    $('ul#body li#new .header_edit .type .pup_typeSelector').find('[data-type="' + clr + '"]').addClass('selected')
  }
  // edit header click
  $(document).on('click', '.headerEdit', function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'header'
      editing = $(this).parent().parent().parent().attr('id')
      $(this).parent().parent().toggle()
      $(this).parent().parent().next().toggle()
    }
  })
  // on choosing a new color
  $(document).on('click', 'div#segment_pane ul li.header div.header_edit .type .pup_typeSelector img', function(e) {
    $('div#segment_pane ul li.header div.header_edit .type .pup_typeSelector img').removeClass('selected')
    $(this).addClass('selected')
    var dataType = $(this).attr('data-type')
    //$(this).parent().parent().find('.input_type').val(dataType)
    $(this).parent().parent().parent().parent().removeClass('red')
    $(this).parent().parent().parent().parent().removeClass('green')
    $(this).parent().parent().parent().parent().removeClass('blue')
    $(this).parent().parent().parent().parent().addClass(dataType)
  })
  // on socket update - new header
  socket.on('createHeader', function(data) {
    $('ul#body').append('<li id="'+data.rowId+'" class="header ' + data.rowType + '" rel="'+data.rowOrder+'"><div class="header"><div class="title">'+data.rowTitle+'</div><div class="options"><a href="#" class="headerEdit"><img src="../img/ico_editRow.png" width="17" height="17" class="hidable" /></a><a href="#" class="rowRemove"><img src="../img/ico_removeRow.png" width="17" height="17" class="hidable" /></a><span class="hidable handle"><img src="../img/ico_moveRow.png" width="17" height="17" class="hidable" /></span></div></div><div class="header_edit"><div class="type"><input type="hidden" class="input_type" value="' + data.rowType + '" /><div class="pup_typeSelector"><img src="../img/ico_headerRed.png", data-type="red" /><img src="../img/ico_headerGreen.png", data-type="green" /><img src="../img/ico_headerBlue.png", data-type="blue" /></div></div><div class="title withInput"><input type="text" value="'+data.rowTitle+'" placeholder="Title" class="input_title" /></div><div class="options"><a href="#" class="headerSave">S</a><a href="#" class="headerCancel">C</a></div></div></li>')
    $('ul#body li#' + data.rowId + ' .header_edit .type .pup_typeSelector').find('[data-type="' + data.rowType + '"]').addClass('selected')
  })
  // on save
  $(document).on('click', '.headerSave', function(e) {
    e.preventDefault()
    saveHeader()
  })
  // save header (including new header)
  function saveHeader() {
    var id = editing
    editingType = null
    editing = null
    var type = null
    if ($('li#' +id + ' .header_edit .type .pup_typeSelector img[data-type="red"]').hasClass('selected')) {
      type = 'red'
    } else if ($('li#' +id + ' .header_edit .type .pup_typeSelector img[data-type="green"]').hasClass('selected')) {
      type = 'green'
    } else if ($('li#' +id + ' .header_edit .type .pup_typeSelector img[data-type="blue"]').hasClass('selected')) {
      type = 'blue'
    }
    console.log(type)
    $('li#' + id + ' .header_edit .type .input_type').val(type)
    var title = $('li#' + id + ' .header_edit .title .input_title').val()
    var order = $('li#' + id).attr('rel')
    $('li#' + id + ' .header .title').text(title)
    if(id == 'new') {
      order = $('ul#body li').length - 1
      socket.emit('headerCreate', {eventId: room, rowType: type, rowTitle: title, rowOrder: order})
      $('li#new').remove()
    } else {
      socket.emit('headerSave', { rowId: id , rowType: type, rowTitle: title, rowOrder: order}, function(data) {
        $('li#' + id).addClass(rowType)
        $('li#' + id + ' .header .title').text(data.rowTitle)
      })
    }
    $('li#' + id + ' .header_edit').toggle()
    $('li#' + id + ' .header').toggle()
  }
  // on socket update - update header
  socket.on('updateHeader', function(data) {
    $('li#' + data.rowId + ' .header .type img').attr('src', '../img/ico_' + data.rowType + '.png')
    $('li#' + data.rowId + ' .header .title').text(data.rowTitle)
    $('li#' + data.rowId + ' .header .trt').text(data.rowTrt)
  })
  
  // on cancel
  $(document).on('click', '.headerCancel', function(e) {
    e.preventDefault()
    cancelHeader()
  })
  // cancel header
  function cancelHeader() {
    var id = editing
    editingType = null
    editing = null
    if (id != 'new') {
      var type = $('li#' + id + ' .header_edit .input_type').val()
      $('li#' + id).removeClass('red')
      $('li#' + id).removeClass('green')
      $('li#' + id).removeClass('blue')
      $('li#' + id).addClass(type)
      $('li#' + id + ' .header_edit .type .pup_typeSelector img').removeClass('selected')
      $('li#' + id + ' .header_edit .type .pup_typeSelector').find('[data-type="' + type + '"]').addClass('selected')
      $('li#' + id + ' .header_edit .title .input_title').val($('li#' + id + ' .header .title').text())
      $('li#' + id + ' .header_edit').toggle()
      $('li#' + id + ' .header').toggle()
    } else {
      $('li#new').remove()
    }
  }

  /* !--- Remove Segment or Header --- */
  var removeId = null
  // on click
  $(document).on('click', '.rowRemove', function(e) {
    e.preventDefault()
    removeId = $(this).parent().parent().parent().attr('id')
    $('#pup_alert').show()
  })
  // on submit
  $('#pup_alert .submit').on('click', function(e) {
    e.preventDefault()
    socket.emit('segmentRemove', {eventId: room, rowId: removeId})
    if(removeId == current) {
      $('div#segment_pane ul#body li.segment div.segment').removeClass('highlight')
      socket.emit('clockClear', {eventId: room})
    }
    $('#pup_alert').hide()
    removeId = null
  })
  // on cancel
  $('#pup_alert .cancel').on('click', function(e) {
    e.preventDefault()
    $('#pup_alert').hide()
    removeId = null
  })
  // on socket updatex`
  socket.on('updateRemove', function(data) {
    $('li#'+data.rowId).remove()
  })
  
  /* !--- Reorder Segments and Headers --- */
  // jquery sortable
  $('div#segment_pane ul').sortable({
    handle: '.handle',
    axis: "y"
  })
  // on sort-stop
  $('div#segment_pane ul').on( "sortstop", function( event, ui ) {
    var sortedIds = $(this).sortable( "toArray" )
    socket.emit('segmentReorder', {eventId: room, sortedIds: sortedIds})
  })
  // on socket update
  socket.on('updateReorder', function(data) {
    var i = 0
    data.sortedIds.forEach(function(id) {
      $('li#'+id).attr('rel',i)
      i++
    })
    var mylist = $('ul#body')
    var listitems = mylist.children('li').get()
    listitems.sort(function(a, b) {
       return $(a).attr('rel').localeCompare($(b).attr('rel'))
    })
    $.each(listitems, function(idx, itm) { mylist.append(itm) })
  })
  
  /* !--- Next Segment --- */
  $(document).on('click', 'footer a#btn_clockNext', function(e) {
    e.preventDefault()
    if (current != '') {
      var currentOrder = parseInt($('li#'+current).attr('rel'))
      var total = $('ul#body li').length
      var nextOrder = currentOrder + 1
      function findNext(){
        if ($('li[rel="'+nextOrder+'"]').hasClass('header')){
          nextOrder ++
          findNext()
        }
      }
      findNext()
      if(currentOrder < (total-1) ) {        
        var nextId = $('li[rel="'+nextOrder+'"]').attr('id')
        var nextTrt = $('li[rel="'+nextOrder+'"] div.segment div.trt').text()
        socket.emit('segmentCurrent', {eventId: room, rowId: nextId, rowTrt: nextTrt, rowOrder: nextOrder})
      }
    }
  })
  
  /* !--- Previous Segment --- */
  $(document).on('click', 'footer a#btn_clockPrevious', function(e) {
    e.preventDefault()
    if (current != '') {
      var currentOrder = parseInt($('li#'+current).attr('rel'))
      var prevOrder = currentOrder - 1
      function findPrev(){
        if ($('li[rel="'+prevOrder+'"]').hasClass('header')){
          prevOrder --
          findPrev()
        }
      }
      findPrev()
      if(currentOrder > 0) {
        var prevId = $('li[rel="'+prevOrder+'"]').attr('id')
        var prevTrt = $('li[rel="'+prevOrder+'"] div.segment div.trt').text()
        socket.emit('segmentCurrent', {eventId: room, rowId: prevId, rowTrt: prevTrt, rowOrder: prevOrder})
      }
    }
  })
  
  /* !--- Reset Segment --- */
  $(document).on('click', 'footer a#btn_clockReset', function(e) {
    e.preventDefault()
    if (current != '') {
      var currentOrder = $('li#'+current).attr('rel')
      var resetOrder = parseInt(currentOrder)
      var resetId = $('li[rel="'+resetOrder+'"]').attr('id')
      var resetTrt = $('li[rel="'+resetOrder+'"] div.segment div.trt').text()
      socket.emit('segmentCurrent', {eventId: room, rowId: resetId, rowTrt: resetTrt, rowOrder: resetOrder})
    }
  })
  
  /* !--- Clear Segment --- */
  $(document).on('click', 'footer a#btn_clockClear', function(e) {
    e.preventDefault()
    $('div#segment_pane ul#body li.segment div.segment').removeClass('highlight')
    socket.emit('clockClear', {eventId: room})
  })
  
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
     /*
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
        $('#sidebar #preview #currentTimer').removeClass('inTheRed')
      } else if(total > 0) {
        min = Math.abs(Math.floor(total/60))
        sec = Math.abs(Math.floor(total%60))
        $('#sidebar #preview #currentTimer').removeClass('inTheRed')
      } else if(total < 0) {
        min = Math.abs(Math.floor((total/60)+1))
        sec = Math.abs(Math.floor((total+1)%60))
        $('#sidebar #preview #currentTimer').addClass('inTheRed')
      }
      if(sec<10){sec='0'+sec}
      $('#sidebar #preview #currentTimer').text(min + ':' + sec)
*/
    } else {
      $('#sidebar #preview #currentTimer').text('')
    }
    setTimeout(tick, 500)
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

