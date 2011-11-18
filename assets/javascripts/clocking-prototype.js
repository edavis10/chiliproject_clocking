var Clocking = (function() {

  var initialize = function() {
    $(document).ready(function() {
      initializeAfterDomLoaded();
    });
  };

  var initializeAfterDomLoaded = function() {
  };

  // Public API
  return {
    initialize: initialize
  }
})();

Clocking.initialize();
