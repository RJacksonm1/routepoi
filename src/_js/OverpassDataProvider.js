class OverpassDataProvider {
    constructor() {
        this.endpoint = 'https://overpass-api.de/api/';
    }

    fetch(latLngBounds, type) {
        return fetch(this.buildOverpassUrl(latLngBounds, type))
                .then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        return response;
                    } else {
                        var error = new Error(response.statusText);
                        error.response = response;
                        throw error;
                    }
                })
                .then(response => { return response.json(); })
                .then(this.mapResponseToPointOfInterests.bind(this));
    }

    buildOverpassUrl(latLngBounds, type) {
        return this.endpoint +
            'interpreter?data=[out:json];' +
            'node["amenity"~"(cafe|fast_food|biergarten|bar|pub)"](' +
            L.LatLngBoundsToSWNEBbox(latLngBounds) +
            ');out;';
    }

    mapResponseToPointOfInterests(response) {
        return response.elements.map(this.createPointOfInterest);
    }

    createPointOfInterest(feature) {
        return new PointOfInterest(
            feature.tags.name,
            feature.center ? feature.center.lat : feature.lat,
            feature.center ? feature.center.lon : feature.lon
        );
    }
}
