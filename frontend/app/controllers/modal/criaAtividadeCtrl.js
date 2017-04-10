(function () {
    'use strict';

    var criaAtividadeCtrl = function ($scope, $uibModalInstance, regimes) {
        $scope.regimes = regimes;

        $scope.registro = {};
        $scope.registro.regime = {};

        $scope.finaliza = function () {
            $uibModalInstance.close({
                registro: $scope.registro
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    criaAtividadeCtrl.$inject = ['$scope', '$uibModalInstance', 'regimes'];

    angular.module('ptoApp')
        .controller('criaAtividadeCtrl', criaAtividadeCtrl);

})();