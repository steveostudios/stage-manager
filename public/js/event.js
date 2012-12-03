var socket = io.connect('http://localhost');

$(document).ready(function () {

  socket.emit('setRoom', { room: room });
  console.log(room);
  $('.confirm').submit(function (e) {
    e.preventDefault();
    var self = this;
    var msg = 'Are you sure?';
    bootbox.confirm(msg, 'cancel', 'Yes! I am sure', function (action) {
      if (action) {
        $(self).unbind('submit');
        $(self).trigger('submit');
      }
    });
  });

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });
  $('div#segments ul').sortable({
    handle: '.handle'
  })
  $('.hidable').hide();
  $('div.segment').mouseover(function(e) {
    $(this).find('.hidable').show();
  })
  $('div.segment').mouseout(function(e) {
    $('.hidable').hide();
  })
  $('.rowEdit').click(function(e) {
    e.preventDefault();
    $(this).parent().parent().toggle();
    $(this).parent().parent().next().toggle();
  })
  $('.rowCancel').click(function(e) {
    e.preventDefault();
    
    // Close Edit
    $(this).parent().parent().toggle();
    $(this).parent().parent().prev().toggle();
  })
  
  /* !--- Save Segment --- */
  $(document).on('click', '.rowSave', function(e) {
    
    e.preventDefault();
    var id = $(this).parent().parent().parent().attr('id');
    var title = $(this).parent().parent().find('.title .input_title').val();
    var trt = $(this).parent().parent().find('.trt .input_trt').val();
    
    // Convert TRT to seconds
    
    $('li#' + id + ' .segment .title').text(title);
    if(id == null) {
      //alert('create new row');
      socket.emit('segmentCreate', {eventId: '50bbd4bc7bd4965cc6000002', rowTitle: title, rowTrt: trt}, function (data) {
        
      })
      $(this).parent().parent().parent().remove();
    } else {
      socket.emit('segmentSave', { rowId: id , rowTitle: title, rowTrt: trt}, function(data) {
        $('li#' + id + ' .segment .title').text(data.rowTitle);
        $('li#' + id + ' .segment .trt').text(data.rowTrt);
      })
    }
    
    // Close Edit
    $(this).parent().parent().toggle();
    $(this).parent().parent().prev().toggle();
  })
  socket.on('updateSegment', function(data) {
    $('li#'+data.rowId+' .segment .title').text(data.rowTitle);
    $('li#'+data.rowId+' .segment .trt').text(data.rowTrt);
  })
  
  /* !--- Current Segment --- */
  $(document).on('click', 'div#segments ul.body li.segment div.segment div.title', function(e) {
    e.preventDefault();
    var id = $(this).parent().parent().attr('id');
    socket.emit('segmentCurrent', {eventId: '50bbd4bc7bd4965cc6000002', rowId: id});
  });
  socket.on('updateCurrent', function(data) {
   $('div#segments ul.body li.segment div.segment').removeClass('highlight');
   $('li#'+data.rowId+' div.segment').addClass('highlight');
  })
  /* !--- Add New Header --- */
  $('#controls a#btn_addHeader').click(function(e) {
    e.preventDefault();
    $('div#pup_addHeader').fadeToggle();
  });
  /* !--- Add New Segment Row --- */
  $('#controls a#btn_addSegment').click(function(e) {
    e.preventDefault();
    
    // If there are any other edits happening then cancel or complete them
    
    $('ul.body').append('<li class="segment"><div class="segment_edit" style="display:block;"><div class="type"><img src="../img/ico_slate.png" width="35" height="35"/></div><div class="title withInput"><input type="text" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>');
  });
  socket.on('createSegment', function(data) {
    $('ul.body').append('<li id="'+data.rowId+'" class="segment"><div class="segment"><div class="type"><img src="../img/ico_slate.png" width="35" height="35"/></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div><div class="options"><a href="#" class="rowEdit"><img src="../img/ico_editRow.png" width="17" height="17" class="hidable" /></a><a href="#" class="hidable"><img src="../img/ico_removeRow.png" width="17" height="17" class="hidable" /></a><span class="hidable handle"><img src="../img/ico_moveRow.png" width="17" height="17" class="hidable" /></span></div></div><div class="segment_edit"><div class="type"><img src="../img/ico_slate.png" width="35" height="35"/></div><div class="title withInput"><input type="text" value="'+data.rowTitle+'" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" value="'+data.rowTrt+'" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>');

  })
});

