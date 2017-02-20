class PointOfInterest {
    constructor(name, latitude, longitude) {
        this.name = name;
        this.position = new L.LatLng(
            latitude,
            longitude
        );
    }
}