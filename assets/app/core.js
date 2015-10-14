// Dependencies
import {
    toArray,
    shuffle,
    byId,
    bySelector,
    byTag,
    create,
    startsWith,
    click,
    hasWebLang
} from "./helpers.js";

let Location = window.location;

// Anchors with external hrefs gets target="_blank"
function setExternalHrefs() {
    let anchors = byTag("a"),
        url = Location.protocol + "//" + Location.host;

    return anchors
        .filter((a) => !startsWith(url, a.href))
        .map((a) => (a.target = "_blank"));
}

// Add anchors to content headers
function setAnchorsToHeaders() {
    let headers = bySelector("#content h1, #content h2, #content h3");

    function appendAnchor(header) {
        let a = create("a");
        a.href = "#" + header.id;
        a.className = "header-anchor";
        header.appendChild(a);
        return header;
    }

    return headers
        .filter((h) => h.id ? true : false)
        .map(appendAnchor);
}

// Sticky footer, sets min-height if content height isn't enough
function setStickyFooter() {
    let content = byId("content"),
        wH = window.innerHeight,
        bH = document.body.clientHeight,
        cH = content.offsetHeight;

    if (wH - bH > 0) {
        content.style.minHeight = (wH - (bH - cH)) + "px";
    }
}

// Sets the sidebar features for toggling visibility
function setSidebar() {
    let sidebar = byId("sidebar"),
        header = byId("header"),
        sidebarButton = byId("toggle-sidebar"),
        courseElms = bySelector(".course-overview-element"),
        anchors = bySelector("#sidebar ul ul a");

    // Add the "fix-sidebar" class to the sidebar when scrolling
    window.addEventListener("scroll", () => {
        let top = document.scrollTop || document.body.scrollTop,
            cls = document.body.classList;

        if (top > header.offsetHeight) {
            if (!cls.contains("fix-sidebar")) {
                cls.add("fix-sidebar");
            }
        } else {
            cls.remove("fix-sidebar");
        }
    }, false);

    // Toggle visibility of the sidebar
    click(sidebarButton, () => sidebar.classList.toggle("toggle"));
    // Toggle visibility of course elements (assignments, exercises, etc.)
    courseElms.map(el => click(el, e => e.target.classList.toggle("toggle")));
    // Add the "active" class to the current active sidebar navigation anchor
    anchors
        .filter(a => startsWith(a.href, Location.href))
        .map(a => {
            a.classList.add("active");
            // TODO: better solution for this...
            a.parentNode.parentNode.previousElementSibling.classList.add("toggle");
        });
}

// Add the "current" class to the current navigation anchor
function highlightNavigation() {
    let anchors = bySelector(".navigation li a");

    // Filter out exact matches
    let found = anchors
            .filter(a => a.href == Location.href.replace(/\+$/, ""))
            .map(a => a.classList.add("current"));

    // If no was found use the starting pathname instead
    if (!found.length) {
        anchors
            .filter(a => startsWith(a.href, Location.href))
            .map(a => a.classList.add("current"));
    }
}

// Creates a button that toggles line numbers in code examples
function createLineNumberButton() {
    let btn = create("button"),
        txt = document.createTextNode("radnummer"),
        show = create("span"),
        hide = create("span");

    btn.className = "toggle-lineno";
    btn.type = "button";
    show.className = "show";
    show.textContent = "Visa ";
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
        return;
    }

    let btn = createLineNumberButton();
    click(btn, () => btn.parentElement.classList.toggle("toggle"));
    element.appendChild(btn);

    return;
}

// Serialize contents of a code example
function serializeCode(element) {
    let code = element.firstChild.firstChild,
        lang = code.className,
        data = {};

    let content = toArray(code.childNodes)
            .filter(n => n.className == "lineno" ? false : true)
            .reduce((p, c) => p + c.textContent, "");

    data[lang.substr(9)] = content;
    data["title"] = "Code Example";
    return data;
}

// Sends contents of a code example to CodePen
function submitToCodePen(element) {
    let data = serializeCode(element);

    if (!data) {
        return;
    }

    let form = create("form"),
        input = create("input"),
        json = JSON.stringify(data)
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
    var lang = element.firstChild.firstChild.className;

    if (!hasWebLang(lang)) {
        return false;
    }

    let btn = create("button");
    btn.textContent = "Öppna i CodePen";
    btn.className = "codepen-button";
    btn.type = "button";

    click(btn, () => submitToCodePen(btn.parentElement));

    return element.appendChild(btn);
}

// Create the button to show/hide spoiler text
function createSpoilerButton(element) {
    let btn = create("button");
    btn.type = "button";
    btn.className = "show-spoiler";
    btn.textContent = "Visa svar";

    // Toggle visibility with classes
    click(btn, () => {
        if (btn.className == "show-spoiler") {
            element.className = "spoiler show";
            btn.className = "hide-spoiler";
            btn.textContent = "Dölj svar";
        } else {
            element.className = "spoiler";
            btn.className = "show-spoiler";
            btn.textContent = "Visa svar";
        }
    });

    return btn;
}

// Add a spoiler button to an element
function addSpoilerButton(element) {
    let btn = createSpoilerButton(element);
    element.parentNode.insertBefore(btn, element.nextSibling);
}

// Export all functions
export default {
    setExternalHrefs,
    setAnchorsToHeaders,
    setStickyFooter,
    setSidebar,
    highlightNavigation,
    addLineNumberButton,
    addCodePenButton,
    addSpoilerButton
};
