// Instance variables
let Location = window.location,
    isLocal = Location.hostname == "localhost" || Location.hostname == "127.0.0.1";

// Endpoints for HTTP requests
export default {
    localData: "/data.json",
    mahLoocAddPath: "http://mah-looc.github.io/path/add.html",
    addPath: isLocal ? "http://localhost:3000/api/add" : "http://178.62.76.67/api/add",
    createPath: isLocal ? "http://localhost:3000/api/paths" : "http://178.62.76.67/api/paths",
    submitQuiz: isLocal ? "http://localhost:3000/api/quiz" : "http://178.62.76.67/api/quiz",
    getUser: isLocal ? "http://localhost:3000/api/user" : "http://178.62.76.67/api/user"
};
