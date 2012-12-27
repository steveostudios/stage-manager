$(document).ready(function () {
  $(document).on('click', 'div#events ul#body li.event a.eventManage', function(e) {
    e.preventDefault();
    var id = $(this).parent().parent().attr('id');
    window.location = '/events/'+id;
  });
  $(document).on('click', 'div#events ul#body li.event a.eventStage', function(e) {
    e.preventDefault();
    var id = $(this).parent().parent().attr('id')
    window.location = '/stage/'+id;
  });
});