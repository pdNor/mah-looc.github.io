"use strict";

// Don't clutter global namespace
(function(window, document) {

    var R = window.React;

    React.render(
        React.createElement("h1", null, "Hello world!"),
        document.body
    );

    

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

    }, false);

})(window, document);
