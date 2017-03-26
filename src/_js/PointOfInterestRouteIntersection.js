/**
 * The closest point on a route for the given POI.
 * A single POI can have many of these, if a route intersects its radius
 * multiple times
 */
class PointOfInterestRouteIntersection {
    constructor(poi, map, route, route_segment, start_distance, stop_distance) {
        this.poi = poi;
        this.map = map;
        this.route = route;
        this.route_segment = route_segment;

        // The distance into the overall route that we started & stopped seeing this POI
        this.start_distance = start_distance;
        this.stop_distance = stop_distance;

        this.closest_point = this.calculateClosestPoint();
        this.distance = this.calculateDistance();
        this.diversion = this.calculateDiversion();
    }

    getClosestPoint() {
        if (this.closest_point === undefined)
            this.closest_point = this.calculateClosestPoint();

        return this.closest_point;
    }

    calculateClosestPoint() {
        const closest_point_on_route_segment_ratio = L.GeometryUtil.locateOnLine(
            this.map, this.route_segment, this.poi.position
        );

        const interpolation_data = L.GeometryUtil.interpolateOnLine(
            this.map, this.route_segment, closest_point_on_route_segment_ratio
        );

        return interpolation_data.latLng;
    }

    getDistance() {
        if (this.distance === undefined)
            this.distance = this.calculateDistance();

        return this.distance;
    }

    calculateDistance() {
        const closest_point_on_route_segment_ratio = L.GeometryUtil.locateOnLine(
            this.map, this.route_segment, this.poi.position
        );

        let segment_length = this.stop_distance - this.start_distance;

        return this.start_distance + (segment_length * closest_point_on_route_segment_ratio);
    }

    /**
     * How far this POI is away from the route, i.e. how much of a diversion
     * we'll be taking. Except not accurate cause straight-line-distance.
     */
    calculateDiversion() {
        return L.GeometryUtil.length([this.getClosestPoint(), this.poi.position]);
    }

    getDiversion() {
        if (this.diversion === undefined)
            this.diversion = this.calculateDiversion();

        return this.diversion;
    }
}