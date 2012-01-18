// Clocking Tool Application
function ClockingTool(configuration) {
  this.container = '#clocking-tool';
  this.createUrl = '';
  this.rootUrl = '/';
  this.currentUserName = '';
  this.apiKey = '';
  this.caching = {"projects": ''};
  for (var n in arguments[0]) { this[n] = arguments[0][n]; }

  this.projects = [];
  this.getCachingFromStorage();
}

/** Ajax module **/

ClockingTool.prototype.serverGetProjects = function() {
  var clockingTool = this;

  $.ajax({
    url: this.urlBuilder('projects.json',''),
    success: function(data) {
      clockingTool.processProjectsFromServer(data);
    }
  });
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

/** Activity module **/

ClockingTool.prototype.getActivities = function(projectId) {
  if (this.projectCacheInvalid(projectId)) {
    this.serverGetActivities(projectId);
  }
  this.getProjectsFromStorage();
}

ClockingTool.prototype.addActivity = function(projectId, activity) {
  var project = this.findProject(projectId);
  
  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].activities.push(activity);
  }
}

/** Caching module **/
ClockingTool.prototype.updateProjectLoadedAt = function(projectId) {
  var project = this.findProject(projectId);
  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].loadedAt = (new Date).toString();
  }
}

// TODO: handle browser without localStorage
ClockingTool.prototype.getCachingFromStorage = function() {
  var caching = localStorage.getItem("caching");
  if (caching) {
    console.log("loading caching from storage");
    this.caching = JSON.parse(caching);
  }

}

// TODO: handle browser without localStorage
ClockingTool.prototype.setCachingInStorage = function() {
  localStorage.setItem("caching", JSON.stringify(this.caching));
}

// TODO: handle browser without localStorage
ClockingTool.prototype.getProjectsFromStorage = function() {
  var storage = localStorage.getItem("projects");

  if (storage) {
    this.projects = JSON.parse(storage);
  }

}
// TODO: handle browser without localStorage
ClockingTool.prototype.setProjectsInStorage = function() {
  localStorage.setItem("projects", JSON.stringify(this.projects));
}

