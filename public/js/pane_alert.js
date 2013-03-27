$(document).ready(function () {
  $(document).on('click', '#alert_pane a#btn_alert', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane input#inp_alert').val()
    if (alertText != '') {
      if ($('#alerts ul#alertList li').length == 0) {
        $('#alert_pane input#inp_alert').val('')    
        $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
        socket.emit('alert', {eventId: room, alertText: alertText})
      }
    }
  })
  $(document).on('click', '#alert_pane a#btn_alertFav', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane input#inp_alert').val()
    if (alertText != '') {
      $('#alert_pane input#inp_alert').val('')    
      //$('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
      socket.emit('alertFavAdd', {eventId: room, alertText: alertText, userId: userId})
    }
  })
  socket.on('alertFavAdded', function(data) {
    $('ul#alertFavs').append('<li class="alertFav">' + data.alertText + '<div class="options"><a href="#" class="alertFavRemove"><img src="../img/ico_removeRow.png" width="17" height="17" /></a></div></li>')
  })
  $(document).on('click', '#alert_pane a.alertFavRemove', function(e) {
    e.preventDefault()
    var alertFavsList = []
    $(this).parent().parent().remove()
    $('ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).text())
    })
    socket.emit('alertFavRemove', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
  socket.on('alertFavUpdate', function(data) {
    $('ul#alertFavs').html('')
    for (var i = 0; i < data.alertFavs.length; i++) {
      $('ul#alertFavs').append('<li class="alertFav">' + data.alertFavs[i] + '<div class="options"><a href="#" class="alertFavRemove"><img src="../img/ico_removeRow.png" width="17" height="17" /></a></div></li>')
    }
  })
  
  
  $(document).on('click', '#alerts ul#alertList li.alert a.close ', function(e) {
    e.preventDefault()
    $(this).parent().fadeOut('fast', function() {
      $(this).remove();
    })
    socket.emit('alert', {eventId: room, alertText: ''})
  })
})