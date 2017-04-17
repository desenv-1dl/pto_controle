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

        factory.getUsuarioId = function (id) {
            var url = urlpath + 'usuarios?id=' + id;
            return factory.getRequest(url)
        };


        factory.updateRequest = function (url, data) {
            var q = $q.defer()

            $http({
                method: 'PUT',
                url: url,
                data: data,
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function successCallback(response) {
                q.resolve('success')

            }, function errorCallback(response) {
                //FIXME show message Layer not available
                q.reject('erro')
            });

            return q.promise
        }

        factory.update = function (classe, data) {
            var url = urlpath + classe + '/' + data.id
            return factory.updateRequest(url, data)
        }

        factory.updateUsuarioSenha = function (data) {
            var url = urlpath + 'usuarios/' + data.id + '/senha'
            return factory.updateRequest(url, data)
        }

        return factory
    }
    dataFactory.$inject = ['$http', '$q']

    angular.module('ptoApp')
        .factory('dataFactory', dataFactory)
})()