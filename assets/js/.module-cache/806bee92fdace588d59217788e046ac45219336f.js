"use strict";

// Don't clutter global namespace
(function(window, document) {

    var R = window.React,
        storage = window.localStorage;

    // TODO check localStorage
    
    var domains = { items: [] };

    if (storage.getItem("domains")) {
        domains.items = JSON.parse(storage.getItem("domains"));
    } else {

    }

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

    }, false);

})(window, document);
