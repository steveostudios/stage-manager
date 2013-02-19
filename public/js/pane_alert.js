$(document).ready(function () {
  $(document).on('click', '#alert_pane a#btn_alert', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane input#inp_alert').val()
    if (alertText != '') {
      $('#alert_pane input#inp_alert').val('')    
      $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
      socket.emit('alert', {eventId: room, alertText: alertText})
    }
  })
  $(document).on('click', '#alert_pane a#btn_alertFav', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane input#inp_alert').val()
    if (alertText != '') {
      $('#alert_pane input#inp_alert').val('')    
      $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<a href="#" class="close">n</a></li>')
    }
  })
  $(document).on('click', '#alerts ul#alertList li.alert a.close ', function(e) {
    e.preventDefault()
    $(this).parent().fadeOut({
      // REMOVE COMPLETELY
    })
    socket.emit('alert', {eventId: room, alertText: ''})
  })
  
})