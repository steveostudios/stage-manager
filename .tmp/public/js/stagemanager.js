// !- Convert DB time to readable time.
function to_readable_time(time) {
  var min = time / (60 * 1000);
  var sec = time % (60 * 1000);
  sec = ( sec < 10 ? "0" : "" ) + sec;
  return min +':'+ sec;
}
// !- Convert readable time to DB time.
function to_db_time(time) {

}
// !- Return current time.
function currentTime() {
  var now = new Date();
  var currentHours = now.getHours();
  var currentMinutes = now.getMinutes();
  var currentSeconds = now.getSeconds();
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;
  var timeOfDay = (currentHours < 12) ? "AM" : "PM";
  currentHours = (currentHours > 12) ? currentHours - 12 : currentHours;
  currentHours = (currentHours === 0) ? 12 : currentHours;
  var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;
  return currentTimeString;
}
// !- Sort.
function sortByOrder(x,y) {
  return x.order - y.order;
}