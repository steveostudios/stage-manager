$(document).ready(function () {
  
  //
  //
  // !--- ALERT
  //
  //
  
  // !- Click - alert
  $(document).on('click', '#alert_pane a#btn_alert', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane textarea#inp_alert').val()
    if (alertText != '') {
      if ($('#alerts ul#alertList li').length == 0) {
        $('#alert_pane textarea#inp_alert').val('')    
        $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<i class="close icon-remove-sign" /></li>')
        // !- Socket(O) - Alert
        socket.emit('alert', {eventId: room, alertText: alertText})
      }
    }
  })
  
  // !- Click - alert remove
  $(document).on('click', '#alerts ul#alertList li.alert i.close', function(e) {
    e.preventDefault()
    $(this).parent().fadeOut('fast', function() {
      $(this).remove();
    })
    // !- Socket(O) - Alert remove
    socket.emit('alert', {eventId: room, alertText: ''})
  })
  
  //
  //
  // !--- ALERT FAVS
  //
  //
  
  // !------ alert favs variables
  var alertFavOptions = '<a href="#" class="alertFavEdit"><i class="icon-pencil" /></a><a href="#" class="alertFavRemove"><i class="icon-remove" /></a><span class="handle"><i class="icon-reorder" /></span>'
  var alertFavEditOptions = '<a href="#" class="alertFavSave"><i class="icon-ok-circle" /></a><a href="#" class="alertFavCancel"><i class="icon-remove-circle" /></a>'

  $('.alertHidable').hide()
  // !- on alert fav mouseover
  $(document).on('mouseover', 'li.alertFav', function(e) {if(editing == null) {$(this).find('.hidable').show()}})
  // !- on alert fav mouseout
  $(document).on('mouseout', 'li.alertFav', function(e) {$('.hidable').hide()})

  // !- Click - alert fav add 
  $(document).on('click', '#alert_pane a#btn_alertFav', function(e) {
    e.preventDefault()
    var alertText = $('#alert_pane textarea#inp_alert').val()
    if (alertText != '') {
      $('#alert_pane textarea#inp_alert').val('')
      // !- Socket(O) - alert fav add
      socket.emit('alertFavAdd', {eventId: room, alertText: alertText, userId: userId})
    }
  })
  
  // !- Socket(I) - alert fav add
  socket.on('alertFavAdded', function(data) {
    $('ul#alertFavs').append('<li class="alertFav"><div class="alertFavText">' + data.alertText + '</div><div class="options">' + alertFavOptions + '</div></li>')
    $('#alert_pane ul#alertFavs li .options').addClass('hidable')
  })
  
  // TODO
  // When an item is removed, the 'rel' goes with it, leaving a gap. 
  // If a new item is added, it will count the items and create a 
  // new item with a 'rel' of the count, causing an error. 
  // I need to either send new orders to the server for everything, or
  // find the highest 'rel' and plus one.
  
  // !- Click - alert fav remove
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavRemove', function(e) {
    e.preventDefault()
    var alertFavsList = []
    $(this).parent().parent().remove()
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).text())
    })
    // !- Socket(O) - alert fav remove
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
  
  // !- Socket(I) - alert fav update/remove
  socket.on('alertFavUpdated', function(data) {
    $('#alert_pane ul#alertFavs').html('')
    for (var i = 0; i < data.alertFavs.length; i++) {
      $('ul#alertFavs').append('<li class="alertFav"><div class="alertFavText">' + data.alertFavs[i] + '</div><div class="options">' + alertFavOptions + '</div></li>')
    }
    $('#alert_pane ul#alertFavs li .options').addClass('hidable')
  })
  
  // !- sortable
  $('#alert_pane ul#alertFavs').sortable({
    handle: '.handle',
    axis: "y"
  })
  
  // !- SortStop - alert fav reorder
  $('#alert_pane ul#alertFavs').on( "sortstop", function( event, ui ) {
    var alertFavsList = []
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).find('.alertFavText').text())
    })
    // !- Socket(O) - alert fav reorder
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  })
    
  // !- Click - alert fav run
  $(document).on('click', '#alert_pane ul#alertFavs li .alertFavText', function(e) {
    e.preventDefault()
    if (editing == null) {
      if ($('#alerts ul#alertList li').length == 0) {
        var alertText = $(this).text()
        $('#alerts ul#alertList').append('<li class="alert">' + alertText + '<i class="close icon-remove-sign" /></li>')
        socket.emit('alert', {eventId: room, alertText: alertText})
      }
    }
  })
  
  // !- Click - alert fav edit
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavEdit', function (e) {
    e.preventDefault()
    if (editing == null) {
      editingType = 'alertFav'
      editing = $(this).parent().parent().find('.alertFavText').text()
      $(this).parent().parent().find('.alertFavText').html('<input type="text" class="alertFavText_input" value="' + editing + '"/>')
      $(this).parent().removeClass('hidable')
      $(this).parent().html(alertFavEditOptions)
    }
  })
  
  // !- Click - alert fav save
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavSave', function(e) {
    e.preventDefault()
    saveAlertFav()
  })
  
  // !- Keyup - alert fav save
  $(document).keyup(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      if (editingType == 'alertFav') {
        saveAlertFav()
      }
    }
  })
  
  function saveAlertFav() { // Actually save alert fav
    editing = $(document).find('.alertFavText .alertFavText_input').val()
    $(document).find('.alertFavText .alertFavText_input').parent().html('').text(editing)
    var alertFavsList = []
    $('#alert_pane ul#alertFavs li').each(function(i) {
      alertFavsList.push($(this).find('.alertFavText').text())
    })
    editingType = null
    editing = null
    // !- Socket(O) - alert fav save
    socket.emit('alertFavUpdate', {eventId: room, alertFavs: alertFavsList, userId: userId})
  }
  
  // !- Click - alert fav cancel
  $(document).on('click', '#alert_pane ul#alertFavs li .options a.alertFavCancel', function(e) {
    e.preventDefault()
    cancelAlertFav()
  })

  // !- Keyup - alert fav cancel
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      e.preventDefault()
      if (editingType == 'alertFav') {
        cancelAlertFav()
      }
    }
  })  

  function cancelAlertFav() { // Actually cancel alert fav
    $(document).find('.alertFavText .alertFavText_input').parent().html('').text(editing)
    $('#alert_pane ul#alertFavs li .options').addClass('hidable')
    $('#alert_pane ul#alertFavs li .options').html(alertFavOptions)
    $('.alertHidable').hide()
    editingType = null
    editing = null
  }  
})