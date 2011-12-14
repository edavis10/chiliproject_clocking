// Clocking Tool Application
function ClockingTool() {
  this.test = 42;
  this.container = '#clocking-tool';
}
ClockingTool.prototype.init = function() {
}
ClockingTool.prototype.draw = function() {
  $('#clocking-tool-template').tmpl().appendTo(this.container);
}
