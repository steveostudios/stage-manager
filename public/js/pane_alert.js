$(document).ready(function () {
  
  var alertFavOptions = '<a href="#" class="alertFavEdit alertHidable"><img src="../img/ico_editRow.png" width="17" height="17" /></a><a href="#" class="alertFavRemove alertHidable"><img src="../img/ico_removeRow.png" width="17" height="17" /></a><span class="handle alertHidable"><img src="../img/ico_moveRow.png" width="17" height="17" /></span>'
  var alertFavEditOptions = '<a href="#" class="alertFavSave">S</a><a href="#" class="alertFavCancel">C</a>'

  $('.alertHidable').hide()
  // on segment mouseover
  $(document).on('mouseover', 'li.alertFav', function(e) {
    $(this).find('.alertHidable').show()
  })
  // on segment mouseout
  $(document).on('mouseout', 'li.alertFav', function(e) {
    $('.alertHidable').hide()
  })

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
    $('.alertHidable').hide()
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
      editingType = 'alertFav'
      editing = $(this).parent().parent().find('.alertFavText').text()
      $(this).parent().parent().find('.alertFavText').html('<input type="text" class="alertFavText_input" value="' + editing + '"/>')
      $(this).parent().html(alertFavEditOptions)
    }
  })
  
  function saveAlertFav() {
    editing = $(document).find('.alertFavText .alertFavText_input').val()
    $(document).find('.alertFavText .alertFavText_input').parent().html('').text(editing)
    var alertFavsList = []
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).find('.alertFavText').text())
    })
    editingType = null
    editing = null
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  }
  
  function cancelAlertFav() {
    $(document).find('.alertFavText .alertFavText_input').parent().html('').text(editing)
    $('#alert_pane ul#alertFavs li .options').html(alertFavOptions)
    $('.alertHidable').hide()
    editingType = null
    editing = null
  }
  
  $(document).keyup(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      if (editingType == 'alertFav') {
        saveAlertFav()
      }
    }
  })
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      e.preventDefault()
      if (editingType == 'alertFav') {
        cancelAlertFav()
      }
    }
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavSave', function(e) {
    e.preventDefault()
    saveAlertFav()
  })
  
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavCancel', function(e) {
    e.preventDefault()
    cancelAlertFav()
  })
  
})