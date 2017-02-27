class Route {
    constructor(gpx_url) {
        this.gpx_url = gpx_url;
        this.polyline = undefined;
        this.layer = new L.FeatureGroup();
    }

    _loadGpx() {
        return fetch(
            this.gpx_url,
            {
                method: 'GET',
                headers: {
                  "Content-Type": "text, xml"
                }
            }
        )
            .then(response => {
                return response.text();
            })
            .then(this._createPolylineFromGpx.bind(this))
            .then(polylines => {
                polylines.forEach(polyline => {
                    // TODO: There may be multiple lines here. For now we'll
                    // just use the latest, but this isn't ideal.
                    this.polyline = polyline;
                    this.layer.addLayer(polyline);
                });

                return this.layer;
            });
    }

    _createPolylineFromGpx(xml) {
        var parser = new DOMParser();
        let gpxDom = parser.parseFromString(xml, "text/xml");

        return [
            ['rte', 'rtept'],   // Routes
            ['trkseg', 'trkpt'] // Tracks
        ]
            .map(this._createPolyline.bind(this, gpxDom))
            .filter(polyline => {
                return polyline !== undefined;
            });
    }

    _createPolyline(gpxDom, tags) {
        let [routeTag, pointTag] = tags;
        let routeElems = gpxDom.getElementsByTagName(routeTag);
        if (routeElems.length === 0)
            return;

        let coords = this._parseRoute(pointTag, routeElems[0]);

        return new L.Polyline(coords);
    }

    _parseRoute(pointTag, routeElem) {
        return Array.prototype.map.call(
            routeElem.getElementsByTagName(pointTag),
            this._parsePoint
        );
    }

    _parsePoint(point) {
        let point_data = new L.LatLng(
            point.getAttribute('lat'),
            point.getAttribute('lon')
        );

        // Could extract more meta-data, e.g. time, heart rate, temp, etc...
        // if this was a route.
        // Irrelevant to this application though.

        return point_data;
    }
};