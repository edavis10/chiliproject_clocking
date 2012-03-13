// Clocking Tool Application
function ClockingTool(configuration) {
  this.j = jQuery;
  this.container = '#clocking-tool';
  this.createUrl = '';
  this.rootUrl = '/';
  this.currentUserName = '';
  this.apiKey = '';
  this.caching = {"projects": ''};
  this.helpUrl = '/help/wiki_syntax.html';
  this.images = { refresh: '', loading: ''}
  this.embedded = false;
  for (var n in arguments[0]) { this[n] = arguments[0][n]; }

  this.projects = [];
  this.recentIssues = [];
  this.getRecentIssuesFromStorage();
  this.getCachingFromStorage();
}

/** Ajax module **/
ClockingTool.prototype.serverGetProjects = function() {
  var clockingTool = this;

  this.j.ajax({
    url: this.urlBuilder('projects.json','limit=100'),
    success: function(data) {
      clockingTool.processProjectsFromServer(data);
    }
  });
}

ClockingTool.prototype.serverGetIssues = function(projectId) {
  var clockingTool = this;

  this.j.ajax({
    url: this.urlBuilder('clocking_tool/issues.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processIssuesFromServer(projectId, data);
    }
  });
}

ClockingTool.prototype.serverGetActivities = function(projectId) {
  var clockingTool = this;

  this.j.ajax({
    url: this.urlBuilder('clocking_tool/activities.json', 'project_id=' + projectId),
    success: function(data) {
      clockingTool.processActivitiesFromServer(projectId, data);
    }
  });
}

ClockingTool.prototype.saveTimeEntry = function(data) {
  var clockingTool = this;

  this.j.ajax({
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
    console.log("Project cache invalid");
    this.serverGetActivities(projectId);
  } else {
    console.log("Project cache valid");
    this.getProjectsFromStorage();
    this.loadActivitiesInForm();
  }
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
    console.log("Loading caching from storage");
    this.caching = JSON.parse(caching);
  }

}

// TODO: handle browser without localStorage
ClockingTool.prototype.setCachingInStorage = function() {
  console.log("Storing caching key");
  localStorage.setItem("caching", JSON.stringify(this.caching));
}

// TODO: handle browser without localStorage
ClockingTool.prototype.getProjectsFromStorage = function() {
  var storage = localStorage.getItem("projects");

  if (storage) {
    console.log("Loading projects from storage");
    this.projects = JSON.parse(storage);
  }

}
// TODO: handle browser without localStorage
ClockingTool.prototype.setProjectsInStorage = function() {
  console.log("Storing projects");
  localStorage.setItem("projects", JSON.stringify(this.projects));
}

// TODO: handle browser without localStorage
ClockingTool.prototype.getRecentIssuesFromStorage = function() {
  var recent = localStorage.getItem("recentIssues");
  if (recent) {
    console.log("Loading recentIssues from storage");
    this.recentIssues = JSON.parse(recent);
  }

}

