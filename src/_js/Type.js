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
}