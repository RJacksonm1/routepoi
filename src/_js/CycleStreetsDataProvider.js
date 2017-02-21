class CycleStreetsDataProvider {
    constructor(api_key, fields, limit) {
        this.endpoint = 'https://api.cyclestreets.net/v2/pois.locations';
        this.api_key = api_key;
        this.fields = fields || [
            'id',
            'latitude',
            'longitude',
            'name',
            'osmTags'
        ];
        this.limit = limit || 400;
    }

    fetch(latLngBounds, types) {

        if (types instanceof Array) {
            return Promise.all(types.map(this.fetchSingle.bind(this, latLngBounds)))
            .then(data => {
                return [].concat.apply([], data);
            });
        }

        return this.fetchSingle(latLngBounds, types);
    }

    fetchSingle(latLngBounds, type) {
        return fetch(this.endpoint + '?' + this.generateQueryParams(latLngBounds, type))
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
                .then(this.mapResponseToPointOfInterests.bind(this, type));
    }

    generateQueryParams(latLngBounds, type) {
        // TODO: Need a polyfill for this
        let searchParams = new URLSearchParams();

        searchParams.set('type', type);
        searchParams.set('fields', this.fields.join(','));
        searchParams.set('limit', this.limit);

        // Cyclestreets takes bounding boxes as W S E N, unlike the OSM Overpass API (S W N E).
        searchParams.set('bbox', L.LatLngBoundsToWSENBbox(latLngBounds));

        // Can't set API key as a header as it isn't passed for CORS pre-flight,
        // check; so CORS check fails due to failed auth.
        searchParams.set('key', this.api_key);

        return searchParams.toString();
    }

    mapResponseToPointOfInterests(type, response) {
        return response.features.map(this.createPointOfInterest.bind(this, type));
    }

    createPointOfInterest(type, feature) {
        return new PointOfInterest(
            feature.properties.name,
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
            type
        );
    }
}
