(function () {
  'use strict';

  var criaProjetoCtrl = function ($scope, $uibModalInstance, dataFactory, subfases) {
    $scope.subfases = subfases;

    //escolha das escalas - 25 é o valor default
    $scope.escala = '25';
    $scope.escalas = ['25', '50', '100', '250'];

    $scope.projeto = {};
    $scope.projeto.subfases = [];

    //variável de paginação
    $scope.page = 1;

    //busca de MI no backend
    $scope.miAdd = '';
    $scope.listaBuscaMi = [];
    $scope.pesquisaMi = function () {
      dataFactory.pesquisaMi($scope.miAdd, $scope.escala).then(function success(response) {
        $scope.listaBuscaMi = response;
      }, function error(response) {})
    }

    $scope.removeMi = function (tarefa) {
      $scope.projeto.tarefas = $scope.projeto.tarefas.filter(function (d) {
        return d.inom != tarefa.inom;
      })
    }

    $scope.projeto.tarefas = [];
    $scope.addMi = function (moldura) {
      if (!$scope.projeto.tarefas.some(function (e) {
          return e.inom === moldura.inom
        })) {
        var tarefa = {};
        tarefa.mi = moldura.mi;
        tarefa.inom = moldura.inom;
        tarefa.areaSuprimento = moldura.areaSuprimento;
        tarefa.escala = moldura.escala;
        tarefa.geom = moldura.geom;

        $scope.projeto.tarefas.push(tarefa);
      }
    }

    $scope.finaliza = function () {
      $uibModalInstance.close({
        projeto: $scope.projeto
      })
    };

    $scope.proximo = function () {
      $scope.page += 1;
    }

    $scope.anterior = function () {
      $scope.page -= 1;
    }

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  };

  criaProjetoCtrl.$inject = ['$scope', '$uibModalInstance', 'dataFactory', 'subfases'];

  angular.module('ptoApp')
    .controller('criaProjetoCtrl', criaProjetoCtrl);

})();