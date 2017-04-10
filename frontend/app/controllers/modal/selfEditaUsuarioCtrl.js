(function () {
  'use strict';

  var selfEditaUsuarioCtrl = function ($scope, $uibModalInstance,usuario) {
    $scope.usuario = usuario;

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

  selfEditaUsuarioCtrl.$inject = ['$scope', '$uibModalInstance', 'usuario'];

  angular.module('ptoApp')
    .controller('selfEditaUsuarioCtrl', selfEditaUsuarioCtrl);

})();