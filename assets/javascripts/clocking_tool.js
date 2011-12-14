// Clocking Tool Application
function ClockingTool() {
  this.test = 42;
  this.container = '#clocking-tool';
}
ClockingTool.prototype.init = function() {
}
// Add some stub data during development
ClockingTool.prototype.addStubData = function() {
  $(this.container + " .header .message-box").html("Hi TEST, please clock your time below");
  $(this.container + " .header .popout").html("[O]");
  $(this.container + " .form-container form").append("<input>").append("<input type='submit'>");
}
ClockingTool.prototype.draw = function() {
  $('#clocking-tool-template').tmpl().appendTo(this.container);
  this.addStubData();
}
