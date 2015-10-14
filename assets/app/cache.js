import ENDPOINTS from "./endpoints.js";

let Http = window.qwest,
    Storage = window.sessionStorage,
    identifier = "_mah-looc-data";

// Wrapper for webstorage
class Cache {
    constructor(storage, identifier) {
        this.storage = storage;
        this.identifier = identifier;
        // storage specific data
        this.cache = {
            user: null,
            domains: null,
            quizAnswers: null,
            lastUpdated: null
        };
    }
    // Go through all domains, re-assign the modules
    // property and filter out related modules, sort
    // all domains by ids
    buildDomainModuleTree(domains, modules) {
        return domains
            .map(domain => {
                // Re-assign all modules to each domain
                domain.modules = modules
                    .filter(module => module.domain == domain.id)
                    .map(module => {
                        module.mid = module.id;
                        delete module.id;
                        return module;
                    });
                return domain;
            })
            .sort((a, b) => {
                // Get numeric values for the ids (ex. "D01" > 1)
                let idA = +a.id.substring(1),
                    idB = +b.id.substring(1);
                return idB < idA ? 1 : -1;
            });
    }
    // Parse JSON data from webstorage
    getData() {
        return JSON.parse(this.storage.getItem(this.identifier));
    }
    // Check if any data is cached
    exists() {
        return Boolean(this.storage.getItem(this.identifier));
    }
    // Refresh the cache
    refresh() {
        if (this.exists()) {
            this.cache = this.getData();
            return;
        }

        // Update local data silently
        return Http.get(ENDPOINTS.localData)
            .then(res => {
                this.cache.domains = this.buildDomainModuleTree(res.domains, res.modules);
                this.cache.quizAnswers = res.answers;
                this.update();
            })
            .catch(e => console.log(e)); // TODO: error handling
    }
    // Update webstorage with new data
    update() {
        this.storage.setItem(this.identifier, JSON.stringify(this.cache));
    }
    // Update all quiz answers
    updateQuizAnswers(answers) {
        this.cache.quizAnswers = answers;
        this.update();
    }
    // Update the user object
    updateUser(user) {
        this.cache.user = user;
        this.update();
    }
    // Update the domains object
    updateDomains(domains) {
        this.cache.domains = domains;
        this.update();
    }
    // Check if a user is stored in the webstorage
    userExists() {
        if (this.exists()) {
            this.cache = this.getData();
            return this.cache.user ? true : false;
        }

        return false;
    }
    // Check if quiz answers are stored in the cache
    // otherwise fetch them from the local JSON file
    getQuizAnswers(callback) {
        if (this.cache.quizAnswers !== null) {
            return callback(this.cache.quizAnswers);
        }

        return Http.get(ENDPOINTS.localData)
            .then(res => {
                this.updateQuizAnswers(res.answers);
                callback(res.answers);
            })
            .catch(e => callback(e)); // TODO: error handling?
    }
    // Check if the domains are stored in the cache
    // otherwise fetch them from the local JSON file
    getDomains(callback) {
        if (this.cache.domains !== null) {
            return callback(this.cache.domains);
        }

        return Http.get(ENDPOINTS.localData)
            .then(res => {
                let domains = this.buildDomainModuleTree(res.domains, res.modules);
                this.updateDomains(domains);
                callback(domains);
            })
            .catch(e => callback(e)); // TODO: error handling?
    }
    // Check if the user is stored in the cache
    // otherwise fetch the user from the server (by code)
    getUser(code, callback) {
        if (this.cache.user !== null) {
            return callback(this.cache.user);
        }

        return Http.get(ENDPOINTS.getUser, { code: code })
            .then(res => JSON.parse(res))
            .then(res => {
                this.updateUser(res.user);
                callback(res.user);
            })
            .catch(e => callback(e)); // TODO: error handling?
    }
    // Getter for user
    get user() {
        return this.cache.user;
    }
    // Getter for domains
    get domains() {
        return this.cache.domains;
    }
    // Getter for quiz answers
    get quizAnswers() {
        return this.cache.quizAnswers;
    }
}

// Export the cache object (instance)
export default new Cache(Storage, identifier);
