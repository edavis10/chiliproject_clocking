// Clocking Tool Application
function ClockingTool(configuration) {
  this.container = '#clocking-tool';
  this.createUrl = '';
  this.rootUrl = '/';
  this.currentUserName = '';
  this.apiKey = '';
  for (var n in arguments[0]) { this[n] = arguments[0][n]; }

  this.projects = [];
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
  this.disableFormFields();
}
ClockingTool.prototype.addActivity = function() {
  $(this.container + " #time_entry_activity_id").append("<option value=''>Activity</option>");
}
ClockingTool.prototype.addWelcomeMessage = function() {
  $(this.container + " .header .message-box").html("Hi " + this.currentUserName + ", please clock your time below");
}
ClockingTool.prototype.disableFormFields = function() {
  $(this.container).find('#project_id, #issue_search, #time_entry_activity_id, #time_entry_hours, #time_entry_spent_on, #time_entry_comments').attr('disabled','disable');

}
// TODO: test
ClockingTool.prototype.loadProjectsInForm = function() {
  var options =  $("<option value=''>Project</option>");
  _.each(this.projects, function(project) {
    options = options.add("<option value='" + project.id + "'>" + project.name + "</option>");
  });
  $(this.container + ' #project_id').empty().append(options).removeAttr('disabled');
}
ClockingTool.prototype.urlBuilder = function(relativeRequestPath, params) {
  return this.rootUrl + relativeRequestPath + "?" + params + "&key=" + this.apiKey;
}
