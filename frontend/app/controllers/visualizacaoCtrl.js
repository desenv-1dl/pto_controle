
(function () {
    'use strict';

    var visualizacaoCtrl = function ($scope, dataFactory, DTOptionsBuilder, $timeout,LeafletData) {

      //var map;

      $scope.center = {
                lat: -30.0277,
                lng: -51.2287,
                zoom: 8
            }

        $scope.ptos = {};
        $scope.reload = function () {
            dataFactory.get('pontoscontrole')
                .then(function success(response) {
                    $scope.ptos = response;
                    $scope.geojson = {
                        data: response
                    }

                }, function error(response) {
                    //FIXME
                });
        };

        $scope.reload();

    };

    visualizacaoCtrl.$inject = ['$scope', 'dataFactory', 'DTOptionsBuilder', '$timeout'];

    angular.module('ptoApp')
        .controller('visualizacaoCtrl', visualizacaoCtrl);


})();

/*app.controller("visualizacaoCrtl", [ '$scope', 'leafletData', function($scope,leafletData) {
   angular.extend($scope, {
         center: {
        lat: -30.0277,
        lng: -51.2287,
        zoom: 8
        }
    });
       
}]);*/
