$(document).ready(function () {
  //
  //
  // !--- SEGMENTS
  //
  //
  
  // !------ segment variables
  var segmentOptions = '<a href="#" class="segmentEdit"><i class="icon-pencil" /></a><a href="#" class="segmentheaderRemove"><i class="icon-remove" /></a><span class="handle"><i class="icon-reorder" /></span>'
  var segmentEditOptions = '<a href="#" class="segmentSave"><i class="icon-ok-circle" /></a><a href="#" class="segmentCancel"><i class="icon-remove-circle" /></a>'
  var segmentPup_typeSelector = '<div class="pup_typeSelector"><i class="icon-film" data-type="film" /><i class="icon-music" data-type="music" /><i class="icon-book" data-type="book" /><i class="icon-comment-alt"  data-type="comment-alt" /><i class="icon-picture" data-type="picture" /><i class="icon-bullhorn" data-type="bullhorn" /></div>'
  
  // !- on segment mouseover
  $(document).on('mouseover', 'div.segment', function(e) {if(editing == null) {$(this).find('.hidable').show()}})
  
  // !- on segment mouseout
  $(document).on('mouseout', 'div.segment', function(e) {$('.hidable').hide()})

  // !- Click - segment edit button
  $(document).on('click', '.segmentEdit', function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'segment'
      editing = $(this).parent().parent().parent().attr('id')
      var id = editing
      var type = $('li#' + id + ' .segment .type i').attr('data-type')
      var title = $('li#' + id + ' .segment .title').text()
      var trt = $('li#' + id + ' .segment .trt').text()
      $('li#' + id + ' .segment .type').html('<i class="icon-' + type + ' actual" data-type="' + type + '" /><input type="hidden" class="segmentType_temp" value="' + type + '" />' + segmentPup_typeSelector)
      $('li#' + id + ' .segment .type .pup_typeSelector').find('[data-type="' + type + '"]').addClass('selected')
      $('li#' + id + ' .segment .title').html('<input type="text" class="segmentTitle" value="' + title + '"/><input type="hidden" class="segmentTitle_temp" value="' + title + '" />')
      $('li#' + id + ' .segment .trt').html('<input type="text" class="segmentTrt" value="' + trt + '"/><input type="hidden" class="segmentTrt_temp" value="' + trt + '" />')
      $('li#' + id + ' .segment .title input.segmentTitle').focus()
      $(this).parent().removeClass('hidable')
      $(this).parent().html(segmentEditOptions)
    }
  })
  
  // !- Click - segment add button
  $('#controls a#btn_addSegment').click(function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'segment'
      editing = 'new'
      var defaultType = 'music'
      $('ul#body').append('<li id="new" class="segment"><div class="segment"><div class="type"><i class="icon-' + defaultType + ' actual" data-type="' + defaultType + '" /><input type="hidden" class="segmentType_temp" value="' + defaultType + '" />' + segmentPup_typeSelector + '</div><div class="title"><input type="text" placeholder="Title" class="segmentTitle" /></div><div class="trt"><input type="text" placeholder="Time" class="segmentTrt" /></div><div class="options">' + segmentEditOptions + '</div></div></li>')
    }
    $('li#new .type .pup_typeSelector i.icon-'+defaultType).addClass('selected')
    $('li#new .title input.segmentTitle').focus()
  })
  
  // !- Click - segment type 
  $(document).on('click', 'div#segment_pane .type .pup_typeSelector i', function(e) {
    e.preventDefault()
    $('div#segment_pane ul li.segment .type .pup_typeSelector i').removeClass('selected')
    $(this).addClass('selected')
    var id = editing
    var type_temp = $('li#' + id + ' .segment .type input.segmentType_temp').val()
    var type = $(this).attr('data-type')
    $('li#' + id + ' .segment .type i.actual').removeClass('icon-film icon-music icon-book icon-comment-alt icon-picture icon-bullhorn').addClass('icon-'+type)
    $('li#' + id + ' .segment .type i.actual').attr('data-type', type)
  })
  
  // !- Click - segment edit cancel
  $(document).on('click', '.segmentCancel', function(e) {
    e.preventDefault()
    cancelSegment()
  })
  
  function cancelSegment() { // Actually cancel the segement edit
    var id = editing
    editingType = null
    editing = null
    if (id != 'new') {
      var type = $('li#' + id + ' .segment .type input.segmentType_temp').val()
      var title = $('li#' + id + ' .segment .title input.segmentTitle_temp').val()
      var trt = $('li#' + id + ' .segment .trt input.segmentTrt_temp').val()
      $('li#' + id + ' .segment .type').html('<i class="icon-' + type + '" data-type="' + type + '" />')
      $('li#' + id + ' .segment .title').html(title)
      $('li#' + id + ' .segment .trt').html(trt)
      $('li#' + id + ' .segment .options').addClass('hidable')
      $('li#' + id + ' .segment .options').html(segmentOptions)
    } else {
      $('li#new').remove()
    }
  }
  
  // !- Click - segment edit save
  $(document).on('click', '.segmentSave', function(e) {
    e.preventDefault()
    saveSegment()
  })
  
  function saveSegment() { // Actually saves the segment edit
    var id = editing
    editingType = null
    editing = null
    var type = $('li#' + id + ' .segment .type i.actual').attr('data-type')
    var title = $('li#' + id + ' .segment .title input.segmentTitle').val()
    var trt =   $('li#' + id + ' .segment .trt input.segmentTrt').val()
    var order = $('li#' + id).attr('rel')
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
    if(id == 'new') {
      order = $('ul#body li').length - 1
      // !- Socket(O) - segment create
      socket.emit('segmentCreate', {eventId: room, rowType: type, rowTitle: title, rowTrt: trt, rowOrder: order})
      $('li#new').remove()
    } else {
      // !- Socket(O) - segment update
      socket.emit('segmentSave', { rowId: id , rowType: type, rowTitle: title, rowTrt: trt, rowOrder: order})
    }
  }
  
  // !- Socket(I) - segment create
  socket.on('createSegment', function(data) {
    $('ul#body').append('<li id="'+data.rowId+'" class="segment" rel="'+data.rowOrder+'"><div class="segment"><div class="type"><i class="icon-'+data.rowType+'" data-type="'+data.rowType+'" /></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div><div class="options hidable">'+segmentOptions+'</div></div></li>')
  })
  
  // !- Socket(I) - segment update
  socket.on('updateSegment', function(data) {
    $('li#' + data.rowId + ' .segment .type').html('<i class="icon-'+data.rowType+'" data-type="'+data.rowType+'" />')
    $('li#' + data.rowId + ' .segment .title').html(data.rowTitle)
    $('li#' + data.rowId + ' .segment .trt').html(data.rowTrt)
    $('li#' + data.rowId + ' .segment .options').addClass('hidable')
    $('li#' + data.rowId + ' .segment .options').html(segmentOptions)
    if (data.rowId == current) {
       $('#sidebar #preview #currentTitle').text(data.rowTitle)
       $('#sidebar #preview #currentTimer').text(data.rowTrt)
    }
  })
    
  //
  //
  // !--- HEADERS
  //
  //
  
  // !------ header variables
  var headerOptions = '<a href="#" class="headerEdit"><i class="icon-pencil" /></a><a href="#" class="segmentheaderRemove"><i class="icon-remove" /></a><span class="handle"><i class="icon-reorder" /></span>'
  var headerEditOptions = '<a href="#" class="headerSave"><i class="icon-ok-circle" /></a><a href="#" class="headerCancel"><i class="icon-remove-circle" /></a>'
  var headerPup_typeSelector = '<div class="pup_typeSelector"><img src="../img/ico_headerRed.png", data-type="red" /><img src="../img/ico_headerGreen.png", data-type="green" /><img src="../img/ico_headerBlue.png", data-type="blue" /></div>'
  
  // !- on header mouseover
  $(document).on('mouseover', 'div.header', function(e) {if(editing == null) {$(this).find('.hidable').show()}})
  
  // !- on header mouseover
  $(document).on('mouseout', 'div.header', function(e) {$('.hidable').hide()})
  
  // !- Click - header edit button
  $(document).on('click', '.headerEdit', function(e) {
    e.preventDefault()
    if(editing == null){
      editingType = 'header'
      editing = $(this).parent().parent().parent().attr('id')
      var id = editing
      var type = null
      if($('li#' + id).hasClass('red')){
        type = 'red'
      } else if($('li#' + id).hasClass('green')){
        type = 'green'
      } else if($('li#' + id).hasClass('blue')){
        type = 'blue'
      }
      var title = $('li#' + id + ' .header .title').text()
      $('li#' + id + ' .header .type').html('<input type="hidden" class="headerType_temp" value="' + type + '" />' + headerPup_typeSelector)
      $('li#' + id + ' .header .type .pup_typeSelector').find('[data-type="' + type + '"]').addClass('selected')
      $('li#' + id + ' .header .title').html('<input type="text" class="headerTite" value="' + title + '"/><input type="hidden" class="oldTitle" value="' + title + '" />')
      $('li#' + id + ' .header .title input.headerTite').focus()
      $('li#' + id + ' .header .options').removeClass('hidable')
      $('li#' + id + ' .header .options').html(headerEditOptions)
    }
  })
  
  // !- Click - header add button
  $('#controls a#btn_addHeader').click(function(e) {
    e.preventDefault()
    if(editing == null){
      $('div#pup_addHeader').fadeToggle()
    }
  })
  
  // !- Click - header color (initial)
  $(document).on('click', 'a#btn_addHeader_red', function(){newHeader('red')})
  $(document).on('click', 'a#btn_addHeader_blue', function(){newHeader('blue')})
  $(document).on('click', 'a#btn_addHeader_green', function(){newHeader('green')})
  
  function newHeader(clr) { // Actually adds new header
    editingType = 'header'
    editing = 'new'
    $('div#pup_addHeader').fadeToggle()
    $('ul#body').append('<li id="new" class="header ' + clr + '"><div class="header"><div class="type"><input type="hidden" class="input_type" value="' + clr + '" />' + headerPup_typeSelector + '</div><div class="title"><input type="text" class="headerTite" placeholder="Header"/></div><div class="options">' + headerEditOptions + '</div></div></li>')
    $('ul#body li#new .header .type .pup_typeSelector').find('[data-type="' + clr + '"]').addClass('selected')
    $('ul#body li#new .header .title input.headerTite').focus()
  }
  
  // !- Click - header color (after the fact)
  $(document).on('click', 'div#segment_pane ul li.header div.header .type .pup_typeSelector img', function(e) {
    $('div#segment_pane ul li.header div.header .type .pup_typeSelector img').removeClass('selected')
    $(this).addClass('selected')
    var dataType = $(this).attr('data-type')
    $(this).parent().parent().parent().parent().removeClass('red')
    $(this).parent().parent().parent().parent().removeClass('green')
    $(this).parent().parent().parent().parent().removeClass('blue')
    $(this).parent().parent().parent().parent().addClass(dataType)
  })
  
  // !- Click - header edit cancel
  $(document).on('click', '.headerCancel', function(e) {
    e.preventDefault()
    cancelHeader()
  })
  
  function cancelHeader() { // Actually cancels the header edit
    var id = editing
    editingType = null
    editing = null
    if (id != 'new') {
      var type = $('li#' + id + ' .header .type input.headerType_temp').val()
      $('li#' + id).removeClass('red')
      $('li#' + id).removeClass('green')
      $('li#' + id).removeClass('blue')
      $('li#' + id).addClass(type)
      $('li#' + id + ' .header .type').html('')
      var title = $('li#' + id + ' .header .title input.oldTitle').val()
      $('li#' + id + ' .header .title').html(title)
      $('li#' + id + ' .header .options').addClass('hidable')
      $('li#' + id + ' .header .options').html(headerOptions)
    } else {
      $('li#new').remove()
    }
  }
  
  // !- Click - header edit save
  $(document).on('click', '.headerSave', function(e) {
    e.preventDefault()
    saveHeader()
  })
  
  function saveHeader() { // Actually saves the header edit
    var id = editing
    editingType = null
    editing = null
    var type = null
    if ($('li#' +id + ' .header .type .pup_typeSelector img[data-type="red"]').hasClass('selected')) {
      type = 'red'
    } else if ($('li#' +id + ' .header .type .pup_typeSelector img[data-type="green"]').hasClass('selected')) {
      type = 'green'
    } else if ($('li#' +id + ' .header .type .pup_typeSelector img[data-type="blue"]').hasClass('selected')) {
      type = 'blue'
    }
    $('li#' +id + ' .header .type').html('')
    $('li#' + id + ' .header .type .input_type').val(type)
    var title = $('li#' + id + ' .header .title .headerTite').val()
    var order = $('li#' + id).attr('rel')
    $('li#' + id + ' .header .options').addClass('hidable')
    $('li#' + id + ' .header .options').html(headerOptions)    
    if(id == 'new') {
      order = $('ul#body li').length - 1
      // !- Socket(O) - header create
      socket.emit('headerCreate', {eventId: room, rowType: type, rowTitle: title, rowOrder: order})
      $('li#new').remove()
    } else {
      // !- Socket(O) - header update
      socket.emit('headerSave', { rowId: id , rowType: type, rowTitle: title, rowOrder: order})
    }
  }
  
  // !- Socket(I) - header create
  socket.on('createHeader', function(data) {
    $('ul#body').append('<li id="'+data.rowId+'" class="header ' + data.rowType + '" rel="'+data.rowOrder+'"><div class="header"><div class="type"></div><div class="title">'+data.rowTitle+'</div><div class="options hidable">' + headerOptions + '</div></div></li>')
    $('ul#body li#' + data.rowId + ' .header .type .pup_typeSelector').find('[data-type="' + data.rowType + '"]').addClass('selected')
    $('ul#body li#' + data.rowId + ' .header .type .pup_typeSelector').hide()
  })
  
  // !- Socket(I) - header update
  socket.on('updateHeader', function(data) {
    var type = data.rowType
    $('li#' + data.rowId + ' .header .type .input_type').val(type)
    $('li#' + data.rowId).removeClass('red')
    $('li#' + data.rowId).removeClass('green')
    $('li#' + data.rowId).removeClass('blue')
    $('li#' + data.rowId).addClass(type)
    $('div#segment_pane ul li.header div.header .type .pup_typeSelector img').removeClass('selected')
    if (type == 'red') {
      $('li#' + data.rowId + ' .header .type .pup_typeSelector img[data-type="red"]').addClass('selected')
    } else if (type == 'green') {
      $('li#' + data.rowId + ' .header .type .pup_typeSelector img[data-type="green"]').addClass('selected')
    } else if (type == 'blue') {
      $('li#' + data.rowId + ' .header .type .pup_typeSelector img[data-type="blue"]').addClass('selected')
    }
    $('li#' + data.rowId + ' .header .title').html(data.rowTitle)
    $('li#' + data.rowId + ' .header .trt').text(data.rowTrt)
  })
  
  //
  //
  // !--- SEGMENTS & HEADERS
  //
  //
  
  // !------ segment & header variables
  var removeId = null
  
  // TODO
  // When an item is removed, the 'rel' goes with it, leaving a gap. 
  // If a new item is added, it will count the items and create a 
  // new item with a 'rel' of the count, causing an error. 
  // I need to either send new orders to the server for everything, or
  // find the highest 'rel' and plus one.
  
  // !- Click - segment remove button
  $(document).on('click', '.segmentheaderRemove', function(e) {
    e.preventDefault()
    removeId = $(this).parent().parent().parent().attr('id')
    $('#pup_alert').show()
  })
  
  // !- Click - segment remove save
  $('#pup_alert .submit').on('click', function(e) {
    e.preventDefault()
    socket.emit('segmentRemove', {eventId: room, rowId: removeId})
    if(removeId == current) {
      $('div#segment_pane ul#body li.segment div.segment').removeClass('highlight')
      // !- Socket(O) - segment remove
      socket.emit('clockClear', {eventId: room})
    }
    $('#pup_alert').hide()
    removeId = null
  })
  
  // !- Click - segment remove cancel
  $('#pup_alert .cancel').on('click', function(e) {
    e.preventDefault()
    $('#pup_alert').hide()
    removeId = null
  })
  
  // !- Socket(I) - segment remove
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
})