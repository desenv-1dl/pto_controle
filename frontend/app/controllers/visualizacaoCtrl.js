
(function () {
    'use strict';

    var visualizacaoCtrl = function ($scope, dataFactory, DTOptionsBuilder, $timeout,LeafletData) {

      //var map;

      $scope.center = {
                lat: -30.0277,
                lng: -51.2287,
                zoom: 8
            }
        
        $scope.markers = {}

        $scope.layers = {
            baselayers: {
                        openStreetMap: {
                            name: 'OpenStreetMap',
                            type: 'xyz',
                            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        },
                        /*googleHybrid: {
                                    name: 'Google Hybrid',
                                    layerType: 'HYBRID',
                                    type: 'google'
                        }*/
            },
            overlays: {
                pto: {
                    type: 'group',
                    name: 'Pontos de Controle',
                    visible: true
                }
            }
        }

        $scope.reload = function () {
            dataFactory.get('pontoscontrole')
                .then(function success(response) {
                    
                    $scope.markers = {}

                    response.features.forEach(function(d,i){
                        $scope.markers[i] = {
                                layer: 'pto',                           
                                lat: d.geometry.coordinates[1],
                                lng: d.geometry.coordinates[0],
                                focus: false,
                                draggable: false,
                                message:'<table cellspacing="10">'  +
                                        '<tr><td>Cógido do Projeto:</td><td><b>' + d.properties.cod_projeto +'</b></td>'+
                                        '<tr><td>Cógido do Ponto:</td><td><b>' + d.properties.cod_ponto +'</b></td>'+
                                        '<tr><td>Sitema Geodésico:</td><td><b>' + d.properties.sistema_geodesico +'</b></td>'+
                                        '<tr><td>Data Implantação:</td><td><b>' + d.properties.data_implantacao +'</b></td>'+
                                        '<tr><td>Fuso:</td><td><b>' + d.properties.fuso +'</b></td>'+
                                        '<tr><td>Coord. N:</td><td><b>' + d.properties.coord_n +'</b></td>'+
                                        '<tr><td>Coord. E:</td><td><b>' + d.properties.coord_e +'</b></td>'+
                                        '<tr><td>Acurácia Horizontal:</td><td><b>' + d.properties.acuracia_horizontal +'</b></td>'+
                                        '<tr><td>Acurácia Vertical:</td><td><b>' + d.properties.acuracia_vertical +'</b></td>'+
                                        '<tr><td>Materializado:</td><td><b>' + d.properties.materializado +'</b></td>'+
                                        '</table>'
                                        
                        }
                    })

                    /*
                    
                    */
                    $scope.toggleLayer = function(type){
                        $scope.layers.overlays[type].visible = !$scope.layers.overlays[type].visible;
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