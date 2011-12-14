// Clocking Tool Application
function ClockingTool(configuration) {
  this.test = 42;
  this.container = '#clocking-tool';
  this.createUrl = '';

  for (var n in arguments[0]) { this[n] = arguments[0][n]; }
}
ClockingTool.prototype.init = function() {
}
// Add some stub data during development
ClockingTool.prototype.addStubData = function() {
  $(this.container + " .header .message-box").html("Hi TEST, please clock your time below");
  $(this.container + " .header .popout").html("[O]");
}
ClockingTool.prototype.draw = function() {
  var today = new Date();
  todayString = formatDateToISO(today);

  $('#clocking-tool-template').tmpl({
    formUrl: this.createUrl,
    today: todayString
  }).appendTo(this.container);
  this.addStubData();
  this.addActivity();
}
ClockingTool.prototype.addActivity = function() {
  $(this.container + " #time_entry_activity_id").append("<option value=''>Activity</option>");
}
