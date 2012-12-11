$(document).ready(function () {
  $(document).on('click', 'div#events ul#body li.event', function(e) {
    e.preventDefault();
    var id = $(this).attr('id')
    window.location = '/events/'+id;
  });
});