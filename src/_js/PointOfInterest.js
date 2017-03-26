class PointOfInterest {
    constructor(name, position, type) {
        this.name = name;
        this.position = position;
        this.type = type;

        this.marker = L.marker(this.position, {
            title: this.name
        });
    }
}