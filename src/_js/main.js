// TODO: This is a hot-mess of quick functional prototyping. Give this code a
// good scrubbing before making it public!

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

(function(L){
    // const gpx = '/assets/Big_Bad_Bike_Ride_2016.gpx'; // The route file
    const gpx = '/assets/York_to_Manchester.gpx'; // The route file
    const mapbox_access_token = document.querySelector('script[type="x-mapbox-access-token"]').text;
    const cyclestreets_api_key = document.querySelector('script[type="x-cyclestreets-api-key"]').text;
    const markerClusterEnabled = true;
    const icons = {
        'cafes': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAADX0lE\nQVRYhcWWXWwUZRSGnzOzbbc/lJqisC60YgUbokhLAEESY9O0wUSiCdULvTBGriSEgDYmtlGCiQQu\nvKqNJdCLxhgv/KFY0yIBTbShkUJNjbCBSgP2j+5Cafd3dmY+L5SFbbulZXfd9+478868T745c76R\nujr0FUHnfmypFU25UKqAtEqComQETXUUbAh/5CgNOBsVfIAoUACS3nxYrES5UFTe7nGamkJq052Y\nSLrIixqwIlMACtwaCmemAARytEyF35FjemHr9ndYXrYu6QebpsHxlveIRoILA6jasY/CYlfSAFEj\nTPf3n+MbvcrSknICkz58I3/dH8CZX5h0OICyLV7d04y7rAKRfz/tS70nafvkdSIhf8wX1wMiQlZO\nbkoAsp35LH+iMhYOUL6+htf2tMT54gE0HZHU9aUZjfDriWbaDr7B5b7TAKzd+gqux56KeWa8glTJ\nsky+bd5LT9cxAIYGfuf9I/0APP3cy4wM/gFM24FUKhoJEglNxtbe4SuMXbsIwMo1m2P1OADbMjGj\nkdQQKEXQPxFX8o1eBWDRQ8tmBwAITt1KSb5oOlO3xqYx2f9duxs7A8A/cSMlALojG/89AJqmU/Lk\nRgBuXPckBrizTclKRAhM+mLrdc/XsajoEQA8vT8mBhj8szslfeAdvoJtWwAsXuJm+9uHAAj5J7jw\n81dzAFw8i2VGkwq3rSie86cAKC3fyK7DpykoehiA9iP1cZNwxhy45jkHSiUFYJpRLNNg54F2VldU\nx6bh2c6j/HaqLc6rb1mVVY+Qd7ekKCxexqOPr0XTH2xO6Y4sVq7ZwhJXGSKCaYQ5+cXHdLQ2xPkE\nCc6a8Ev7Zzxb+9YDhd+rwKSP/u7v+OnrT/EOD8zqmRXAOzxA9w8tbN62c0GHk1KKUGCCb5p2c3N0\nkL8H+rAtc857Eu5xR2sjpeWbcJdV4MjKnle4EfbT9G4VY9cvzRs64VlgmQYtDS/h6e3CCAdRtp3w\nIUbIz23vEE311QsKB5B923K9iCqey7S6sppNtW+y6pkXyM0vio3SSGiK8aHL9HS20nvmS4xwYGHh\nyPi8ANIlQcYz/lesoTF3m6ZRCkxNYCRTAAJDmo3qyhQA2GccKi+8XwI52SipUSJuQf0PfSHjmtjt\nZl7kw38Aurs/FFeQykMAAAAASUVORK5CYII=\n',
        'conveniencestores': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAD8ElE\nQVRYhcWV309bZRjHP+85LeX0QElL7aBNCXQwfkiEGG+ILnDhIDhdli2LmSZmJnrjhfHCxERjdJf+\nA7vwygvjItligluCJNNE5rY7nZBlBMbPDYhrobQM2tOe83pRV3ZsYYO12/fq5DnP876f87zf9zli\n6NSQyiJnFUUZQFIvEFWUUVLITSTLAnF5/Pr41w6xKL4UQnyB/C/h4UPZCKgB6iXy5c5XO7OKUMRA\neXfcRRZvKEC4FGtpL2ioLnVPNRIZUpBUlgKg91wvRy8dxVnl3EuZSynF5r4OH3pIB8BMmXuqLQlA\n0/EmAOYvzWNlrWcLoLpUwkdyNpodnt1z/VMDBA8HUV0qyYUkidnEsweInIgAMHNxZl/1TwWgBTT8\nXX6kKVkYXdjXGo7/B9RKFdX5ZPe56c0mEBD9OwoWVFRXPLbG2DB4dNiKCz0XokAtgLfNS9+3fSiO\nklyOoloeW+baZ9cAkMj7tg5IS6I4FFaurxD9MwpAw2ADiekE8al4Pq/1vVbmfp4jvZbG5XWRjqc5\n9M4hFkYWSMVS+bz2D9qZ+mGK7GYWgI4PO0DYgWwA69PrZDYyGAmDye8nAfB1+lj6Y4nF0cV8XuRk\nhNnhWZLzyXys8a1G5i7PsT69bgO9c/EOqVgKPaTT+VEn0ZtRG4Ct19KSxMZj+Lv8u/dxH/J359aM\n/mUHKDBhbDxGXU8dbWfacLgdeJo8hF8PU9Nck89xVjlpOd2CkTDysYqaCprfbia9ls7HVJdK25k2\nsltZvO1ezJRJfDJu26/AbbGbMQA8jZ59felO8jR6WL21WjCqCzqwemsVK2NhJA0mzk1Q3VDN3V/v\n2jwQPhJm6vyUzQOhvhDTP07bPBA5HuH2d7eRlqT13daio7qgA2baZG1yraQ+qH2pFsR2dx9VQQcg\nl9hyugU9pKNWqri8LvSgnn8vVIEW0LAy2+1UHApaQMtfOQChCNx1bgKvBHIGnygEsA2ihwoeDtLz\nTQ+JmQR6UCe7lSW7tb2w+4CbVCxlO08toJFeTdti7jo3W/9s4dAcbK5scuX9K7bNCwZRvgPjMZCw\n9PsSnoinwAODPw1y9ZOrNg8MDA1w4/MbNg8cGz3G2Mdj9J/vz43rIioKkI6nSS4mqX+tHitj4e/y\n49C2U1WnSrA3iLG+fQ2dupNQXwjfi758THEqNJ9qRqgi91FFVPQIALo/7ebgiYNFi/Yq0zAZOTli\nG9OQO4IdAYQqcB9wlwTASBhkNjIF8R09ACBNyYOlByUB2E3l++8+KYBEZh+fVh4JIbKKQCw/LwDg\nniKE+OW5bS/5zWFK86yCUiGE6AdC0pJl9YVEIoS4L5HDEvnVvzrChnJFU6ncAAAAAElFTkSuQmCC\n',
        'drinkingwater': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAADeUlE\nQVRYhb2XTWwbRRTHf7Nex05J6nrjeOsa2wkpqipSCEZUlBapIEFVSIUEqlpxAw4V5YCAC0oFJCAO\n3BCnIrU9UI6VQJBAKg69UER6AVUQgUDYgRav667r+vt7ODRxqZI4a2fDu+yu5r33/+3sezOz4vBh\nHKGie4qmOCAUGUDKPjbURFFIkUCRM30PlyfVSMH9toQTCAkSQKxbos/jo5jP0GzU6d/ip5A1aTYb\nS8MeKWQASfTmnLuuSsSBRWVbLDA0yvEPv8Xp6sXhcFIu5bj6x4+cnDi4zNchxNMKELJNHShkr5NO\nLpDPpBCKQu6GQWz++xV9JQQVJG47AbJpg49e20PGvALAuY+Pc/6z91f0FeBS7BRfsoeeeIHIjt0A\nHHnjFEKsLqOuV0wIwfYHHmdo5yP0e/1UKyVG9xxCLBazpkc48von5G4kWzGNeo3Zs1O34t882Hsd\nIQe6EfcMbOPFd85x9/YHO4qrlgtMPO9DIFJdz4DiUHl56nO2Dd/fcayUt7uua4Ad0Sdb4teu/Mbs\np5OkkwsARPcfZd+zrwJQLtzk9ORzNOrVVux/1oTuAUZ2Pda6nz49wfylr1vPifgvuO/aTHBkjK9O\nvcXCr3Or5um6Bu4Z3YfHF6RWKfH7TxeolHKdplhfDfz583fdht5hG7IOdGKWZiA4Msbe8WP0e3VU\np6utb6VUIJP6i9mz71EuZu0B8PiCRPcf5YfZM8vG5OJGVsplAAgM72LvoVeYPnPCSmprAGkjhtrj\n5uL0SSqlfFvfR8ePEbo3Sr1WsQRgqQbMRAwpJV7/2hunNhjCNGKWxC0D1Kol8pkUmj68pq9Xj5C2\nGwDANGJogaG1AfwR0sm4/QBpI4amtwdwqD1sHgiQNjYAwDRiaP5IW58tg0EUxWF/DQCkk3G0re1r\nwDsYBtggACNOn8eHq7d/dQA9Qq1SJJ+5Zj/A0ltpenh1AH8Y04jfsd/bBpA1/6FRr7b9DF5/qKMO\n6Aig2WyQSf3dthO8g+GO1oCOAOBWHWhbVwYQQuDVI5gdtCCAikLd6o+RmYxz3+5nGH/pg2VjiurE\n2eNuHcusmIS6KiAhQbcSMH/pGzQ9gh7eeTuJXLpKLl/8gkTssmUAAVfVJvK8gDFLAHMzzM/NWBZY\n25oXVLmpPCUKrh6keEoKERTI/+GUJFKKaH5Z31R591+no0DQ6KJGkgAAAABJRU5ErkJggg==\n',
        'pubs': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAADD0lE\nQVRYhcWXS28SURTHf3c6wFgQKtAHxaZFWzUx1cRHjHHhThNj4kaXfgE/gDFRo/UjuNOFG7euTFxo\nYlybNBproo01LfVBKS1QdEqh87guEGptB5jBxv+Sex6/e8499w7iyhW6hsraBLY4LxSZQMoQOypR\nFlIsoMhnoZOVu+rwqnZbwk2EBAkgdjY/RKSQCSTHSq81U5GI8zud0UldQlxQgSEnA78WJBwdQOsO\nA6AFIwih4AvswucLbLKtrulYlolpVDCqa0gp0UtL6CtLWOb6tvElJFUk2t9VD4ZjXH/wjmA41tkW\nf+vD62c8und5y+8CAsp2DuWfBQJa8J8kBzCMquPatgBSSoq5L/8MoJBNO66pTgv5xTTx5BiZuSmS\n+462TFLMzZOd/0ghO8dKPgO2zcET5xg9cpZibt49QCGbRgjBk/vXSKTGGT99ib0HjuPzaViWwXLm\nM5nZ93ydmeTbzBv00vKWGMOHTtU2szDnBaDmFB8cY3ryBdOTLxyDOCmaSNUAss4A256BP53ig/td\nJ64rnkhh21bTFjgCFBbTvwH2eUoe6unFr4X4kc9gmYZ7gHy2DuCtArGB1uVvClBZLVH+WSQ2ONoR\nQLMRbAoAtTaEwnG0YMQ1QLQOsNgBQOMgJty3IdppC2CjfL1J9wCxgZFNMbwB1Cch4e4cKEoXe/qG\ngQ4rUHeOuRzFSDyJ6vNjVMvoKznvABu3obsKRPtHgNooSym9AxRzX7Bti57evag+f9sAsUR7E9AS\nwDINfuQzKEoX0f5U2wDRxgFs3v+WAODtTdi4BdOdAxQ8XMmNW3DR+RFqH6DxKLUHoPoDROLJmu//\naEG0bxghlE2+zeT4QVJXvYzx5BhXbzzGMKqY6xXW13Rs29piv3tPPwB6aZn1ymrnAPmF2Zqh6id1\n+EzLgA3wNnZfA1AwaXJX6Cs5Ht66SE/vUFv/E2zLQC8tk5mdamkrwVQFLEjodzSSkk9vX7YM5kUC\nvis28vmORG9L9itVdlcmxGrAjxTnpBBJgWw5GZ1LLCnCfmp2V+/8AnCkPvMYkPPvAAAAAElFTkSu\nQmCC\n',
        'restaurants': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAD+klE\nQVRYhcWXf2hWVRjHP+e+d/fe9927GUaj8TonDMcSKbE5CRoVwcaUWIwUxD8c9EexRgX1Vxr+CJJI\njIqQCAykEGxEmBUxa4WJySStCUNpKktaw2VOt7n5nh/9sXf3/XXvu7tw9Px1z+E553zO93nOc84V\nmzYRq5nydqNFq7BMNcYkWVQTU8KIESzzVXLd9C67dtJ73cB2hAEDIBZ3fVhihKnGsHb8tCctg2hd\n7BXDLCbEBguoCXMQQtDc3s0rH/TT0fUuXqIydLIN2/ZQvWI1TS3beLzjZWobmtj80gEAOnccwYrZ\nRWMMpGwMXpjq7c/t49GnugCoXrGaZSvX8uFrbczcnijyrXvwMYYGTnBfaiWOV861P4dI1a0BYFVT\nG16igqlb/+RvEFwrbEeNT271F5+z5fWNdLzwXqC/G0+itSRmOxit0EoSs8sA0ErixisCxwUCVC69\nn6ef3x844OEntrBq/caifi9RgVYSu8xBa43RCrvMBUApiRsPPlyBAM3t3SXj3bp1R1GfG69AyTQx\n20EriVKzagBorXC88mgAVsymqaUzdHGAVN0altc3FgAkM7I7aK3yFZDp6CGobVhPeeW9JQGAvDDY\njocVs1FKYpe5aCXRWmUVUBI3HlGBucydz1J1D/nfXia+WqtMDig/H3wAL2IORNk9QHJJlf89J+9c\nCIxW+QpoiZuIGIKpW9cjAUzeHPO/nTkFMrtWSvrHUAgLrWT0JBwfuxoJ4EaOn5sDkKsAQCwDFPkY\nXjr/E0qm5wX4/dcfsgCZ+FbVNBBP3kPl0mqqltUDs8UrFivDcYMVKCrQE+NjXDx7nAfWtYUuPj05\nzvmfj/ltmZ4B4NldnwOzZbu5vRuArrd6AUinpwPnCixEvYf3opUMBfj+s33IO9kJb0/cCPX1fUJy\nKxBg+EI/3xzaGTjg4i/H6evJL9OjfwzOC3Fl8HR0AIC+nv18+nann0wAp77+iIN7nsEYneerZJoz\n330SuvjI5QGGL/QvDADg3I9HECJ7Vw+cOurHu9COHdzObye/KOofHR7k4zc2F0FHArCdOEJkXRw3\nEeqr5B0OvbmFk18e8PtGLg/wzouPcH30Sui4kgCulyhoBx+lXMt9rCglQxWLBFBYvcKqWa7lFpyw\n4rMAgPwJnJAbLQ8g5x1R6k0RESA/BGHVLNe8nEvHC7mAFgDwX0KQXdR24oGv4cgAhXd4oSJBliu7\nEGLexF1QCKIklZtIFrRL54GNhZz9JSu2q0Pn6Hm/22///deleQF6D+/NU25m6maorwEpXt0YP2uM\nifYOu8smEGcsjfn2/1h81nSfbRLTu8Wk62BEixEiJTAl8+LumLhmCX1UJmZ2/gsJTGbRPGMhIAAA\nAABJRU5ErkJggg==\n',
        'supermarkets': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAE5ElE\nQVRYhcWX7W9TVRzHP+f2cb3tHto9dh3bpOvIhoywOcQZX5gIhMxoomBEoy+MvCbxFSEGSIzRhMQQ\n3/kXKCzGECBBE42Jycx0Y2wCxrHRPeHWh20dfVjb23t8MWkp7VYNDH5ves73fO/9fXJ+p797rzh/\n+LyBWc4oinIASYNA2NnCkELGkfwtEJfHB8dPG8Ws+FgIcRL5r+H+YMsIqAAaJHLPzr6dmiIUcWBr\nM24SOocUoOlp5ZfIRgWJ9UkmLX+mnN7Tvbh2uQAsxieV2FJlofNYJy2vtpBZy3D7wm0AnhjA3k/2\nUt1Vjf+Snxtf3SC5lHxyAMYyI9W7qpn6borRs6P5a/cH9S/U4z3iRQgBgGJSEIogk8xkzQarAV3T\nkZrM06Qm0TU9L2EmmUHq6z5zhRlhEITHw4VwWYB99dT11hGZjKCndaxOK4pJIb4Yz5pVt4oW00hG\nkjmtQUVLaCRXcprdYycVSZG6l1qfN633tuh0dGOA0GiI7W9sZ/zLcRaHFvEd9WFz2/K2rPd0L8GR\nIHcu3slqPSd7WL61zOS3k1mt72wf01emmftxDoD+K/0YzAaW/1wuAFDuD4IjQZBQ011TYHqUUEwK\nlgoLiWCi6Hp2B5LLSSJTEWp7alHdKuZyMybVhOpWc+YyI+YKc75mK9QMFgOWKguqW6W2pxYELN1c\nKgogBvYNhAAXQNfxLryHvcQX4hhVI8IgSEVSWbOlykImmUGLazmt0oKe1knH0lnN6rSiJTS0hIbZ\nYcbkMDF0aojZH2bzkktkMO9vGBwO4j3iZfSLURzbHI/lDBwcOIjJYWL+5/miO6A8OAleCyJ1Sc2e\nx3QOBNjqbKRWU+gpvaglDyAdTbPy18pjO4iV7ZUIg2B1anVDT0EnDA4H8R31Ya2yIowCZ4czu6a6\nVVy7XLS+3prTGlRqempo7m/OanaPHUeLA2FYb2qLvy7+D4CRIL53fESmImRSGSYv5Gq7470drEys\nsDC4kNV8R31EZ6Lc/eVuVus81klgKIDnFQ8AM1dn/jtA6HoImZFU7agiOhelaX8TsfkYsbkYuqYT\nX4wT+C2Q9W/bv4170/fytLa32ohMRmh7uw09ped105IAWlxj5LMR6vvqURtVPC97MJblbHV76+j4\noIPoXJTY3Ri2Oht6Wqemu4bYfIxEYL3hmB1mDFYDq3c2rn9RAAD/ZT/+y/7s3OqyYvfYUT0q9sbc\nb+1ztZgdZpydzuy50NM66Wga1bPemJZuFG9AmwI8HGvhNdbCa4SuhwrWzBXmPCjVo2L32ClvLX90\nAFu9DUulpSSg1CXRmSjRmdzTztnpZPdHuzet/6YAXce78B7xlkxeKvRk8Qa0KUDd83W0vtbKxDcT\nlLeU43rWxcjnI8jM5t8M7e+3YywzsvTHEu6X3Mx+P0torLBsJQEq2ypZurnE2LkxLJUW+q/0s3xr\nmehc4QvFg9F9spvBE4MEhgJ0He/C6rKWhC4KEB4L0/FhB+3vtlPRVkEikCC+sHktAVanVvG+6cVk\nM9HwYgP+S/6S1ygSqT0shq6HGDs3RvOhZspqyxg8MZj3zrdRDH86jNVlpfdML+HxMBNfT2zqF0Jo\nYmDfwDVgd8m7b0UIfleEEFefSnIAyU/GjMycUVDMQoj9QKPUpVLywkfKKRFCBCXyokSe+gf8s+rE\n84qroAAAAABJRU5ErkJggg==\n',
    };
    const search_radius = 1; // How far around the route to search, in km.
    const search_boxes_visualisation = {}; // Visualisations of the search boxes

    // TODO: Look at Leaflet.FeatureGroup.SubGroup for toggling markers by type.
    const pointsOfInterestLayer = markerClusterEnabled ? L.markerClusterGroup() : new L.LayerGroup();;

    // var places_api; // Google Places API
    let search_boxes; // Bounding boxes to search in for POI along the route
    const attribution = ['Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                   'Imagery © <a href="https://mapbox.com">Mapbox</a>',
                   'POI data via <a href="https://www.cyclestreets.net">CycleStreets</a>'].join(', ');

    for(let type in icons) {
        icons[type] =new L.icon({
            iconUrl: icons[type],
            iconSize: [16, 16]
        });
    }

    const poi_data_provider = new localStorageCacheForDataProvider(
        'cyclestreets',
        new CycleStreetsDataProvider(cyclestreets_api_key),
        60 * 60 * 24 // Cache for 24hrs
    );

    // Create map
    const map = new L.map('route-map', {
        renderer: L.svg()
    });
    map.setView([51.505, -0.09], 13);

    // Add tiles
    const tileset = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: attribution,
        maxZoom: 18,
        style: 'outdoors-v10',
        accessToken: mapbox_access_token
    });

    tileset.addTo(map);

    const gpx_route = new L.GPX(gpx, {
        async: true,
        marker_options: {
            startIconUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-icon-start.png',
            endIconUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-icon-end.png',
            shadowUrl: '/assets/vendor/leaflet-gpx-1.2.0/pin-shadow.png'
        }
    });

    map.addLayer(pointsOfInterestLayer);

    gpx_route
        .on('loaded', function(e) {
          map.fitBounds(e.target.getBounds());
        })
        .addTo(map);

    // Generate the bounding boxes search areas, plot them, find places within them.
    gpx_route.on('loaded', function(e){

        // TODO: Must be a better way of extracting the Polyline?
        findLayerType(gpx_route, L.Polyline, function(layer){
            search_boxes = L.RouteBoxer.box(layer.getLatLngs(), search_radius);
            search_boxes.forEach(drawBoundingBox);

            // We don't want to hammer our data provider with lots of
            // queries, so load sequentially.
            let i = 0;
            const boundingBoxLooper = function boundingBoxLooper(results) {

                if (results !== undefined) {

                    renderPointsOfInterest(results);
                }

                if (i > search_boxes.length - 1) {
                    return;
                }

                findPlacesInBoundingBox(search_boxes[i], boundingBoxLooper);
                i++;
            };
            boundingBoxLooper();
        });
    });

    // -------------------------------------------------------------------------

    function drawBoundingBox(box) {
        let rectangle = new L.Rectangle(box);
        search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)] = rectangle;
        rectangle.addTo(map);

        // Log bounds on click, for maximum debugs
        rectangle.on('click', (e) => {
            console.log('SWNE', L.LatLngBoundsToSWNEBbox(e.target.getBounds()));
            console.log('WSEN', L.LatLngBoundsToWSENBbox(e.target.getBounds()));
        });
    }

    // -------------------------------------------------------------------------

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            const error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    // -------------------------------------------------------------------------

    function findPlacesInBoundingBox(box, callback) {
        let type = [
            'cafes',
            'conveniencestores',
            'drinkingwater',
            'pubs',
            'restaurants',
            'supermarkets',
        ];

        poi_data_provider
            .fetch(
                box,
                type
            )
            .then((data) => {
                search_boxes_visualisation[L.LatLngBoundsToSWNEBbox(box)].setStyle({
                    color: '#0c3',
                    fillOpacity: 0,
                    weight: 1,
                });

                return data;
            })
            .then(callback)
            .catch((error) => {
                console.log('request failed', error);
            });
    }

    // -------------------------------------------------------------------------

    function renderPointsOfInterest(pois) {
        pois.forEach(function(poi) {
            let marker = L.marker(poi.position, {
                title: poi.name
            });

            if (icons[poi.type] !== undefined) {
                marker.setIcon(icons[poi.type]);
            }

            marker.addTo(pointsOfInterestLayer);
        });
    }

    // -------------------------------------------------------------------------

    // Recursively look through the layer and its children until a layer of the
    // given type is found
    function findLayerType(root_layer, desiredClass, callback) {
        if (root_layer instanceof desiredClass) {
            callback(root_layer);
            return;
        }

        if (root_layer.getLayers === undefined) {
            return;
        }

        const layers = root_layer.getLayers();
        for (let i = layers.length - 1; i >= 0; i--) {
            findLayerType(layers[i], desiredClass, callback);
        }
    }

})(L);