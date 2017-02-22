// TODO: This is a hot-mess of quick functional prototyping. Give this code a
// good scrubbing before making it public!

(function(L){
    // const gpx = '/assets/Big_Bad_Bike_Ride_2016.gpx'; // The route file
    const gpx = '/assets/York_to_Manchester.gpx'; // The route file
    const mapbox_access_token = document.querySelector('script[type="x-mapbox-access-token"]').text;
    const cyclestreets_api_key = document.querySelector('script[type="x-cyclestreets-api-key"]').text;
    const markerClusterEnabled = true;
    const type_json = JSON.parse(document.querySelector('script[type="x-routepoi-types"]').text);
    const type_icons = {};
    const type_layers = {};
    const type_checkboxes = document.querySelectorAll('input[name="types[]"]');

    const search_radius = 1; // How far around the route to search, in km.
    const search_boxes_visualisation = {}; // Visualisations of the search boxes

    // TODO: Look at Leaflet.FeatureGroup.SubGroup for toggling markers by type.
    const points_of_interest_layer = markerClusterEnabled ? L.markerClusterGroup() : new L.LayerGroup();

    // var places_api; // Google Places API
    let search_boxes; // Bounding boxes to search in for POI along the route
    const attribution = ['Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                   'Imagery © <a href="https://mapbox.com">Mapbox</a>',
                   'POI data via <a href="https://www.cyclestreets.net">CycleStreets</a>'].join(', ');

    const poi_data_provider = new localStorageCacheForDataProvider(
        'cyclestreets',
        new CycleStreetsDataProvider(cyclestreets_api_key),
        60 * 60 * 24 // Cache for 24hrs
    );

    // Create map
    const map = new L.map('route-map', {
        renderer: L.svg()
    });

    // Add tiles
    const tileset = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: attribution,
        maxZoom: 18,
        style: 'outdoors-v10',
        accessToken: mapbox_access_token
    });

    tileset.addTo(map);

    const gpx_route = new L.GPX(gpx, {
        async: true,
        marker_options: {
            startIconUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-icon-start.png',
            endIconUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-icon-end.png',
            shadowUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-shadow.png'
        }
    });

    map.addLayer(points_of_interest_layer);

    for(let type of type_json) {
        type_icons[type.name] = new L.icon({
            iconUrl: 'data:image/png;base64,' + type.icon,
            iconSize: [16, 16]
        });

        type_layers[type.name] = new L.FeatureGroup.SubGroup(points_of_interest_layer);
        type_layers[type.name].addTo(map);
    }

    gpx_route
        .on('loaded', function(e) {
          map.fitBounds(e.target.getBounds());
        })
        .addTo(map);

    // Generate the bounding boxes search areas, plot them, find places within them.
    gpx_route.on('loaded', fetchPois);

    // -------------------------------------------------------------------------

    function fetchPois(){
        // TODO: Must be a better way of extracting the Polyline?
        findLayerType(gpx_route, L.Polyline, function(layer){
            search_boxes = L.RouteBoxer.box(layer.getLatLngs(), search_radius);
            search_boxes.forEach(drawBoundingBox);

            // We don't want to hammer our data provider with lots of
            // queries, so load sequentially.
            let i = 0;
            const boundingBoxLooper = function boundingBoxLooper(results) {

                if (results !== undefined) {

                    renderPointsOfInterest(results);
                }

                if (i > search_boxes.length - 1) {
                    return;
                }

                findPlacesInBoundingBox(search_boxes[i], boundingBoxLooper);
                i++;
            };
            boundingBoxLooper();
        });
    }

    // -------------------------------------------------------------------------

    function drawBoundingBox(box) {
        // Bound box already drawn. Reset styling for now.
        if (search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)] !== undefined) {
            search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)].setStyle({
                color: '#03f',
                fillOpacity: 0.2,
                weight: 5,
            });
            return;
        }

        let rectangle = new L.Rectangle(box);
        search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)] = rectangle;
        rectangle.addTo(map);

        // Log bounds on click, for maximum debugs
        rectangle.on('click', (e) => {
            console.log('SWNE', L.LatLngBoundsToSWNEBbox(e.target.getBounds()));
            console.log('WSEN', L.LatLngBoundsToWSENBbox(e.target.getBounds()));
        });
    }

    // -------------------------------------------------------------------------

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            const error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    // -------------------------------------------------------------------------

    function findPlacesInBoundingBox(box, callback) {
        poi_data_provider
            .fetch(
                box,
                Object.keys(type_icons)
            )
            .then((data) => {
                search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)].setStyle({
                    color: '#0c3',
                    fillOpacity: 0,
                    weight: 1,
                });

                return data;
            })
            .then(callback)
            .catch((error) => {
                console.log('request failed', error);
            });
    }

    // -------------------------------------------------------------------------

    function renderPointsOfInterest(pois) {
        pois.forEach(function(poi) {
            let marker = L.marker(poi.position, {
                title: poi.name
            });

            if (type_icons[poi.type] !== undefined) {
                marker.setIcon(type_icons[poi.type]);
            }

            marker.addTo(
                type_layers[poi.type]
            );
        });
    }

    // -------------------------------------------------------------------------

    // Recursively look through the layer and its children until a layer of the
    // given type is found
    function findLayerType(root_layer, desiredClass, callback) {
        if (root_layer instanceof desiredClass) {
            callback(root_layer);
            return;
        }

        if (root_layer.getLayers === undefined) {
            return;
        }

        const layers = root_layer.getLayers();
        for (let i = layers.length - 1; i >= 0; i--) {
            findLayerType(layers[i], desiredClass, callback);
        }
    }

    // ------------

    function getSelectedTypes() {
        return new Promise((resolve, reject) => {
            let selected_type_elems = document.querySelectorAll('input[name="types[]"]:checked');

            resolve(Array.prototype.map.call(selected_type_elems, type => {
                return type.value;
            }));
        });
    }
    getSelectedTypes();

    // ----------

    function onTypeCheckboxChange() {
        getSelectedTypes()
            .then(selected_types => {
                for(let type in type_layers) {
                    map.removeLayer(type_layers[type]);
                }

                selected_types.forEach(type => {
                    map.addLayer(type_layers[type]);
                });
            });
    }

    // Attach event handlers to type checkboxes.
    Array.prototype.map.call(type_checkboxes, (checkbox_elem) => {
        checkbox_elem.addEventListener('change', onTypeCheckboxChange);
    });
})(L);