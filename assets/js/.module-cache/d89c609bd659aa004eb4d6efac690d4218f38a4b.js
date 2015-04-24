"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Domains = { items: [] },
        User = {};

    // TODO check localStorage

    if (Storage.getItem("domains")) {
        Domains.items = JSON.parse(Storage.getItem("domains"));
    } else {
        Http.get("/search.json")
            .then(function(response) {
                Domains.items = response;
                Storage.setItem("domains", JSON.stringify(response));
            });
    }

    var DomainList = React.createClass({displayName: "DomainList",
        getInitialState: function() {
            return { data: Domains.items };
        },
        render: function() {

        }
    });

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

    }, false);

})(window, document);
