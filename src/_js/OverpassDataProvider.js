class OverpassDataProvider {
    constructor() {
        this.endpoint = 'https://overpass-api.de/api/';
    }

    fetch(query) {
        // TODO: Return a normalized array of feature objects; eliminate
        // dependence on vendor-specific data structures.
        return fetch(this.buildOverpassUrl(query));
    }

    buildOverpassUrl(query) {
        return this.endpoint + 'interpreter?data=[out:json];' + query;
    }
}
