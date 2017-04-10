(function () {
    'use strict';

    var deepCopy = function (object) {
        if (object) {
            return JSON.parse(JSON.stringify(object));
        } else {
            return {};
        }
    }

    var distAtivCtrl = function ($scope, $uibModalInstance, atividade, usuarios) {
        $scope.atividade = deepCopy(atividade);

        $scope.usuarios = deepCopy(usuarios);

        $scope.finalizaDist = function () {
            $uibModalInstance.close({
                distribuicao: $scope.atividade
            })
        };

        $scope.finalizaMetadados = function () {
            $uibModalInstance.close({
                metadados: $scope.atividade
            })
        };

        $scope.finalizaSubfase = function () {
            $uibModalInstance.close({
                subfase: $scope.atividade
            })
        };

        $scope.finalizaBloco = function () {
            $uibModalInstance.close({
                bloco: $scope.atividade
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    distAtivCtrl.$inject = ['$scope', '$uibModalInstance', 'atividade', 'usuarios'];

    angular.module('ptoApp')
        .controller('distAtivCtrl', distAtivCtrl);

})();