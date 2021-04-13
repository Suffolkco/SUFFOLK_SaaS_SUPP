var mapCommandService = function ($http, $q, $timeout) {
    var mapCommandService = {};

    mapCommandService.sendAddress = function (data, callback) {
        var deferred = $q.defer();

        $timeout(function () {
            $http({
                method: "POST",
                data: data,
                url: GLOBAL_APPLICATION_ROOT + "api/mapcommand/send-address"
            }).then(function (response) {
                deferred.resolve(response);
            }, function (errorResponse) {
                deferred.reject(errorResponse);
            });
        });
        
        return deferred.promise;
    };

    mapCommandService.sendParcel = function (data, callback) {
        var deferred = $q.defer();

        $timeout(function () {
            $http({
                method: "POST",
                data: data,
                url: GLOBAL_APPLICATION_ROOT + "api/mapcommand/send-parcel"
            }).then(function (response) {
                deferred.resolve(response);
            }, function (errorResponse) {
                deferred.reject(errorResponse);
            });
        });
        
        return deferred.promise;
    };

    return mapCommandService;
};

mapCommandService.$inject = ['$http', '$q', '$timeout'];
agisAca.factory('MapCommandService', mapCommandService);
