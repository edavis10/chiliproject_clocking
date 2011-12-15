// Server components
ClockingTool.prototype.getProjects = function() {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('projects.json',''),
    success: function(data) {
      clockingTool.processProjectsFromServer(data);
    }
  });
}

ClockingTool.prototype.getIssues = function(projectId) {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('clocking_tool/issues.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processIssuesFromServer(data);
    }
  });
}

ClockingTool.prototype.processProjectsFromServer = function(jsonData) {
  var clockingTool = this;

  // TODO: check total_count, limit, and offset for > 100 projects
  _.each(jsonData.projects, function(project) {
    clockingTool.addProject(project.id, project.name);
  });
  this.loadProjectsInForm();
}

ClockingTool.prototype.addProject = function(id, name) {
  this.projects.push({
    id: id,
    name: name,
    loadedAt: "",
    activities: [],
    issues: []
  });
}

ClockingTool.prototype.processIssuesFromServer = function(jsonData) {
}
