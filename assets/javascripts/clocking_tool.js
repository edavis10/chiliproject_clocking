// Clocking Tool Application
function ClockingTool(configuration) {
  this.test = 42;
  this.container = '#clocking-tool';
  this.createUrl = '';
  this.currentUserName = '';
  for (var n in arguments[0]) { this[n] = arguments[0][n]; }
}
ClockingTool.prototype.init = function() {
}
// Add some stub data during development
ClockingTool.prototype.addStubData = function() {
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
  this.addWelcomeMessage();
}
ClockingTool.prototype.addActivity = function() {
  $(this.container + " #time_entry_activity_id").append("<option value=''>Activity</option>");
}
ClockingTool.prototype.addWelcomeMessage = function() {
  $(this.container + " .header .message-box").html("Hi " + this.currentUserName + ", please clock your time below");
}
