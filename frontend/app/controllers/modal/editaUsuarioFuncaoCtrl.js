(function () {
    'use strict';

    var deepCopy = function (object) {
        if (object) {
            return JSON.parse(JSON.stringify(object));
        } else {
            return {};
        }
    }


    var editaUsuarioFuncaoCtrl = function ($scope, $uibModalInstance, usuario, funcoes) {

        $scope.usuario = deepCopy(usuario);

        $scope.funcoes = funcoes;

        $scope.finaliza = function () {
            $uibModalInstance.close({
                usuario: $scope.usuario
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    editaUsuarioFuncaoCtrl.$inject = ['$scope', '$uibModalInstance', 'usuario', 'funcoes'];

    angular.module('ptoApp')
        .controller('editaUsuarioFuncaoCtrl', editaUsuarioFuncaoCtrl);

})();