var Clocking = (function() {
  var data = {"gi": "f"};

  var getData = function() {
    return data;
  };

  // Load data from "remote" data storage into local
  var loadData = function() {
    data = window.data; // Using script to parse this in global scope already
  };

  var debugLog = function(message) {
    $('#debug-log').append('<pre>' + message + '</pre>');
  };

  var populateProjectSelect = function() {
    _.each(data.projects, function (project) {
      var optionElement = $('<option>').attr('value', project.id).html(project.name);
      $('#project').append(optionElement);
    });
  };

  var projectNames = function() {
    return _.map(data.projects, function (project) { return project.name });
  };

  var search = function(projectName, query) {
    var selectedProject = _.find(data.projects, function (project) {
      return project.name == projectName;
    });
    var projectIssues = selectedProject.issues;

    return _.filter(projectIssues, function (issues) {
      // #search is native code in Chrome
      // return issues.searchData.search(new RegExp(query, "i")) != -1;
      // #match is native code in Chrome
      return issues.searchData.match(new RegExp(query, "i"));
    });
  };

  var initialize = function() {
    $(document).ready(function() {
      initializeAfterDomLoaded();
    });
  };

  var initializeAfterDomLoaded = function() {
    loadData();
    populateProjectSelect();
  };

  // Public API
  return {
    initialize: initialize,
    getData: getData,
    projectNames: projectNames,
    search: search,
    log: debugLog
  }
})();

Clocking.initialize();
