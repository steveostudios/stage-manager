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
  $(document).on('mouseover', 'div.segment', function(e) {
    $(this).find('.hidable').show();
  })
  $(document).on('mouseout', 'div.segment', function(e) {
    $('.hidable').hide();
  })
  $(document).on('click', '.rowEdit', function(e) {
    e.preventDefault();
    $(this).parent().parent().toggle();
    $(this).parent().parent().next().toggle();
  })
  $(document).on('click', '.rowCancel', function(e) {
    e.preventDefault();
    
    // Close Edit
    $(this).parent().parent().toggle();
    $(this).parent().parent().prev().toggle();
  })
  $(document).on('click', 'div#segments ul li.segment div.segment_edit .type .pup_typeSelector img', function(e) {
    $('div#segments ul li.segment div.segment_edit .type .pup_typeSelector img').removeClass('highlight');
    $(this).addClass('highlight');
    var dataType = $(this).attr('data-type');
    $(this).parent().parent().find('.input_type').val(dataType);
    $(this).parent().prev().attr('src', '../img/ico_' + dataType + '.png');
  })
  /* !--- Save Segment --- */
  $(document).on('click', '.rowSave', function(e) {
    e.preventDefault();
    var id = $(this).parent().parent().parent().attr('id');
    var type = $(this).parent().parent().find('.type .input_type').val();
    var title = $(this).parent().parent().find('.title .input_title').val();
    var trt = $(this).parent().parent().find('.trt .input_trt').val();
    
    // Convert TRT to seconds
    
    $('li#' + id + ' .segment .title').text(title);
    if(id == null) {
      socket.emit('segmentCreate', {eventId: room, rowType: type, rowTitle: title, rowTrt: trt})
      $(this).parent().parent().parent().remove();
    } else {
      socket.emit('segmentSave', { rowId: id , rowType: type, rowTitle: title, rowTrt: trt}, function(data) {
        $('li#' + id + ' .segment .type img').attr('src', '../img/ico_' + data.rowType + '.png');
        $('li#' + id + ' .segment .title').text(data.rowTitle);
        $('li#' + id + ' .segment .trt').text(data.rowTrt);
      })
    }
    
    // Close Edit
    $(this).parent().parent().toggle();
    $(this).parent().parent().prev().toggle();
  })
  socket.on('updateSegment', function(data) {
    $('li#' + data.rowId + ' .segment .type img').attr('src', '../img/ico_' + data.rowType + '.png');
    $('li#' + data.rowId + ' .segment .title').text(data.rowTitle);
    $('li#' + data.rowId + ' .segment .trt').text(data.rowTrt);
  })
  
  /* !--- Current Segment --- */
  if (current != '') {
    $('li#'+current+' div.segment').addClass('highlight');
  }
  $(document).on('click', 'div#segments ul.body li.segment div.segment div.title', function(e) {
    e.preventDefault();
    var id = $(this).parent().parent().attr('id');
    socket.emit('segmentCurrent', {eventId: room, rowId: id});
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
    
    $('ul.body').append('<li class="segment"><div class="segment_edit" style="display:block;"><div class="type"><input type="hidden" value="mic" class="input_type"/><img src="../img/ico_mic.png" width="35" height="35"/><div class="pup_typeSelector"><img src="../img/ico_slate.png" data-type="slate"/><img src="../img/ico_note.png" data-type="note"/><img src="../img/ico_bible.png" data-type="bible"/><img src="../img/ico_mic.png" data-type="mic" class="highlight" /><img src="../img/ico_tv.png" data-type="tv"/><img src="../img/ico_megaphone.png" data-type="megaphone"/></div></div><div class="title withInput"><input type="text" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>');
  });
  socket.on('createSegment', function(data) {
    $('ul.body').append('<li id="'+data.rowId+'" class="segment"> <div class="segment"><div class="type"><img src="../img/ico_'+data.rowType+'.png" width="35" height="35"/></div><div class="title">'+data.rowTitle+'</div><div class="trt">'+data.rowTrt+'</div><div class="options"><a href="#" class="rowEdit"><img src="../img/ico_editRow.png" width="17" height="17" class="hidable" /></a><a href="#" class="rowRemove"><img src="../img/ico_removeRow.png" width="17" height="17" class="hidable" /></a><span class="hidable handle"><img src="../img/ico_moveRow.png" width="17" height="17" class="hidable" /></span></div></div><div class="segment_edit"><div class="type"><input type="hidden" value="mic" class="input_type"/><img src="../img/ico_'+data.rowType+'.png" width="35" height="35"/><div class="pup_typeSelector"><img src="../img/ico_slate.png" data-type="slate"/><img src="../img/ico_note.png" data-type="note"/><img src="../img/ico_bible.png" data-type="bible"/><img src="../img/ico_mic.png" data-type="mic" /><img src="../img/ico_tv.png" data-type="tv"/><img src="../img/ico_megaphone.png" data-type="megaphone"/></div></div><div class="title withInput"><input type="text" value="'+data.rowTitle+'" placeholder="Title" class="input_title" /></div><div class="trt withInput"><input type="text" value="'+data.rowTrt+'" placeholder="Time" class="input_trt" /></div><div class="options"><a href="#" class="rowSave">S</a><a href="#" class="rowCancel">C</a></div></div></li>');
    $('ul.body li#' + data.rowId + ' .segment_edit .type .pup_typeSelector').find('[data-type="' + data.rowType + '"]').addClass('highlight');
  })
  
  /* !--- Remove Segment --- */
  var removeId = null;
  $(document).on('click', '.rowRemove', function(e) {
    e.preventDefault();
    removeId = $(this).parent().parent().parent().attr('id');
    $('#pup_alert').show();
  })
  $('#pup_alert .submit').on('click', function(e) {
    e.preventDefault();
    socket.emit('segmentRemove', {eventId: '50bbd4bc7bd4965cc6000002', rowId: removeId});
    $('#pup_alert').hide();
    removeId = null;
  })
  $('#pup_alert .cancel').on('click', function(e) {
    e.preventDefault();
    $('#pup_alert').hide();
    removeId = null;
  })
  socket.on('updateRemove', function(data) {
    $('li#'+data.rowId).remove();
  })
  
  /* !--- Reorder Segments --- */
  $('div#segments ul').on( "sortstop", function( event, ui ) {
    var sortedIDs = $( ".selector" ).sortable( "toArray" );
    alert('sorting stopped');
    
  } );
});

