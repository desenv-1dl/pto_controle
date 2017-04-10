(function () {
  'use strict';

  var criaAtividadeBlocoCtrl = function ($scope, $uibModalInstance, subfases, atividades) {
    $scope.subfases = subfases;
    $scope.atividades = atividades;

    $scope.disabled = true;

    $scope.bloco = {};
    $scope.bloco.subfase = {};

    $scope.updatemi = function () {
      $scope.disabled = true;
      $scope.bloco.atividades = [];
      $scope.atividades = atividades.filter(function (d) {
        return d.subfase.id === $scope.bloco.subfase.id
      })
      if($scope.atividades.length > 1){
        $scope.disabled = false;
      }
    };

    $scope.finaliza = function () {
        $uibModalInstance.close({
          bloco: $scope.bloco
        })
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  };

  criaAtividadeBlocoCtrl.$inject = ['$scope', '$uibModalInstance', 'subfases', 'atividades'];

  angular.module('ptoApp')
    .controller('criaAtividadeBlocoCtrl', criaAtividadeBlocoCtrl);

})();