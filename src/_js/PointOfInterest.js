class PointOfInterest {
    constructor(name, latitude, longitude, type) {
        this.name = name;
        this.position = new L.LatLng(
            latitude,
            longitude
        );
        this.type = type;
    }
}