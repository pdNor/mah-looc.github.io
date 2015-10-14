// "Converts" a HTML NodeList to an array
function toArray(nodes) {
    let a = [],
        l = nodes.length;

    for (let i = 0; i < l; i++) {
        a.push(nodes[i]);
    }

    return a;
}

// Shuffle an array (http://stackoverflow.com/a/6274381)
function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// Return an HTML element by id
function byId(id) {
    return document.getElementById(id);
}

// Return an array of HTML elements by class
function bySelector(cls) {
    return toArray(document.querySelectorAll(cls));
}

// Return an array of HTML elements by tagname
function byTag(tag) {
    return toArray(document.getElementsByTagName(tag));
}

// Create a new HTML element
function create(elm) {
    return document.createElement(elm);
}

// Check for a needle in a haystack with regexp
function startsWith(needle, haystack) {
    return (new RegExp("^" + needle)).test(haystack);
}

// Shorthand for adding a click event to an element
function click(elm, cb) {
    return elm.addEventListener("click", cb, false);
}

// Check for one of three languages (for codepen)
function hasWebLang(lang) {
    let languages = [
        "css", "language-css",
        "html", "language-html",
        "js", "language-js"
    ];

    return Boolean(languages.indexOf(lang) > -1);
}

// Source: http://stackoverflow.com/a/2880929
function getUrlParams(query) {
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

// Exports functions
export default {
    toArray,
    shuffle,
    byId,
    bySelector,
    byTag,
    create,
    startsWith,
    click,
    hasWebLang,
    getUrlParams
};
