(function () {
    'use strict';

    var criaUsuarioCtrl = function ($scope, $uibModalInstance, secoes, turnos, postGrads, tiposPerfil) {

        $scope.tiposPerfil = tiposPerfil;
        $scope.postGrads = postGrads;
        $scope.turnos = turnos;
        $scope.secoes = secoes;

        $scope.usuario = {};
        $scope.usuario.perfil = {};

        $scope.postoGrad = {}
        $scope.secao = {}
        $scope.turno = {}



        $scope.finaliza = function () {
            $uibModalInstance.close({
                usuario: $scope.usuario
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    criaUsuarioCtrl.$inject = ['$scope', '$uibModalInstance', 'secoes', 'funcoes', 'postGrads', 'tiposPerfil'];

    angular.module('ptoApp')
        .controller('criaUsuarioCtrl', criaUsuarioCtrl);

})();