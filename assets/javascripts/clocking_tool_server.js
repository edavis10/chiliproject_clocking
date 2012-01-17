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
  if (this.projectCacheInvalid(projectId)) {
    this.serverGetIssues(projectId);
  }
}

ClockingTool.prototype.serverGetIssues = function(projectId) {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('clocking_tool/issues.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processIssuesFromServer(projectId, data);
    }
  });
}

ClockingTool.prototype.getActivities = function(projectId) {
  if (this.projectCacheInvalid(projectId)) {
    this.serverGetActivities(projectId);
  }
}
ClockingTool.prototype.serverGetActivities = function(projectId) {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('clocking_tool/activities.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processActivitiesFromServer(projectId, data);
    }
  });
}

ClockingTool.prototype.saveTimeEntry = function(data) {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder("projects/" + data.project_id + "/time_entries.json",''),
    type: "POST",
    data: data,
    success: function(data, textStatus, jqXHR) {
      clockingTool.processTimeEntrySaveResponse(jqXHR);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      clockingTool.processTimeEntrySaveResponse(jqXHR);
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
  this.updateProjectLoadedAt(projectId);
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
  this.updateProjectLoadedAt(projectId);
  this.loadActivitiesInForm();
}

ClockingTool.prototype.addActivity = function(projectId, activity) {
  var project = this.findProject(projectId);
  
  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].activities.push(activity);
  }
}

ClockingTool.prototype.processTimeEntrySaveResponse = function(response) {

  if (response.status == 200 || response.status == 201) {
    this.saveSuccessful();
  } else if (response.status == 403) {
    var message = "Error saving time: " + $.parseJSON(response.responseText).message;
    this.saveFailed(message);
  } else {
    var message = "Error saving time: ";
    var errors = $.parseJSON(response.responseText);
    if (errors.errors) {
      var errorMessages = _.reduce(errors.errors, function(memo, errorMessage) {
        if (errorMessage instanceof Array) {
          // Array of [field, message]
          memo.push(errorMessage.join(' '));
        } else {
          // Flat string
          memo.push(errormessage);
        }
        return memo;
      }, []);

      message += errorMessages.join(', ');
    }
    this.saveFailed(message);

  }
}

ClockingTool.prototype.projectCacheInvalid = function(projectId) {
  var project = this.findProject(projectId);
  if (project && project.loadedAt && project.loadedAt != "") {
    // Dates are in millaseconds for each comparision (since UNIX time)
    var lastLoad = Date.parse(project.loadedAt);
    var millisecondInHour = 3600000;
    var cacheDuration = millisecondInHour * 24;

    return Date.now() > (lastLoad + cacheDuration);
  } else {
    // No cache
    return true;
  }
}
