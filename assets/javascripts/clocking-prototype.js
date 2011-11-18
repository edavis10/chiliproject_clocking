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

  var bindIssueSearch = function() {
    $('#issue_search').live('keyup', function() {
      var selectedProjectId = $('#project option:selected').val();
      var searchTerm = $('#issue_search').val();
      debugLog('Searching project "' + selectedProjectId + '" for "' + searchTerm + '"');

      var matches = search(selectedProjectId, searchTerm);
      debugLog('Found ' + matches.length + ' matches');

      showSearchResults(matches);
    });
  };

  var bindSelectingSearchResult = function() {
    $('#search-results li').live('click', function () {
      var issueId = $(this).data('issue-id');
      debugLog('Clicked issue #' + issueId);
      clearSearchResults();

      setForm(issueId);
    });
  };

  var clearSearchResults = function() {
    $('#search-results').html('');
  };

  var showSearchResults = function(results) {
    var resultList = $('#search-results').html($('<ul>'));
    _.each(results, function(issue) {
      var issueString = "#" + issue.id + ": " + issue.subject;
      resultList.append($('<li>').html(issueString).attr('data-issue-id', issue.id));
    });
  };

  var setForm = function(issueId) {
    debugLog("Setting issue id in form to " + issueId);
    $('#time_entry_issue_id').val(issueId);
  };

  var projectNames = function() {
    return _.map(data.projects, function (project) { return project.name });
  };

  var search = function(projectId, query) {
    var selectedProject = _.find(data.projects, function (project) {
      return String(project.id) == String(projectId);
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
    bindIssueSearch();
    bindSelectingSearchResult();
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
