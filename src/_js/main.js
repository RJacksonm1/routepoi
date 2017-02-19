// TODO: This is a hot-mess of quick functional prototyping. Give this code a
// good scrubbing before making it public!

L.LatLngBoundsToBbox = function(latLngBounds) {
    return [
        latLngBounds._southWest.lat,
        latLngBounds._southWest.lng,
        latLngBounds._northEast.lat,
        latLngBounds._northEast.lng
    ].join(',');
};

(function(L){
    var gpx; // The route file
    var gpx_route; // GPX Layer containing the route
    var map;
    // var places_api; // Google Places API
    var search_boxes; // Bounding boxes to search in for POI along the route
    var search_boxes_visualisation = {}; // Visualisations of the search boxes
    var search_radius = 1; // How far around the route to search, in km.
    var tileset; // The maps tiles
    var attribution; // Attribution for various data sources
    var mapbox_access_token = document.querySelector('script[type="x-mapbox-access-token"]').text;
    var pointsOfInterestLayer;

    var poi_data_provider = new localStorageCacheForDataProvider(
        'overpass_point',
        new OverpassDataProvider()
    );

    // gpx = '/assets/Big_Bad_Bike_Ride_2016.gpx';
    gpx = '/assets/York_to_Manchester.gpx';

    // Create map
    map = new L.map('route-map', {
        renderer: L.svg()
    });
    map.setView([51.505, -0.09], 13);

    attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    attribution += ', Imagery © <a href="http://mapbox.com">Mapbox</a>';
    attribution += ', POI via <a href="http://www.overpass-api.de/">Overpass API</a>';

    // Add tiles
    tileset = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: attribution,
        maxZoom: 18,
        style: 'outdoors-v10',
        accessToken: mapbox_access_token
    });

    tileset.addTo(map);

    gpx_route = new L.GPX(gpx, {
        async: true,
        marker_options: {
            startIconUrl: '/assets/vendor/src/_vendor/leaflet-gpx-1.2.0/pin-icon-start.png',
            endIconUrl: '/assets/vendor/src/_vendor/leaflet-gpx-1.2.0/pin-icon-end.png',
            shadowUrl: '/assets/vendor/src/_vendor/leaflet-gpx-1.2.0/pin-shadow.png'
        }
    });

    pointsOfInterestLayer = new L.LayerGroup();
    map.addLayer(pointsOfInterestLayer);

    gpx_route
        .on('loaded', function(e) {
          map.fitBounds(e.target.getBounds());
        })
        .addTo(map);

    // Generate the bounding boxes search areas, plot them, find places within them.
    gpx_route.on('loaded', function(e){

        findLayerType(gpx_route, L.Polyline, function(layer){
            search_boxes = L.RouteBoxer.box(layer.getLatLngs(), search_radius);
            search_boxes.forEach(drawBoundingBox);

            // We don't want to hammer our data provider with lots of
            // queries, so load sequentially.
            var i = 0;
            var boundingBoxLooper = function boundingBoxLooper(results) {

                if (results !== undefined) {

                    renderPointsOfInterest(results.elements);
                }

                if (i > search_boxes.length - 1) {
                    return;
                }

                findPlacesInBoundingBox(search_boxes[i], boundingBoxLooper);
                i++;
            };
            boundingBoxLooper();
        });
    });

    // -------------------------------------------------------------------------

    function drawBoundingBox(box) {
        search_boxes_visualisation[L.LatLngBoundsToBbox(box)] = new L.Rectangle(box).addTo(map);
    }

    // -------------------------------------------------------------------------

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    // -------------------------------------------------------------------------

    function findPlacesInBoundingBox(box, callback) {
        var bbox = L.LatLngBoundsToBbox(box);

        poi_data_provider
            .fetch('node["amenity"~"(cafe|fast_food|biergarten|bar|pub)"](' + bbox + ');out;')
            .then((data) => {
                search_boxes_visualisation[bbox].setStyle({
                    color: '#0c3',
                    fillOpacity: 0,
                    weight: 1,
                });

                return data;
            })
            .then(callback)
            .catch((error) => {
                console.log('request failed', error)
            });

            // function(data) {
                // search_boxes_visualisation[bbox].setStyle({
                //     color: '#0c3',
                //     fillOpacity: 0,
                //     weight: 1,
                // });

            //     callback(data);
            // },
            // function(xhr){
            //     console.log('Failed to fetch data, %s', xhr);
            // }

        // TODO: Wrap these queries up in a data provider class, with a
        // caching layer inbetween. This should greatly speed up re-visits to
        // previously checked routes. How long to cache for?

        // TODO: OverPassLayer binds querying and presentation together; write a
        // custom implementation that separates these, and thereby allows us to
        // query multiple bound boxes but render all to a single layer (this
        // library forces us to a separate layer for each bound box; hell, we
        // even had to extend it to be able to search by boundbox)
        // var opl = new L.OverPassLayer({
        //     query: 'node["amenity"~"(cafe|fast_food|biergarten|bar|pub)"](' + bbox + ');out;',
        //     // query: 'node[amenity](' + bbox + ');out;',
        //     minZoom: 1,
        //     onSuccess: function(data) {

        //         if (callback)
        //             callback(data.elements);
        //     },
        // });

        // map.addLayer(opl);
    }

    // -------------------------------------------------------------------------

    function renderPointsOfInterest(pois) {
        pois.forEach(function(poi) {

            let position = new L.LatLng(
                poi.center ? poi.center.lat : poi.lat,
                poi.center ? poi.center.lon : poi.lon
            );


            let marker = L.marker(position);
            marker.addTo(pointsOfInterestLayer);
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

        var layers = root_layer.getLayers();
        for (var i = layers.length - 1; i >= 0; i--) {
            findLayerType(layers[i], desiredClass, callback);
        }
    }

})(L);