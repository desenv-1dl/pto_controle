(function () {
  'use strict';

  var projetoCtrl = function ($scope, $uibModal, dataFactory, DTOptionsBuilder) {

    $scope.reload = function () {
      dataFactory.get('projetos')
        .then(function success(response) {
          $scope.projetos = response;
        }, function error() {
          //FIXME
        });
      dataFactory.get('subfases')
        .then(function success(response) {
          $scope.subfases = response;
        }, function error() {
          //FIXME
        });
    };

    $scope.reload();

    $scope.add = function () {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/criaProjeto.html',
        controller: 'criaProjetoCtrl',
        size: 'lg',
        resolve: {
          subfases: function () {
            return $scope.subfases;
          },
        }
      });

      modalInstance.result
        .then(function (result) {
          dataFactory.insert('projetos', result.projeto)
            .then(function success(response) {
              $scope.reload();
            }, function error(response) {
              //FIXME
              console.log(response)
            })
        }, function (exit) {

        });
    };

    $scope.edita = function (projeto) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/editaProjeto.html',
        controller: 'editaProjetoCtrl',
        size: 'lg',
        resolve: {
          projeto: function () {
            return projeto;
          },
        }
      });

      modalInstance.result
        .then(function (result) {

          if(result.metadados){
            dataFactory.update('projetos', result.metadados)
              .then(function success(response) {
                $scope.reload();
              })
          }

          if(result.tarefa){
            dataFactory.updateProjTarefa(result.tarefa)
              .then(function success(response) {
                $scope.reload();
              })
          }

          if(result.inicia){
            dataFactory.updateProjDataInicio(result.inicia)
              .then(function success(response) {
                $scope.reload();
              })
          }

        });
    };

    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withPaginationType('full_numbers')
      .withDisplayLength(10)
      .withLanguage({
        "sEmptyTable": "Nenhum registro encontrado",
        "sInfo": "Mostrando de _START_ a _END_ de um total de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando 0 to 0 of 0 entries",
        "sInfoFiltered": "(filtrado de um total de _MAX_ registros)",
        "sInfoPostFix": "",
        "sInfoThousands": ",",
        "sLengthMenu": "Mostrar _MENU_ itens por página",
        "sLoadingRecords": "Carregando...",
        "sProcessing": "Processando...",
        "sSearch": "Busca: ",
        "sZeroRecords": "Nenhum registro encontrado",
        "oPaginate": {
          "sFirst": "Primeiro",
          "sLast": "Último",
          "sNext": "Próximo",
          "sPrevious": "Anterior"
        }
      });

  };

  projetoCtrl.$inject = ['$scope', '$uibModal', 'dataFactory', 'DTOptionsBuilder'];

  angular.module('ptoApp')
    .controller('projetoCtrl', projetoCtrl);


})();