(function () {
  'use strict';

    var deepCopy = function (object) {
        if (object) {
            return JSON.parse(JSON.stringify(object));
        } else {
            return {};
        }
    }

  var editaUsuarioCtrl = function ($scope, $uibModalInstance, secoes, turnos, postGrads, tiposPerfil, usuario) {

    $scope.tiposPerfil = tiposPerfil;
    $scope.postGrads = postGrads;
    $scope.turnos = turnos;
    $scope.secoes = secoes;

    $scope.usuario = deepCopy(usuario);

    $scope.postoGrad = {}
    $scope.secao = {}
    $scope.turno = {}

    $scope.finaliza = function () {
      $uibModalInstance.close({
        usuario: $scope.usuario
      })
    };

    $scope.finalizaSenha = function () {
      $uibModalInstance.close({
        senha: $scope.usuario
      })
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  };

  editaUsuarioCtrl.$inject = ['$scope', '$uibModalInstance', 'secoes', 'turnos', 'postGrads', 'tiposPerfil', 'usuario'];

  angular.module('ptoApp')
    .controller('editaUsuarioCtrl', editaUsuarioCtrl);

})();