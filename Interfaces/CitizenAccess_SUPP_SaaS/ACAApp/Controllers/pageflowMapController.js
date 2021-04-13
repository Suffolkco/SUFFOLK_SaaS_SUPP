var pageflowController = function ($scope, $rootScope, $timeout, $compile, MapCommandService) {
    $scope.isMapDisplayed = false;
    $scope.isAdmin = false;

    var mapContainerId = 'mapContainer';

    $scope.init = function (mapId, isAdmin) {
        $scope.mapId = mapId;
        $scope.isAdmin = isAdmin;
    };    $scope.locateAPO = function (addresses, parcels) {
        if ($scope.isAdmin) return;

        if (!$scope.isMapDisplayed)
            return;

        if (addresses) {
            addresses = JSON.parse(addresses);
        }        else            addresses = '';        if (parcels) {
            parcels = JSON.parse(parcels);
        }        else            parcels = '';        //broadcast show-map event        $rootScope.$broadcast('show-map-event', {
            mapId: $scope.mapId,            addressInfo: [{
                addresses: addresses
            }],
            parcelInfo: parcels            
        });
    };

    $scope.show = function (agency) {
        if ($scope.isAdmin) return;

        $scope.isMapDisplayed = true;

        $rootScope.$on('map-loading-success-event', function (event, data) {
            if (data && data.mapId == $scope.mapId) {
                $scope.isMapDisplayed = true;
            }
        });

        $rootScope.$on('map-loading-falied-event', function (event, data) {
            if (data && data.mapId == $scope.mapId) {
                $scope.isMapDisplayed = false;
            }
        });

        //broadcast show-map event
        $rootScope.$broadcast('show-map-event', {
            agency: agency,
            mapId: $scope.mapId
        });
    };

    $scope.hide = function () {
        if ($scope.isAdmin) return;

        $('#' + $scope.mapId + '_' + mapContainerId).hide();
        $('#' + $scope.mapLoadingError).hide();

        $scope.isMapDisplayed = false;
    };

    $scope.$on('location-selected-event', function (event, message) {
        if (message && message.data) {
            var gisAddress = message.data;            
            var parcelId = '';

            if (gisAddress.parcelId && gisAddress.parcelId.length && (typeof(FillParcelFromGIS) == 'function')) {
                parcelId = gisAddress.parcelId[0];

                //map GIS parcel model to ACAGISModel
                var parcelModel = {
                    agency: message.serviceId,
                    moduleName: message.moduleName,
                    context: 'ParcelDetailSpear',
                    parcelModels: [{
                        parcelNumber: parcelId
                    }]
                };

                MapCommandService.sendParcel(parcelModel)
                    .then(function (response) {
                        var parcelInfo = response.data.Model.ParcelModels[0];

                        setTimeout(function () {
                            FillParcelFromGIS(parcelInfo || {});
                        });
                    }, function (error) {
                        setTimeout(function () {
                            FillParcelFromGIS({});
                        });
                    });
            }
            else if (hasAddressInfo(gisAddress) && (typeof(FillGISAddress) == 'function')) {
                //map GIS address model to ACAGISModel
                var addressModel = {
                    agency: message.serviceId,
                    moduleName: message.moduleName,
                    context: 'AddressDetailSpear',
                    refAddressModels: [{
                        fullAddress: gisAddress.address,
                        city: gisAddress.city,
                        state: gisAddress.state || gisAddress.region,
                        zip: gisAddress.postalCode,
                        countryCode: gisAddress.country,
                        houseNumberStart: gisAddress.streetStart,
                        streetName: gisAddress.streetName,
                        streetSuffix: gisAddress.streetSuffix
                    }]
                };

                //if ref address info did not get populated, set it to null to avoid sending empty object
                if (addressModel && addressModel.refAddressModels) {
                    var hasNoRefAddressData = JSON.stringify(addressModel.refAddressModels[0]) === '{}';

                    if (hasNoRefAddressData)
                        addressModel.refAddressModels = null;
                }

                MapCommandService.sendAddress(addressModel)
                    .then(function (response) {
                        var refAddress = response.data.Model.RefAddressModels[0];

                        setTimeout(function () {
                            FillGISAddress(refAddress || {});
                        });
                    }, function (error) {
                        setTimeout(function () {
                            FillGISAddress({});
                        });
                    });
            }
        }
    });

    //returns true if gis model has any [address] property with the value
    var hasAddressInfo = function (gisInfo) {
        //check if any of the property has value (except parcelId)
        return Object.keys(gisInfo).some(function (key) {
            if (key == 'parcelId')
                return false;

            if (gisInfo[key] && gisInfo[key].length)
                return true;
            else
                return false;
        });
    };

    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function (sender, args) {
        var elem = angular.element(document.getElementById("mapButtonsSection"));

        elem.replaceWith($compile(elem)($scope));

        $scope.$apply();
    });
};

pageflowController.$inject = ['$scope', '$rootScope', '$timeout', '$compile', 'MapCommandService'];
agisAca.controller('PageflowMapController', pageflowController);