// TODO: handle browser without localStorage
ClockingTool.prototype.setRecentIssuesInStorage = function() {
  console.log("Storing recent issues");
  localStorage.setItem("recentIssues", JSON.stringify(this.recentIssues));
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

ClockingTool.prototype.refreshData = function() {
  console.log("Clearing storage");
  this.disableFormFields();
  localStorage.clear();
  this.projects = [];
  this.caching.projects = '';
  this.getProjects();
}

/** Event module **/
// Sets up all the event bindings on the tool's widget
ClockingTool.prototype.setupEventBindings = function() {
  var clockingTool = this;
  this.j('.project_id').change(function() {
    clockingTool.projectChange();
  });
  this.j('.issue_search').keyup(function() {
    clockingTool.issueChange();
  });
  this.j('a.issue-search-result').live('click', function() {
    clockingTool.selectIssue(clockingTool.j(this).data('issueId'));
  });
  this.j('a.recent-issue').live('click', function() {
    clockingTool.fillFormFromRecentIssue(clockingTool.j(this).data('projectId'),
                                         clockingTool.j(this).data('issueId'));
  });
  this.j(this.container + ' form').live('submit', function(event) {
    event.stopPropagation();
    clockingTool.save();
    return false;
  });
  this.j(this.container + ' .refresh-data').live('click', function() {
    clockingTool.refreshData();
  });
  this.j(this.container + " .ajax-loading").ajaxStart(function(){ jQuery(this).show().css('z-index', '9999');  });
  this.j(this.container + " .ajax-loading").ajaxStop(function(){ jQuery(this).hide();  });

}

ClockingTool.prototype.projectChange = function() {
  this.j(this.container).find('.issue_search').val('');
  this.j(this.container).find('.time_entry_activity_id').val('');
  this.showRecentIssues();

  var projectId = this.j('.project_id').val();
  if (projectId) {
    this.getIssues(projectId);
    this.getActivities(projectId);
    this.enableForm();
    this.loadIssuesInForm();
    this.loadActivitiesInForm();
  } else {
    // Disable fields except project
    this.disableFormFields();
    this.j(".project_id").removeAttr('disabled');
  }
}

ClockingTool.prototype.enableForm = function() {
  this.j(this.container).find('.project_id, .issue_search, .time_entry_activity_id, .time_entry_hours, .time_entry_spent_on, .time_entry_comments').removeAttr('disabled');
}

ClockingTool.prototype.issueChange = function() {
  var projectId = this.j('.project_id').val();
  var selectedProject = this.findProject(projectId);
  if (selectedProject) {
    var results = this.searchIssues(this.j('.issue_search').val());
    var searchContainer = this.j(this.container + " .issues-container ul.issue-results").empty();
    var clockingTool = this;

    _.each(results, function(issue) {
      var resultString = "" + issue.id + " &gt " + issue.subject;
      var link = "<a class='issue-search-result' data-issue-id='"+issue.id+"' href='#' title='" + resultString + "'>" + resultString + "</a>";
      var searchItem = clockingTool.j("<li>").html(link);

      searchContainer.append(searchItem);
    });
    searchContainer.addClass('search-results');
  }
}

ClockingTool.prototype.searchIssues = function(query) {
  var projectId = this.j('.project_id').val();
  var selectedProject = this.findProject(projectId);
  var queryRegex = new RegExp(query, "i");

  return _.filter(selectedProject.issues, function (issue) {
    return issue.searchData.match(queryRegex);
  });
}

ClockingTool.prototype.selectIssue = function(issueId) {
  var projectId = this.j('.project_id').val();
  var selectedProject = this.findProject(projectId);
  var issue = this.findIssueInProject(selectedProject, issueId);
  if (issue) {
    this.fillSearchFieldWithIssue(issue);
    this.j('.time_entry_issue_id').val(issue.id);
    this.showGoToIssue(issueId);
  }
}

ClockingTool.prototype.saveSuccessful = function() {
  // Extract values before clearing the form
  var projectId = this.j(this.container).find('.project_id').val();
  var issueId = this.j(this.container).find('.time_entry_issue_id').val();
  this.addRecentIssue(projectId, issueId);

  // Hide search results and show recent issues
  this.j(this.container + " .search-results").removeClass('search-results');
  this.showRecentIssues();

  // Clear fields
  this.j(this.container + ' .form-container form input[type=submit]').removeAttr('disabled').val('Save');
  this.j('.project_id').val('');
  this.projectChange();
  this.j(this.container).find('.time_entry_hours, .time_entry_comments, .time_entry_issue_id').val('');
  this.changeMessage("Time entry saved");
  this.j(this.container + " .header .message-box").addClass('flash').addClass('notice').removeClass('error');
}

ClockingTool.prototype.saveFailed = function(message) {
  this.j(this.container + ' .form-container form input[type=submit]').removeAttr('disabled').val('Save');
  this.changeMessage(message);
  this.j(this.container + " .header .message-box").addClass('flash').addClass('error').removeClass('notice');
}

ClockingTool.prototype.fillFormFromRecentIssue = function(projectId, issueId) {
  this.enableForm();
  this.j(this.container + " .project_id").val(projectId);
  this.j(this.container + " .time_entry_issue_id").val(issueId);
  this.loadActivitiesInForm();
  var project = this.findProject(projectId);
  if (project) {
    var issue = this.findIssueInProject(project, issueId);
    if (issue) {
      this.fillSearchFieldWithIssue(issue);
    }
  }
}

/** Form module **/
ClockingTool.prototype.disableFormFields = function() {
  this.j(this.container).find('.project_id, .issue_search, .time_entry_activity_id, .time_entry_hours, .time_entry_spent_on, .time_entry_comments').attr('disabled','disable');

}

ClockingTool.prototype.save = function() {
  this.j(this.container + ' .form-container form input[type=submit]').attr("disabled", "disabled").val('Saving...');

  var timeEntry = {
    "project_id": this.j(this.container + ' .form-container form .project_id').val(),
    "time_entry": {
      "hours": this.j(this.container + ' .form-container form .time_entry_hours').val(),
      "issue_id": this.j(this.container + ' .form-container form .time_entry_issue_id').val(),
      "activity_id": this.j(this.container + ' .form-container form .time_entry_activity_id').val(),
      "spent_on": this.j(this.container + ' .form-container form .time_entry_spent_on').val(),
      "comments":this.j(this.container + ' .form-container form .time_entry_comments').val()
    }
  };
  this.saveTimeEntry(timeEntry);
}

// TODO: test
ClockingTool.prototype.loadProjectsInForm = function() {
  var options =  this.j("<option value=''>--- Project ---</option>");
  _.each(this.projects, function(project) {
    options = options.add("<option value='" + project.id + "'>" + project.name + "</option>");
  });
  this.j(this.container + ' .project_id').empty().append(options).removeAttr('disabled');
  // Once projects are loaded, try showing the recent issues.
  this.showRecentIssues();
}

ClockingTool.prototype.loadIssuesInForm = function() {
  // Issues are not shown, only the search field is
  this.j(this.container + ' .issue_search').removeAttr('disabled');
  this.issueChange();
}

ClockingTool.prototype.loadActivitiesInForm = function() {
  var projectId = this.j('.project_id').val() || '';
  var selectedProject = this.findProject(projectId);

  if (selectedProject) {
    var options =  this.j("<option value=''>--- Activity --- </option>");
    _.each(selectedProject.activities, function(activity) {
      options = options.add("<option value='" + activity.id + "'>" + activity.name + "</option>");
    });
    this.j(this.container + ' .time_entry_activity_id').empty().append(options).removeAttr('disabled');
  }
  
}

ClockingTool.prototype.fillSearchFieldWithIssue = function(issue) {
  this.j('.issue_search').val("#" + issue.id + " " + issue.subject);
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
    console.log("Project cache invalid");
    this.serverGetIssues(projectId);
  } else {
    console.log("Project cache valid");
    this.getProjectsFromStorage();
    this.loadIssuesInForm();
  }
}

