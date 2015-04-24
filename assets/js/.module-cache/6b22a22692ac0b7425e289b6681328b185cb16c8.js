"use strict";

// Don't clutter global namespace
(function(window, document) {


// On page load
window.addEventListener("load", function load() {
    // Only run event listener once
    window.removeEventListener("load", load, false);

}, false);

})(window, document);
