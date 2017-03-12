(function(L){
    const cyclestreets_api_key = document.querySelector('script[type="x-cyclestreets-api-key"]').text;
    const mapbox_access_token = document.querySelector('script[type="x-mapbox-access-token"]').text;
    const search_radius = 2; // km

    const poi_data_provider = new localStorageCacheForDataProvider(
        'cyclestreets',
        new CycleStreetsDataProvider(cyclestreets_api_key),
        60 * 60 * 24 // Cache for 24hrs
    );

    const results_table = document.querySelector('.poi-results-table');

    // Create map
    const routepoi = new RoutePOI(
        mapbox_access_token,
        true, // Marker cluster?
        JSON.parse(document.querySelector('script[type="x-routepoi-types"]').text),
        document.querySelectorAll('input[name="types[]"]'),
        poi_data_provider,
        results_table,
        true
    );

    const gpx_picker = document.querySelector('input[name="route"]');
    const file_reader = new FileReader();
    gpx_picker.addEventListener('change', e => {
        if (gpx_picker.files.length !== 1)
            return;

        routepoi.clearRoute();

        let file = gpx_picker.files[0];
        file_reader.readAsText(file);

        file_reader.onload = e => {
            routepoi.addRoute(e.target.result)
                .then(routepoi.search.bind(routepoi, search_radius))
                .then(routepoi.populateResultsTable.bind(routepoi)); // Add to poi table.
        };
    });
})(L);
