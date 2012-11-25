$(document).ready(function () {

  // confirmations
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
  
  $('.rowSave').click(function(e) {
    var id = $(this).parent().parent().parent().attr('id');
    var title = $(this).parent().parent().find('.title').find('.input_title').val();
    var trt = $(this).parent().parent().find('.trt').find('.input_trt').val();
    e.preventDefault();
    socket.emit('segmentSave', { rowId: id , rowTitle: title, rowTrt: trt});
    
    // Close Edit
    $(this).parent().parent().toggle();
    $(this).parent().parent().prev().toggle();
  })
});
