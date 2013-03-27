$(document).ready(function () {
  
  var alertFavOptions = '<a href="#" class="alertFavEdit"><img src="../img/ico_editRow.png" width="17" height="17" /></a><a href="#" class="alertFavRemove"><img src="../img/ico_removeRow.png" width="17" height="17" /></a><span class="handle"><img src="../img/ico_moveRow.png" width="17" height="17" /></span>'
  var alertFavEditOptions = '<a href="#" class="alertFavSave">S</a><a href="#" class="alertFavCancel">C</a>'


  $(document).on('click', '#alert_pane a#btn_alert', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane textarea#inp_alert').val()
    if (alertText != '') {
      if ($('#alerts ul#alertList li').length == 0) {
        $('#alert_pane textarea#inp_alert').val('')    
        $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
        socket.emit('alert', {eventId: room, alertText: alertText})
      }
    }
  })
  
  $(document).on('click', '#alert_pane a#btn_alertFav', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane textarea#inp_alert').val()
    if (alertText != '') {
      $('#alert_pane textarea#inp_alert').val('')
      socket.emit('alertFavAdd', {eventId: room, alertText: alertText, userId: userId})
    }
  })
  
  socket.on('alertFavAdded', function(data) {
    $('ul#alertFavs').append('<li class="alertFav"><div class="alertFavText">' + data.alertText + '</div><div class="options">' + alertFavOptions + '</div></li>')
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavRemove', function(e) {
    e.preventDefault()
    var alertFavsList = []
    $(this).parent().parent().remove()
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).text())
    })
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
  
  socket.on('alertFavUpdated', function(data) {
    $('#alert_pane ul#alertFavs').html('')
    for (var i = 0; i < data.alertFavs.length; i++) {
      $('ul#alertFavs').append('<li class="alertFav"><div class="alertFavText">' + data.alertFavs[i] + '</div><div class="options">' + alertFavOptions + '</div></li>')
    }
  })
  
  $('#alert_pane ul#alertFavs').sortable({
    handle: '.handle',
    axis: "y"
  })
  
  $('#alert_pane ul#alertFavs').on( "sortstop", function( event, ui ) {
    var alertFavsList = []
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).find('.alertFavText').text())
    })
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
    
  $(document).on('click', '#alerts ul#alertList li.alert a.close ', function(e) {
    e.preventDefault()
    $(this).parent().fadeOut('fast', function() {
      $(this).remove();
    })
    socket.emit('alert', {eventId: room, alertText: ''})
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .alertFavText', function(e) {
    e.preventDefault()
    if (editing == null) {
      if ($('#alerts ul#alertList li').length == 0) {
        var alertText = $(this).text()
        $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
        socket.emit('alert', {eventId: room, alertText: alertText})
      }
    }
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavEdit', function (e) {
    e.preventDefault()
    if (editing == null) {
      editing = $(this).parent().parent().find('.alertFavText').text()
      $(this).parent().parent().find('.alertFavText').html('<input type="text" class="alertFavText_input" value="' + editing + '"/>')
      $(this).parent().html(alertFavEditOptions)
    }
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavSave', function(e) {
    e.preventDefault()
    editing = $(this).parent().parent().find('.alertFavText .alertFavText_input').val()
    $(this).parent().parent().find('.alertFavText').html('')
    $(this).parent().parent().find('.alertFavText').text(editing)
    $(this).parent().html(alertFavOptions)
    editing = null
    var alertFavsList = []
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).find('.alertFavText').text())
    })
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavCancel', function(e) {
    e.preventDefault()
    $(this).parent().parent().find('.alertFavText').html('')
    $(this).parent().parent().find('.alertFavText').text(editing)
    $(this).parent().html(alertFavOptions)
    editing = null
  })
  
})