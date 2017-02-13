var OverpassDataProvider = {
    options: {
        endPoint: 'https://overpass-api.de/api/'
    },
    initialize: function(){},

    _buildOverpassUrlFromEndPointAndQuery: function (endPoint, query){

        return endPoint + 'interpreter?data=[out:json];'+ query;
    },

    // TODO: Swap callbacks with promises
    fetch: function(query, onSuccessCallback, onFailureCallback) {

        // TODO: Separate this out into the DataProvider class
        var self = this;
            url = this._buildOverpassUrlFromEndPointAndQuery(
                this.options.endPoint,
                query
            ),
            request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.timeout = this.options.timeout;

        request.onload = function () {

            self._onRequestLoad(this, onSuccessCallback, onFailureCallback);
        };

        request.send();
    },

    _onRequestLoad: function (xhr, onSuccessCallback, onFailureCallback) {

        // Request failed!
        if (xhr.status < 200 && xhr.status >= 400) {
            onFailureCallback.call(this, xhr);
            return;
        }

        // Request did the opposite of failing!
        onSuccessCallback.call(this, JSON.parse(xhr.response));
    },

};
