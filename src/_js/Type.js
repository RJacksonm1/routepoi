class Type {
    constructor(type_definition, map, feature_layer) {
        this.name = type_definition.name;
        this.icon = new L.Icon({
            iconUrl: 'data:image/png;base64,' + type_definition.icon,
            iconSize: [16, 16]
        });

        this.map = map;
        this.layer = new L.FeatureGroup.SubGroup(feature_layer);
    }

    addCheckbox(checkbox) {
        this.checkbox = checkbox;
    }

    updateCounts() {
        this.checkbox
            .parentElement
            .querySelector('.poi-types__type__count')
            .textContent = this.layer.getLayers().length;
    }

    show() {
        this.map.addLayer(this.layer);
    }

    hide() {
        this.map.removeLayer(this.layer);
    }

    clearPois() {
        // `FeatureLayer.SubGroup` doesn't handle `clearLayers` properly. When
        // we add/remove a `FeatureLayer.SubGroup` its proxying the additions
        // directly to the marker cluster group, so we need to remove from the
        // marker cluster group manually before clearing layers.

        let markerClusterLayer = this.layer.getParentGroup();
        this.layer.eachLayer(layer => {
            markerClusterLayer.removeLayer(layer);
        });
        this.layer.clearLayers();
    }
}