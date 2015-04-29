"use strict";

// Don't clutter global namespace
(function(window, document) {

// Convert a HTML NodeList to an array
function toArray(nodes) {
    var arr = [],
	len = nodes.length;

    for (var i = 0; i < len; i++) {
	arr.push(nodes[i]);
    }

    return arr;
}

// Return element by id
function byId(id) {
    return document.getElementById(id);
}

// Return elements by class
function bySelector(cls) {
    return toArray(document.querySelectorAll(cls));
}

// Return elements by tag name
function byTag(tag) {
    return toArray(document.getElementsByTagName(tag));
}

// Returns a new HTML element
function create(tag) {
    return document.createElement(tag);
}

// Determine if haystack starts with needle
function startsWith(needle, haystack) {
    return (new RegExp("^" + needle)).test(haystack);
}

// Add a click event to an element
function click(element, callback) {
    return element.addEventListener("click", callback, false);
}

// Determine if language exists
function hasLanguage(lang) {
    var languages = [
	'css', 'language-css',
	'html', 'language-html',
	'js', 'language-js'
    ];

    return languages.indexOf(lang) > -1;
}

// Determine if we're in standlone mode
function inStandalone() {
    return ("standalone" in window.navigator) && window.navigator["standalone"];
}

// Activate sidebar functionality
function activateSidebar() {
    var sidebar = byId("sidebar");

    if (!sidebar || inStandalone()) {
	return false;
    }

    // Make sidebar fixed when scrolling
    var header = byId("header");
    window.addEventListener("scroll", function() {
	var top = document.scrollTop || document.body.scrollTop;

	if (top > header.offsetHeight) {
	    if (!document.body.classList.contains("fix-sidebar")) {
		document.body.classList.add("fix-sidebar");
	    }
	} else {
	    document.body.classList.remove("fix-sidebar");
	}
    }, false);

    // Toggles visibility of the sidebar
    var sidebarButton = byId("toggle-sidebar");
    click(sidebarButton, function() {
	sidebar.classList.toggle("toggle");
    });

    // Toggles visibility of course elements (assignments, exercises, etc.)
    var courseElements = bySelector(".course-overview-element");
    courseElements.forEach(function(el) {
	click(el, function(e) {
	    e.target.classList.toggle("toggle");
	});
    });

    return true;
}

// Adds a class to the current active navigation anchor
function highlightHeaderNavigation() {
    var anchors = bySelector(".navigation li a");

    anchors.filter(function(a) {
	// return startsWith(a.href, location.href);
        // TODO: temporary fix?
        return a.href == location.href.replace(/\/+$/, "");
    }).forEach(function(a) {
	a.classList.add("current");
    });

    return anchors;
}

// Adds a class to the current active sidebar navigation anchor
function highlightSidebarNavigation() {
    var anchors = bySelector("#sidebar ul ul a");

    anchors.filter(function(a) {
	return startsWith(a.href, location.href);
    }).forEach(function(a) {
	a.classList.add("active");
	// TODO: research a better solution for this.
	// a > li > ul > sibling (span)
	a.parentNode.parentNode.previousElementSibling.classList.add("toggle");
    });

    return anchors;
}

// Add an anchor to each header (1 - 3)
function addAnchorsToHeaders() {
    var headers = bySelector("#content h1, #content h2, #content h3");

    headers.filter(function(h) {
	return h.id ? true : false;
    }).forEach(function(h) {
	var a = create("a");
	a.href = "#" + h.id;
	a.className = "header-anchor";
	h.appendChild(a);
    });

    return headers;
}

// Make external links open in a new browser tab
function setTargetForExternalLinks() {
    var anchors = byTag("a");

    anchors.filter(function(a) {
	return !startsWith(location.protocol + "//" + location.host, a.href);
    }).forEach(function(a) {
	a.target = "_blank";
    });

    return anchors;
}

// Set minimum height for the content area; creates a "sticky" footer
function setContentHeight() {
    var content = byId("content"),
	wHeight = window.innerHeight,
	bHeight = document.body.clientHeight,
	cHeight = content.offsetHeight;

    if (wHeight - bHeight > 0) {
	content.style.minHeight = (wHeight - (bHeight - cHeight)) + "px";
    }

    return content;
}

// Add functionality to web app navigation elements
function setWebAppNavigation() {
    var curnode,
	sidebar = byId("sidebar");

    document.body.classList.add("standalone");

    if (sidebar) {
	var sidebarButton = byId("web-app-sidebar");
	click(sidebarButton, function() {
	    sidebarButton.classList.toggle("toggle");
	});
    }

    // Navigate up
    var up = byId("web-app-top");
    click(up, function() {
	document.body.scrollTop = document.documentElement.scrollTop = 0;
    });

    // Navigate back in history
    var prev = byId("web-app-prev");
    click(prev, function() {
	window.history.go(-1);
    });

    // Navigate forward in history
    var next = byId("web-app-next");
    click(next, function() {
	window.history.go(1);
    });

    click(document, function(e) {
	var re = /^(a|html)$/i;
	curnode = e.target;

	while (!re.test(curnode.nodeName)) {
	    curnode = curnode.parentNode;
	}

	if('href' in curnode &&
	   (curnode.href.indexOf('http') || ~curnode.href.indexOf(location.host))) {
	    e.preventDefault();
	    location.href = curnode.href;
	}
    });
}

// Creates a button that toggles line numbers in code examples
function createLineNumberButton() {
    var btn = create("button"),
	txt = document.createTextNode("radnummer");

    btn.className = "toggle-lineno";
    btn.type = "button";

    var show = create("span");
    show.className = "show";
    show.textContent = "Visa ";

    var hide = create("span");
    hide.className = "hide";
    hide.textContent = "Dölj ";

    btn.appendChild(show);
    btn.appendChild(hide);
    btn.appendChild(txt);

    return btn;
}

// Add the button that toggles line numbers to a code example
function addLineNumberButton(element) {
    // Only add a line number button if the code examples has line numbers
    if (element.firstChild.firstChild.childNodes[0].className != "lineno") {
	return false;
    }

    var btn = createLineNumberButton();
    click(btn, function() {
	this.parentElement.classList.toggle("toggle");
    });

    element.appendChild(btn);

    return true;
}

// Serialize contents of a code example
function serializeCode(element) {
    var code = element.firstChild.firstChild,
	language = code.className,
	data = {};

    // Code has to be HTML, CSS or JS
    if (!hasLanguage(language)) {
	return false;
    }

    var content = toArray(code.childNodes)
	    .filter(function(n) {
		return n.className == "lineno" ? false : true;
	    })
	    .reduce(function(prev, curr) {
		return prev + curr.textContent;
	    }, "");

    data[language.substr(9)] = content;
    data["title"] = "Code Example";
    return data;
}

// Sends contents of a code example to CodePen
function submitToCodePen(element) {
    var serialized = serializeCode(element);

    if (!serialized) {
	return false;
    }

    var form = create("form"),
	input = create("input");

    var json = JSON.stringify(serialized)
	    .replace(/"/g, "&quot;")
	    .replace(/'/g, "&apos;");

    input.setAttribute("type", "hidden");
    input.setAttribute("name", "data");
    input.setAttribute("value", json);
    form.setAttribute("method", "post");
    form.setAttribute("action", "http://codepen.io/pen/define");
    form.setAttribute("target", "_blank");
    form.appendChild(input);
    document.body.appendChild(form);

    return form.submit();
}

// Adds a button that sends the code to CodePen to a code example
function addCodePenButton(element) {
    var language = element.firstChild.firstChild.className;

    if (!hasLanguage(language)) {
	return false;
    }

    var btn = create("button");
    btn.textContent = "Öppna i CodePen";
    btn.className = "codepen-button";
    btn.type = "button";

    click(btn, function() {
	submitToCodePen(this.parentElement);
    });

    return element.appendChild(btn);
}

// Extend code examples with further functionality
function extendCodeExamples() {
    var examples = bySelector(".highlight");

    examples.forEach(function(example) {
	addLineNumberButton(example);
	addCodePenButton(example);
    });

    return examples;
}

// On page load
window.addEventListener("load", function load() {
    // Only run event listener once
    window.removeEventListener("load", load, false);

    setContentHeight();
    activateSidebar();
    highlightHeaderNavigation();
    highlightSidebarNavigation();
    addAnchorsToHeaders();
    setTargetForExternalLinks();
    extendCodeExamples();

    // Only add web app navigation if we're in standalone mode
    if (inStandalone()) {
	setWebAppNavigation();
    }
}, false);

})(window, document);
