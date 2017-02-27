(function(L){
    const cyclestreets_api_key = document.querySelector('script[type="x-cyclestreets-api-key"]').text;
    // const gpx = '/assets/Big_Bad_Bike_Ride_2016.gpx'; // The route file
    const gpx = '/assets/York_to_Manchester.gpx'; // The route file
    const mapbox_access_token = document.querySelector('script[type="x-mapbox-access-token"]').text;
    const search_radius = 2; // km

    const poi_data_provider = new localStorageCacheForDataProvider(
        'cyclestreets',
        new CycleStreetsDataProvider(cyclestreets_api_key),
        60 * 60 * 24 // Cache for 24hrs
    );

    // Create map,
    const routepoi = new RoutePOI(
        mapbox_access_token,
        true, // Marker cluster?
        JSON.parse(document.querySelector('script[type="x-routepoi-types"]').text),
        document.querySelectorAll('input[name="types[]"]'),
        poi_data_provider,
        true
    );

    routepoi.addRoute(gpx)
        .then(routepoi.search.bind(routepoi, search_radius));
})(L);