/** Recent issues module **/
ClockingTool.prototype.addRecentIssue = function(project_id, issue_id) {
  var recentIssue = {project_id: project_id.toString(), issue_id: issue_id.toString()};

  // Remove duplicate recent issue, it will be re-added later at the top
  this.recentIssues = _.reject(this.recentIssues, function(item) {
    return (item.project_id.toString() == recentIssue.project_id) &&
      (item.issue_id.toString() == recentIssue.issue_id);
  });

  this.recentIssues.unshift(recentIssue);

  if (this.recentIssues.length > 20) { this.recentIssues.pop(); }
  this.setRecentIssuesInStorage();
}

/** Project module **/
ClockingTool.prototype.getProjects = function() {
  if (this.projectListCacheInvalid()) {
    console.log("Project list cache invalid");
    this.serverGetProjects();
  } else {
    console.log("Project list cache valid");
    this.getProjectsFromStorage();
    this.loadProjectsInForm();
  }

}

ClockingTool.prototype.findProject = function(projectId) {
  if (projectId) {
    return _.find(this.projects, function(project) { return project.id.toString() === projectId.toString() });
  }
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
  this.loadProjectsInForm();
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
    var message = "Error saving time: " + this.j.parseJSON(response.responseText).message;
    this.saveFailed(message);
  } else {
    var message = "Error saving time: ";
    var errors = this.j.parseJSON(response.responseText);
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
  // Some elements and third party JavaScript requires ids (Calendar popup)
  var randomId = Math.floor(Math.random() * 10000);

  this.j('#clocking-tool-template').tmpl({
    formUrl: this.createUrl,
    today: todayString,
    refreshImage: this.images.refresh,
    randomId: randomId,
    helpUrl: this.helpUrl
  }).appendTo(this.container);
  this.calendarPopup(randomId);
  this.addPopupLink();
  this.addStubData();
  this.addWelcomeMessage();
  this.showRecentIssues();
  this.hideGoToIssue();
  this.disableFormFields();
  this.setupEventBindings();
}

