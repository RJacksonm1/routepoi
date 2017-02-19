class localStorageCacheForDataProvider {
    constructor(cache_key, data_provider, cache_time) {
        this.cache_key = cache_key;
        this.cache_time = cache_time || 60 * 60; // seconds. 1hr default.
        this.data_provider = data_provider;
        this.endpoint = 'https://overpass-api.de/api/';
    }

    fetch(query) {
        return new Promise((resolve, reject) => {
            let item_key = this.cache_key + '_' + query;
            let cached_item = localStorage.getItem(item_key);

            if (cached_item !== null) {
                cached_item = JSON.parse(cached_item);
            }

            if (cached_item !== null && Date.now() < cached_item.expiry) {
                return resolve(cached_item.data);
            }

            let xhr = this.data_provider.fetch(query);
            let self = this;

            xhr
                .then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        return response;
                    } else {
                        reject(error);
                    }
                })
                .then((response) => {
                    return response.json();
                })
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
