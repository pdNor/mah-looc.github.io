// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Location = window.location,
        Cache;

    var Endpoints = {
        addPath: ""
    };

    // Source: http://stackoverflow.com/a/2880929
    function getParams(query) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            urlParams = {};

        while ((match = search.exec(query))) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    }
    
    // Hash generated form path of modules from the URL
    var pathHash = getParams(Location.search.substring(1)).hash || "";

    // Main component with all the data
    var Form = React.createClass({
        render: function() {
            return <p>{this.props.hash}</p>;
        }
    });

    // * Kort beskrivande text?
    // * Visa formulär där användarkoden kan fyllas i
    // * -> "Laddar"
    // * -> / "Vägen är nu tillagd, vänligen gå till (?) och logga in"
    // * -> / "Inkorrekt användarkod, vänligen försök igen"
    // * -> / "Användaren har redan denna väg"

    // Övrigt:
    // Ska den valda hashen även visas (dvs. innehållet) för att sedan godkännas?

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            <Form hash={pathHash}/>,
            document.getElementById("add-path-container")
        );

    }, false);
// Invoke anonymous function
})(window, document);
