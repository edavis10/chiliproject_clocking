var Clocking = (function() {
  var data = {"gi": "f"};

  var getData = function() {
    return data;
  };

  // Load data from "remote" data storage into local
  var loadData = function() {
    data = window.data; // Using script to parse this in global scope already
  };

  var initialize = function() {
    $(document).ready(function() {
      initializeAfterDomLoaded();
    });
  };

  var initializeAfterDomLoaded = function() {
    loadData();
  };

  // Public API
  return {
    initialize: initialize,
    getData: getData
  }
})();

Clocking.initialize();
