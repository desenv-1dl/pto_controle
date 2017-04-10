(function () {
    'use strict'
    var dataFactory = function ($http, $q) {
        var factory = {}

        var urlpath = 'http://10.25.163.164:3008/'

        factory.getRequest = function (url) {
            //  cria um promise
            var q = $q.defer()
            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                q.resolve(response.data)
            }, function errorCallback(response) {
                //  FIXME show message Layer not available
                q.reject('erro')
            })

            return q.promise
        }

        factory.get = function (classe) {
            var url = urlpath + classe;
            return factory.getRequest(url)
        };

        return factory
    }
    dataFactory.$inject = ['$http', '$q']

    angular.module('ptoApp')
        .factory('dataFactory', dataFactory)
})()