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

ClockingTool.prototype.processProjectsFromServer = function(data) {
  var serverProjects = $.parseJSON(data);
  var clockingTool = this;

  // TODO: check total_count, limit, and offset for > 100 projects
  _.each(serverProjects.projects, function(project) {
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
