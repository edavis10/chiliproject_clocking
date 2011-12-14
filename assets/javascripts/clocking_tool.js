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
  $('#clocking-tool-template').tmpl({
    formUrl: this.createUrl
  }).appendTo(this.container);
  this.addStubData();
}
