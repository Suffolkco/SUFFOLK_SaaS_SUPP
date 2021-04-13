var showMapEvent_watcher;

var mapDirective = function ($rootScope, $timeout, LabelService) {
    var init = function (scope, element, attributes) {
        scope.mapId = attributes['mapId'];
        scope.mapUrl = attributes['mapUrl'];
        scope.moduleName = attributes['moduleName'];
        scope.isMiniMode = attributes['isMiniMode'] == 'true' ? true : false;
        scope.loadingMessage = 'Please wait...';

        $timeout(function () {
            LabelService.getLabelKey('capdetail_message_loading')
                .then(function (response) {
                    scope.loadingMessage = response.result;
            });            
        });
        
        scope.recordIds = JSON.parse(attributes['recordIds']) || [];
        scope.agency = attributes['agencyId'] || '';

        scope.mapLoadingError = 'errorLoadingMap';
        scope.mapContainerId = scope.mapId + '_mapContainer';
        scope.mapContainerWrapperId = scope.mapId + '_mapContainerWrapper';

        if (typeof showMapEvent_watcher == 'function') {
            //unregister watcher for the  event
            showMapEvent_watcher();
        }

        //start watching for the event
        showMapEvent_watcher = scope.$on('show-map-event', function (event, data) {
            if (data != null
                && (data.mapId != null && data.mapId === scope.mapId)
                && (data.agency != null)) {
                onShowMap(scope, data);
            }
        });

        if (scope.recordIds.length) {
            scope.$on('map-loaded-event', function (event, data) {
                scope.locateAPO(scope.recordIds, [], [], function () {
                    scope.isMapDisplayed = true;
                }, function () {
                    scope.hide();
                });
            });

            $timeout(function () {
                scope.show(scope.agency);
            });
        }
    };

    var onShowMap = function (scope, data) {
        scope.recordIds = [];
        scope.addressInfo = [];
        scope.parcelInfo = [];

        scope.data = data;

        if (scope.isMapLoaded) {
            doLocate(scope, data);
        }
        else {
            scope.$watch('isMapLoaded', function () {
                if (scope.isMapLoaded) {
                    doLocate(scope, data);
                }
            });
        }

        $timeout(function () {
            scope.show(data.agency);
        });
    };

    var doLocate = function (scope, data) {
        if (data.records && data.records.length) {
            scope.recordIds = data.records;
        }

        if (data.addressInfo && data.addressInfo.length) {
            scope.addressInfo = data.addressInfo;
        }

        if (data.parcelInfo && data.parcelInfo.length) {
            scope.parcelInfo = data.parcelInfo;
        }

        scope.locateAPO(scope.recordIds, scope.addressInfo, scope.parcelInfo, function () {
            scope.isMapDisplayed = true;
        }, function () {
            scope.hide();
        });
    };

    var onHideMap = function (scope, data) {
        scope.text = data;
    };

    return {
        restrict: 'E',
        templateUrl: GLOBAL_APPLICATION_ROOT + 'acaapp/map.html',
        link: init,
        scope: true,
        controller: ['$scope', '$rootScope', 'MapService', 'LabelService', function ($scope, $rootScope, MapService, LabelService) {
            $scope.isMapLoaded = false;
            $scope.isMapDisplayed = false;
            $scope.recordIds = [];
            $scope.label = '';
            $scope.agency = '';

            $scope.mapInstance = null;

            $scope.onSelectLocation = function (event) {
                var message = {
                    eventType: event.eventType,
                    command: event.eventData.command,
                    isUseLocation: event.eventData.isUseLocation,
                    serviceId: event.eventData.mapServiceId,
                    moduleName: $scope.moduleName,
                    data: event.eventData.addressInfo
                };

                $rootScope.$broadcast('location-selected-event', message);
            };

            $scope.onLoaded = function (data) {
                //to prevent all hyperlinks inside the map trigger postback
                $('a', $('map')).each(function () {
                    $(this).addClass('NotShowLoading');
                });

                $rootScope.$broadcast('map-loaded-event', $scope.mapId);
            };

            $scope.show = function (agency) {
                if (!agency)
                    return;

                $('#' + $scope.mapContainerId).show();

                if (!$scope.isMapLoaded || $scope.agency != agency) {
                    var mapContainerId = $scope.mapContainerId;

                    if ($('#' + mapContainerId).length) {
                        $scope.agency = agency;

                        MapService.load(agency, mapContainerId, $scope.isMiniMode, $scope.onLoaded, $scope.onSelectLocation)
                            .then(function (map) {
                                if (map) {
                                    $scope.mapInstance = map;
                                    $scope.isMapLoaded = true;

                                    $rootScope.$broadcast('map-loading-success-event', { mapId: $scope.mapId });
                                }
                                else {
                                    $scope.isMapLoaded = false;
                                    $('#' + $scope.mapContainerId).hide();

                                    $rootScope.$broadcast('map-loading-falied-event', { mapId: $scope.mapId });
                                    
                                    LabelService.getLabelKey("aca_gis_msg_noconnection_error")
                                        .then(function (response) {

                                            $('#' + $scope.mapLoadingError).show();
                                            $scope.label = response.result;
                                            $('#' + $scope.mapLoadingError).html($scope.label);

                                        },
                                        function (httpError) {
                                            $scope.label = "Could not connect to the GIS Server";
                                            $('#' + $scope.mapLoadingError).show();

                                        });
                                }
                            }, function () {
                                $rootScope.$broadcast('map-loading-falied-event', { mapId: $scope.mapId });
                            });
                    }
                }
            };

            $scope.hide = function () {
                $('#' + $scope.mapContainerId).hide();
                $scope.isMapDisplayed = false;
            };

            //locate addresses on the map
            $scope.locateAPO = function (capIds, addressInfo, parcelInfo, successCallback, errorCallback) {

                if(!MapService)
                    return;

                if (capIds && capIds.length) {
                    MapService.getAddressData(capIds)
                        .then(function (response) {
                            var locateInfo = JSON.stringify(response.result);

                            MapService.locateRecords($scope.mapInstance, locateInfo)
                                .then(function () {
                                    $scope.isMapDisplayed = true;

                                    successCallback();
                                })
                                .catch(function (error) {
                                    $scope.isMapDisplayed = false;

                                    errorCallback(error);
                                });
                        })
                        .catch(function (error) {
                            $scope.isMapDisplayed = false;

                            errorCallback(error.data);
                        });
                }
                else if (parcelInfo && parcelInfo.length) {
                    MapService.locateParcels($scope.mapInstance, parcelInfo)
                        .then(function () {
                            $scope.isMapDisplayed = true;

                            successCallback();
                        })
                        .catch(function (error) {
                            errorCallback(error);
                        });
                }
                else if (addressInfo && addressInfo.length) {
                    MapService.locateRecords($scope.mapInstance, addressInfo)
                        .then(function () {
                            $scope.isMapDisplayed = true;

                            successCallback();
                        })
                        .catch(function () {
                            errorCallback();
                        });
                }
                else {
                    MapService.clear($scope.mapInstance)
                        .then(function () {
                            $scope.isMapDisplayed = true;

                            successCallback();
                        })
                        .catch(function () {
                            errorCallback();
                        });
                }
            };
        }]
    };
};

mapDirective.$inject = ['$rootScope', '$timeout', 'LabelService'];
agisAca.directive('map', mapDirective);