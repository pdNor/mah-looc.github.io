import Cache from "./cache.js";
import Core from "./core.js";
import setupQuiz from "./quiz.js";
import { byId, bySelector, getUrlParams } from "./helpers.js";

// React components
import AddPath from "./components/add-path.js";
import CreatePath from "./components/create-path.js";
import Sidebar from "./components/sidebar.js";
import Profile from "./components/profile.js";

let React = window.React,
    Location = window.location;

// Update cache with data from webstorage
// (otherwise fetch the local data from the current server)
Cache.refresh();

function main() {
    // TODO: better solution for this?
    
    // Elements used to activate certain features
    let sidebar = byId("sidebar"),
        codeExamples = bySelector(".highlight"),
        spoilers = bySelector(".spoiler"),
        quiz = byId("quiz-container"),
        addPathComponent = byId("add-path-container"),
        createPathComponent = byId("create-path-container"),
        sidebarComponent = byId("app-sidebar"),
        profileComponent = byId("profile-container");

    // Common stuff
    Core.setExternalHrefs();
    Core.setStickyFooter();
    Core.setAnchorsToHeaders();
    Core.highlightNavigation();
    // Sidebar
    if (sidebar) {
        Core.setSidebar();
    }
    // Code examples
    if (codeExamples.length) {
        codeExamples.map(e => {
            Core.addLineNumberButton(e);
            Core.addCodePenButton(e);
        });
    }
    // Spoilers
    if (spoilers.length) {
        spoilers.map(e => Core.addSpoilerButton(e));
    }
    // Quiz
    if (quiz) {
        // TODO: create a proper react component for this
        setupQuiz();
    } 

    // React Components

    // Add path
    if (addPathComponent) {
        let hash = getUrlParams(Location.search.substring(1)).hash || "";
        React.render(<AddPath hash={hash} />, addPathComponent);
    }
    // Sidebar
    if (sidebarComponent) {
        React.render(<Sidebar />, sidebarComponent);
    }
    // Profile
    if (profileComponent) {
        React.render(<Profile />, profileComponent);
    }
    // Create path
    if (createPathComponent) {
        React.render(<CreatePath />, createPathComponent);
    }
}

window.addEventListener("load", function load() {
    window.removeEventListener("load", load, false);
    main();
}, false);
