var mapService = function ($http, $q, $timeout) {
    var mapService = {};

    mapService.getConfig = function (agency) {
        var url = GLOBAL_APPLICATION_ROOT + "api/gis/config";
        var config = { params: { "agency": agency } };

        return $http.get(url, config)
            .then(function (response) {
                return { config: response.data };
            });
    };

    mapService.getAddressData = function (capIds) {
        var url = GLOBAL_APPLICATION_ROOT + "api/gis/addresses";

        return $http.post(url, capIds)
            .then(function (response) {
                return { result: response.data };
            });
    };

    mapService.load = function (agency, containerId, isMiniMode, onLoaded, onLocationSelected) {
        return mapService.getConfig(agency)
            .then(function (data) {
                var configData = data.config;

                try {
                    var map = new AGISMap(containerId,
                    {
                        mapMode: isMiniMode ? 'miniMap' : '',
                        agencyCode: configData.AgencyCode,
                        aaServiceId: configData.AAServiceId,
                        product: configData.Product,
                        groupId: configData.GroupId,
                        userId: configData.UserId,
                        lang: configData.Locale
                    });

                    map.addEventListener('AGIS-Map-Loaded', onLoaded);
                    map.addEventListener('sendGISFeature', onLocationSelected);

                    return map;
                }
                catch (ex) {
                }
            });
    };

    mapService.locateParcels = function (map, parcelInfos) {
        var deferred = $q.defer();

        $timeout(function () {
            var data = { parcels: [] };

            if (typeof (parcelInfos) == "string") {
                parcelInfos = JSON.parse(parcelInfos);
            }

            if (map != null
                && map != undefined) {

                var layerId = "Parcels";
                
                if (parcelInfos && parcelInfos.length) {
                    for (var i = 0; i < parcelInfos.length; i++) {
                        var parcelId = parcelInfos[i].unmaskedParcelNumber;

                        var parcelInfo =
                            {
                                parcelId: parcelId,
                                gisobjects: [{
                                    id: layerId + "-" + parcelId,
                                    layerId: layerId,
                                    gisid: parcelId
                                }],
                                addresses: []
                            };

                        data.parcels.push(parcelInfo);
                    }
                }
                
                map.locate(data, function () {
                    deferred.resolve();
                });
            } else {
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    mapService.locateRecords = function (map, recordInfos) {
        var deferred = $q.defer();

        $timeout(function () {
            if (typeof (recordInfos) == "string") {
                recordInfos = JSON.parse(recordInfos);
            }

            if (map != null
                && map != undefined) {
                var data = { records: [] };

                if (recordInfos && recordInfos.length) {
                    for (var i = 0; i < recordInfos.length; i++) {
                        var _record =
                            {
                                recordId: recordInfos[i].recordId,
                                gisobjects: [],
                                parcels: [],
                                addresses: []
                            };

                        //define addresses
                        var addresses = recordInfos[i].addresses;

                        if (addresses && addresses.length) {
                            //fill addresses' array
                            for (var a = 0; a < addresses.length; a++) {
                                var item = addresses[a];

                                var _address =
                                    {
                                        attributes: {
                                            Address: item.Address ? item.Address : item.fullAddress,
                                            Neighborhood: item.Neighborhood ? item.Neighborhood : item.neighborhood,
                                            City: item.City ? item.City : item.city,
                                            StreetName: item.StreetName ? item.StreetName : item.streetName,
                                            Postal: item.Postal ? item.Postal : item.zip,
                                            StreetNumber: item.StreetNumber ? item.StreetNumber : item.houseNumberStart,
                                            CountryCode: item.CountryCode ? item.CountryCode : item.countryCode,
                                            StreetSuffix: item.StreetSuffix ? item.StreetSuffix : item.streetSuffix,
                                            Direction: item.Direction ? item.Direction : item.streetDirection
                                        }
                                    };

                                _record.addresses.push(_address);
                            }

                            data.records.push(_record);
                        }
                    }
                }
                
                map.locate(data, function () {
                    deferred.resolve();
                });                
            } else {
                deferred.reject();
            }
        });
        
        return deferred.promise;
    };

    mapService.clear = function (map) {
        var deferred = $q.defer();

        $timeout(function () {
            if (map != null
                && map != undefined) {
                var data = { records: [] };

                map.locate(data);
            }
        });

        return deferred.promise;
    };

    return mapService;
};

mapService.$inject = ['$http', '$q', '$timeout'];
agisAca.factory('MapService', mapService);