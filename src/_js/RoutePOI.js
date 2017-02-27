class RoutePOI {
    constructor(mapbox_access_token, enable_marker_cluster, types_src, types_checkboxes, data_provider, debug) {
        // Configuration
        this.mapbox_access_token = mapbox_access_token;
        this.enable_marker_cluster = enable_marker_cluster || false;
        this.data_provider = data_provider;
        this.debug = debug || false; // Debug mode: Draws search area bounding boxes

        // Set up map
        this.map = this._createMap();
        this.tileset = this._setupTileset(this.map);

        // Set up layers for different types of POI
        this.poi_layer = this._setupPoiLayer(this.map);

        this.types = this._setupTypes(types_src, this.map, this.poi_layer);

        this._setupFilters(types_checkboxes);

        // The route we'll be scanning will be stored here.
        this.route = undefined;
        this.pois = []; // All POIs found on the above route
        this.search_boxes = {}; // Search box visualisations, if debug is on.
    }

    _createMap() {
        let map = L.map('route-map', {
            renderer: L.svg()
        });

        // New Yoik City.
        map.setView(new L.LatLng(53.959175, -1.081451), 12);

        return map;
    }

    _setupTileset(map) {
        let attribution = [
            'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            'Imagery © <a href="https://mapbox.com">Mapbox</a>',
            'POI data via <a href="https://www.cyclestreets.net">CycleStreets</a>'
       ].join(', ');

        let tileset = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: attribution,
            maxZoom: 18,
            style: 'outdoors-v10',
            accessToken: this.mapbox_access_token
        });

        tileset.addTo(map);

        return tileset;
    }

    _setupPoiLayer(map) {
        let layer;
        if (this.enable_marker_cluster)
            layer = new L.MarkerClusterGroup();

        if (layer === undefined)
            layer = new L.LayerGroup();

        layer.addTo(map);
        return layer;
    }

    _setupTypes(types_src, map, poi_layer) {
        let types = new Map();

        types_src.forEach(type => {
            types.set(type.name, new Type(type, map, poi_layer));
            types.get(type.name).show();
        });

        return types;
    }

    _setupFilters(types_checkboxes) {
        Array.prototype.forEach.call(types_checkboxes, checkbox => {
            this.types.get(checkbox.value).addCheckbox(checkbox);
            checkbox.addEventListener('change', this._filterResults.bind(this));
        });
    }

    _filterResults(e) {
        this.types.forEach(type => {
            if (!type.checkbox.checked) {
                type.hide();
                return;
            }

            type.show();
        });
    }

    addRoute(gpx) {
        this.route = new Route(gpx);
        return this.route._loadGpx()
            .then(layer => {
                this.map.addLayer(layer);
                this.map.fitBounds(layer.getBounds());
                return layer;
            });
    }

    search(radius) {
        let search_boxes = L.RouteBoxer.box(
            this.route.polyline,
            radius
        );

        if (this.debug)
            this._drawSearchBoxes(search_boxes);

        // TODO: Don't load these all at once.
        return new Promise((resolve, reject) => {
            Promise.all(search_boxes.map(this._searchBox.bind(this)))
                .then(box_results => {
                    // console.log(box_results);
                })
                .then(resolve);
        });
    }

    _searchBox(box, next) {
        return this.data_provider
            .fetch(
                box,
                Array.from(this.types.keys())
            )
            .then((data) => {
                if (this.debug)
                    this.search_boxes[L.LatLngBoundsToSWNEBbox(box)].setStyle({
                        color: '#0c3',
                        fillOpacity: 0,
                        weight: 1,
                    });

                return data;
            })
            .then((pois) => {
                pois.forEach(this._renderPoi.bind(this));
                return pois;
            })
            .then((pois) => {
                this.types.forEach(type => {
                    type.updateCounts();
                });
            })
            .catch((error) => {
                console.log('request failed', error);
            });
    }

    _drawSearchBoxes(search_boxes) {
        search_boxes.forEach(box => {
            let rectangle = new L.Rectangle(box);

            // Log bounds on click, for maximum debugs
            rectangle.on('click', (e) => {
                console.log('SWNE', L.LatLngBoundsToSWNEBbox(e.target.getBounds()));
                console.log('WSEN', L.LatLngBoundsToWSENBbox(e.target.getBounds()));
            });

            rectangle.addTo(this.map);
            this.search_boxes[L.LatLngBoundsToSWNEBbox(box)] = rectangle;
        });
    }

    _renderPoi(poi) {
        let marker = L.marker(poi.position, {
            title: poi.name
        });
        let type = this.types.get(poi.type);

        marker.setIcon(type.icon);
        marker.addTo(
            type.layer
        );

        return poi;
    }
}