ClockingTool.prototype.calendarPopup = function(randomId) {
  if (typeof Calendar != "undefined") {
    Calendar.setup({
      inputField : 'time_entry_spent_on_' + randomId,
      ifFormat : '%Y-%m-%d',
      button : 'time_entry_spent_on_' + randomId + '_trigger'
    });
  }
}

ClockingTool.prototype.addWelcomeMessage = function() {
  this.j(this.container + " .header .message-box").html("Hi " + this.currentUserName + ", please clock your time below");
}

ClockingTool.prototype.changeMessage = function(message) {
  this.j(this.container + " .header .message-box").html(message);
}

ClockingTool.prototype.addPopupLink = function() {
  var popupUrl = this.rootUrl + 'clocking_tool';
  var popupLink = this.j("<a>").
    html("<img src='" +this.images.window + "'>").
    attr("href", popupUrl).
    attr("target", "_blank").
    attr('onclick',"window.open('" + popupUrl + "', '', 'resizable=yes, location=no, width=600, height=400, menubar=no, status=no, scrollbars=yes'); return false;");
  this.j(this.container + " .header .popout").html(popupLink);
}

ClockingTool.prototype.showGoToIssue = function(issueId) {
  var target = this.embedded ? '' : '_blank';

  this.j(this.container + " .jump-to-issue").
    attr('href', this.rootUrl + 'issues/' + issueId).
    attr('target', target).
    show();
}

ClockingTool.prototype.hideGoToIssue = function() {
  this.j(this.container + " .jump-to-issue").hide();
}

// TODO: might work better as an event. Since this requires projects and issues
// to be loaded, there are chances that there is missing data not loaded yet
ClockingTool.prototype.showRecentIssues = function() {
  var container = this.j(this.container + " .issues-container ul.issue-results").empty();
  var clockingTool = this;

  _.each(this.recentIssues, function(recentIssue) {
    var project = clockingTool.findProject(recentIssue.project_id);
    if (project) {
      var issue = clockingTool.findIssueInProject(project, recentIssue.issue_id);

      if (issue) {
        var resultString = project.name + " &gt " + issue.subject;
        var link = "<a class='recent-issue' data-project-id='" + project.id + "' data-issue-id='"+issue.id+"' href='#' title='" + resultString + "'>" + resultString + "</a>";
        var searchItem = clockingTool.j("<li>").html(link);

        container.append(searchItem);
      }

    }

  });
}

/** Utilities **/

// Add some stub data during development
ClockingTool.prototype.addStubData = function() {
}

ClockingTool.prototype.urlBuilder = function(relativeRequestPath, params) {
  return this.rootUrl + relativeRequestPath + "?" + params + "&key=" + this.apiKey;
}

// Test if localStorage is present and supported in the browser
if (typeof(localStorage) == 'undefined') {
  console.log("clocking_tool.js: localStorage not supported, falling back to non-persistant object storage");
  localStorage = new Object();
  localStorage.getItem = function(key) { }
  localStorage.setItem = function(key, value) { }
  localStorage.clear = function() { }
}
