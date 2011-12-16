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
      clockingTool.processIssuesFromServer(projectId, data);
    }
  });
}

ClockingTool.prototype.getActivities = function(projectId) {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('clocking_tool/activities.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processActivitiesFromServer(projectId, data);
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

ClockingTool.prototype.processIssuesFromServer = function(projectId, jsonData) {
  var clockingTool = this;

  _.each(jsonData, function(issue) {
    clockingTool.addIssue(projectId, issue);
  });
  this.loadIssuesInForm();
}

ClockingTool.prototype.addIssue = function(projectId, issue) {
  var project = this.findProject(projectId);

  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].issues.push(issue);
  }
}

ClockingTool.prototype.processActivitiesFromServer = function(projectId, jsonData) {
  var clockingTool = this;

  _.each(jsonData, function(activity) {
    clockingTool.addActivity(projectId, activity);
  });
  this.loadActivitiesInForm();
}

ClockingTool.prototype.addActivity = function(projectId, activity) {
  var project = this.findProject(projectId);
  
  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].activities.push(activity);
  }
}
