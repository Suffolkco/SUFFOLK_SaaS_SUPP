var labelService = function ($http) {
    var labelService = {};

    labelService.getLabelKey = function (key) {
        var url = GLOBAL_APPLICATION_ROOT + "api/labelkey/label?key=" + key;
        return $http.get(url)
            .then(function (response) {
                return { result: response.data };
            });
    };

    return labelService;
};

labelService.$inject = ['$http'];
agisAca.factory('LabelService', labelService);