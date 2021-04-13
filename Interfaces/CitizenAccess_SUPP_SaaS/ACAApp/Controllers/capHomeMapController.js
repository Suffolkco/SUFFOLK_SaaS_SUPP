var capHomeController = function ($scope, $rootScope, $timeout) {
    $scope.mapId = '';
    $scope.isAdmin = false;
    $scope.agency = '';

    $scope.mapUrl = '';
    $scope.isMapDisplayed = false;
    $scope.mapLoadingError = 'errorLoadingMap';
    
    var mapContainerId = 'mapContainer';

    $scope.init = function (agency, mapId, isAdmin) {
        $scope.agency = agency;
        $scope.mapId = mapId;
        $scope.isAdmin = isAdmin;
    };

    $scope.show = function () {
        if ($scope.isAdmin) return;

        $scope.recordIds = [];

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
        
        //collect selected records from the grid
        $('table[id*=gdvPermitList] tr')
            .filter(':has(:checkbox:checked)')
            .each(function () {
                $scope.recordIds.push($(this).find('#RecordId').val());
            });

        //broadcast show-map event
        $rootScope.$broadcast('show-map-event', {
            agency: $scope.agency,
            mapId: $scope.mapId,
            records: $scope.recordIds
        });
    };
    $scope.hide = function () {
        if ($scope.isAdmin) return;

        $('#' + $scope.mapId + '_' + mapContainerId).hide();
        $('#' + $scope.mapLoadingError).hide();

        $scope.isMapDisplayed = false;
    };
};

capHomeController.$inject = ['$scope', '$rootScope', '$timeout'];
agisAca.controller('CapHomeMapController', capHomeController);