ClockingTool.prototype.projectListCacheInvalid = function() {
  var loadedProjects = this.caching.projects;

  if (loadedProjects && loadedProjects != "") {
    // Dates are in millaseconds for each comparision (since UNIX time)
    var millisecondInHour = 3600000;
    var cacheDuration = millisecondInHour * 24;

    return Date.now() > (Date.parse(loadedProjects) + cacheDuration);
  } else {
    // No cache
    return true;
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

/** Event module **/
// Sets up all the event bindings on the tool's widget
ClockingTool.prototype.setupEventBindings = function() {
  var clockingTool = this;
  $('#project_id').change(function() {
    clockingTool.projectChange();
  });
  $('#issue_search').keyup(function() {
    clockingTool.issueChange();
  });
  $('a.issue-search-result').live('click', function() {
    clockingTool.selectIssue($(this).data('issueId'));
  });
  $(this.container + ' form').live('submit', function(event) {
    event.stopPropagation();
    clockingTool.save();
    return false;
  });

}

ClockingTool.prototype.projectChange = function() {
  this.getIssues($('#project_id').val());
  this.getActivities($('#project_id').val());
  $(this.container).find('#project_id, #issue_search, #time_entry_activity_id, #time_entry_hours, #time_entry_spent_on, #time_entry_comments').removeAttr('disabled');
}

ClockingTool.prototype.issueChange = function() {
  var projectId = $('#project_id').val();
  var selectedProject = this.findProject(projectId);
  var results = this.searchIssues($('#issue_search').val());
  var searchContainer = $(this.container + " div.search-results").html($("<ul>"));

  _.each(results, function(issue) {
    var issueIdString = "<span class='issue-id'>#" + issue.id + "</span>";
    var issueString = "<span class='issue-subject'>" + issue.subject + "</span>";
    var projectString = "<span class='project-name'>" + selectedProject.name; + "</span>";
    var link = "<a class='issue-search-result' data-issue-id='"+issue.id+"' href='#'>" + issueIdString + issueString + projectString + "</a>";
    var searchItem = $("<li>").html(link);

    searchContainer.find("ul").append(searchItem);
  });
  searchContainer.show();
}

ClockingTool.prototype.searchIssues = function(query) {
  var projectId = $('#project_id').val();
  var selectedProject = this.findProject(projectId);
  var queryRegex = new RegExp(query, "i");

  return _.filter(selectedProject.issues, function (issue) {
    return issue.searchData.match(queryRegex);
  });
}

ClockingTool.prototype.selectIssue = function(issueId) {
  $(this.container + " .search-results").hide();
  var projectId = $('#project_id').val();
  var selectedProject = this.findProject(projectId);
  var issue = this.findIssueInProject(selectedProject, issueId);
  if (issue) {
    $('#issue_search').val(issue.subject);
    $('#time_entry_issue_id').val(issue.id);
  }
}

ClockingTool.prototype.saveSuccessful = function() {
  $(this.container + ' .form-container form input[type=submit]').removeAttr('disabled').val('Save');
  $(this.container).find('#time_entry_hours, #time_entry_comments').val('');
  this.changeMessage("Time entry saved");
  $(this.container + " .header .message-box").removeClass('flash').removeClass('error');
}

ClockingTool.prototype.saveFailed = function(message) {
  $(this.container + ' .form-container form input[type=submit]').removeAttr('disabled').val('Save');
  this.changeMessage(message);
  $(this.container + " .header .message-box").addClass('flash').addClass('error');
}

/** Form module **/
ClockingTool.prototype.disableFormFields = function() {
  $(this.container).find('#project_id, #issue_search, #time_entry_activity_id, #time_entry_hours, #time_entry_spent_on, #time_entry_comments').attr('disabled','disable');

}

ClockingTool.prototype.save = function() {
  $(this.container + ' .form-container form input[type=submit]').attr("disabled", "disabled").val('Saving...');

  var timeEntry = {
    "project_id": $(this.container + ' .form-container form #project_id').val(),
    "time_entry": {
      "hours": $(this.container + ' .form-container form #time_entry_hours').val(),
      "issue_id": $(this.container + ' .form-container form #time_entry_issue_id').val(),
      "activity_id": $(this.container + ' .form-container form #time_entry_activity_id').val(),
      "spent_on": $(this.container + ' .form-container form #time_entry_spent_on').val(),
      "comments":$(this.container + ' .form-container form #time_entry_comments').val()
    }
  };
  this.saveTimeEntry(timeEntry);
}

// TODO: test
ClockingTool.prototype.loadProjectsInForm = function() {
  var options =  $("<option value=''>Project</option>");
  _.each(this.projects, function(project) {
    options = options.add("<option value='" + project.id + "'>" + project.name + "</option>");
  });
  $(this.container + ' #project_id').empty().append(options).removeAttr('disabled');
}

ClockingTool.prototype.loadIssuesInForm = function() {
  // Issues are not shown, only the search field is
  $(this.container + ' #issue_search').removeAttr('disabled');
}

ClockingTool.prototype.loadActivitiesInForm = function() {
  var projectId = $('#project_id').val() || '';
  var selectedProject = this.findProject(projectId);

  if (selectedProject) {
    var options =  $("<option value=''>Activity</option>");
    _.each(selectedProject.activities, function(activity) {
      options = options.add("<option value='" + activity.id + "'>" + activity.name + "</option>");
    });
    $(this.container + ' #time_entry_activity_id').empty().append(options).removeAttr('disabled');
  }
  
}

/** Issue module **/
ClockingTool.prototype.findIssueInProject = function(project, issueId) {
  if (project) {
    return _.find(project.issues, function(issue) { return issue.id.toString() === issueId.toString() });
  }
}

ClockingTool.prototype.addIssue = function(projectId, issue) {
  var project = this.findProject(projectId);

  var projectPosition = _.indexOf(this.projects, project);

  if (projectPosition >= 0) {
    this.projects[projectPosition].issues.push(issue);
  }
}


ClockingTool.prototype.getIssues = function(projectId) {
  if (this.projectCacheInvalid(projectId)) {
    this.serverGetIssues(projectId);
  }
  this.getProjectsFromStorage();
}


/** Project module **/
ClockingTool.prototype.getProjects = function() {
  if (this.projectListCacheInvalid()) {
    console.log('project cache invalid');
    this.serverGetProjects();
  }
  this.getProjectsFromStorage();
  this.loadProjectsInForm();
}

ClockingTool.prototype.findProject = function(projectId) {
  return _.find(this.projects, function(project) { return project.id.toString() === projectId.toString() });
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

/** Server processing module **/

ClockingTool.prototype.processProjectsFromServer = function(jsonData) {
  var clockingTool = this;
  this.projects = [];

  // TODO: check total_count, limit, and offset for > 100 projects
  _.each(jsonData.projects, function(project) {
    clockingTool.addProject(project.id, project.name);
  });
  this.setProjectsInStorage();
  this.caching.projects = (new Date).toString();
  this.setCachingInStorage();
}

ClockingTool.prototype.processIssuesFromServer = function(projectId, jsonData) {
  var clockingTool = this;

  _.each(jsonData, function(issue) {
    clockingTool.addIssue(projectId, issue);
  });
  this.updateProjectLoadedAt(projectId);
  this.setProjectsInStorage(); // Issues are embedded in projects
  this.loadIssuesInForm();
}

ClockingTool.prototype.processActivitiesFromServer = function(projectId, jsonData) {
  var clockingTool = this;

  _.each(jsonData, function(activity) {
    clockingTool.addActivity(projectId, activity);
  });
  this.updateProjectLoadedAt(projectId);
  this.setProjectsInStorage(); // Activities are embedded in projects
  this.loadActivitiesInForm();
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

/** UI module **/
ClockingTool.prototype.draw = function() {
  var today = new Date();
  todayString = formatDateToISO(today);

  $('#clocking-tool-template').tmpl({
    formUrl: this.createUrl,
    today: todayString
  }).appendTo(this.container);
  this.addStubData();
  this.addWelcomeMessage();
  this.disableFormFields();
  this.setupEventBindings();
}

ClockingTool.prototype.addWelcomeMessage = function() {
  $(this.container + " .header .message-box").html("Hi " + this.currentUserName + ", please clock your time below");
}

ClockingTool.prototype.changeMessage = function(message) {
  $(this.container + " .header .message-box").html(message);
}

/** Utilities **/

// Add some stub data during development
ClockingTool.prototype.addStubData = function() {
  $(this.container + " .header .popout").html("[O]");
}

ClockingTool.prototype.urlBuilder = function(relativeRequestPath, params) {
  return this.rootUrl + relativeRequestPath + "?" + params + "&key=" + this.apiKey;
}

