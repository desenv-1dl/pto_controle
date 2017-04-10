(function () {
    'use strict';

    var addRegimeCtrl = function ($scope, $uibModalInstance, regimes) {
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

    addRegimeCtrl.$inject = ['$scope', '$uibModalInstance', 'regimes'];

    angular.module('ptoApp')
        .controller('addRegimeCtrl', addRegimeCtrl);

})();