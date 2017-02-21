class localStorageCacheForDataProvider {
    constructor(cache_key, data_provider, cache_time) {
        this.cache_key = cache_key;
        this.cache_time = cache_time || 60 * 60; // seconds. 1hr default.
        this.data_provider = data_provider;
    }

    fetch(latLngBounds, types) {

        if (types instanceof Array) {
            return Promise.all(types.map(this.fetchSingle.bind(this, latLngBounds)))
            .then(data => {
                return [].concat.apply([], data);
            });
        }

        return this.fetchSingle(latLngBounds, types);
    }

    fetchSingle(latLngBounds, type) {
        return new Promise((resolve, reject) => {
            let item_key = this.cache_key + '_' + L.LatLngBoundsToSWNEBbox(latLngBounds) + '_' + type;
            let cached_item = localStorage.getItem(item_key);

            if (cached_item !== null) {
                cached_item = JSON.parse(cached_item);
            }

            if (cached_item !== null && Date.now() < cached_item.expiry) {
                return resolve(cached_item.data);
            }

            let xhr = this.data_provider.fetch(latLngBounds, type);
            let self = this;

            xhr
                .then((response) => {
                    localStorage.setItem(
                        item_key,
                        JSON.stringify({
                            data: response,
                            expiry: Date.now() + (parseInt(self.cache_time) * 1000)
                        })
                    );

                    return JSON.parse(localStorage.getItem(item_key)).data;
                })
                .then(resolve);
        });
    }
}
