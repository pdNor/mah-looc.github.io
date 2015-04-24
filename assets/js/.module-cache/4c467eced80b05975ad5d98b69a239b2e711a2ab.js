"use strict";

// Don't clutter global namespace
(function(window, document) {
    var R = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Domains = { items: [] },
        User = {};

    // TODO check localStorage

    if (Storage.getItem("domains")) {
        Domains.items = JSON.parse(Storage.getItem("domains"));
    } else {

    }

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

    }, false);

})(window, document);
