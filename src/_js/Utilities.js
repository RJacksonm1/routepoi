L.LatLngBoundsToSWNEBbox = function(latLngBounds) {
    return [
        latLngBounds._southWest.lat,
        latLngBounds._southWest.lng,
        latLngBounds._northEast.lat,
        latLngBounds._northEast.lng
    ].join(',');
};

L.LatLngBoundsToWSENBbox = function(latLngBounds) {
    return [
        latLngBounds._southWest.lng,
        latLngBounds._southWest.lat,
        latLngBounds._northEast.lng,
        latLngBounds._northEast.lat
    ].join(',');
};