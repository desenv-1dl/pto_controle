(function () {
  'use strict';

  var deepCopy = function (object) {
      if (object) {
          return JSON.parse(JSON.stringify(object));
      } else {
          return {};
      }
  }

  var editaProjetoCtrl = function ($scope, $uibModalInstance, dataFactory, projeto) {

    //escolha das escalas - 25 é o valor default
    $scope.escala = '25';
    $scope.escalas = ['25', '50', '100', '250'];

    $scope.projeto = deepCopy(projeto);

    //busca de MI no backend
    $scope.miAdd = '';
    $scope.listaBuscaMi = [];
    $scope.pesquisaMi = function (mi, escala) {
      dataFactory.pesquisaMi(mi, escala).then(function success(response) {
        $scope.listaBuscaMi = response;
      })
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

    $scope.finalizaMetadados = function () {
      $uibModalInstance.close({
        metadados: $scope.projeto
      })
    };

    $scope.finalizaTarefa = function () {
      $uibModalInstance.close({
        tarefa: $scope.projeto
      })
    };

    $scope.finalizaInicioProjeto = function () {
      $uibModalInstance.close({
        inicia: $scope.projeto
      })
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  };

  editaProjetoCtrl.$inject = ['$scope', '$uibModalInstance', 'dataFactory', 'projeto'];

  angular.module('ptoApp')
    .controller('editaProjetoCtrl', editaProjetoCtrl);

})();