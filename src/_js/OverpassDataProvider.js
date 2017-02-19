class OverpassDataProvider {
    constructor() {
        this.endpoint = 'https://overpass-api.de/api/';
    }

    fetch(query) {
        return fetch(this.buildOverpassUrl(query));
    }

    buildOverpassUrl(query) {
        return this.endpoint + 'interpreter?data=[out:json];' + query;
    }
}
