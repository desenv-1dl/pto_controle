(function () {
  'use strict';

  var usuarioFuncaoCtrl = function ($scope, $uibModal, dataFactory, DTOptionsBuilder) {

    $scope.usuarios = []
    $scope.reload = function () {
      dataFactory.get('usuarios')
        .then(function success(response) {
          $scope.usuarios = response;
          $scope.usuarios.forEach(function (d) {
            var aux = [];
            d.funcoes.forEach(function (f) {
              aux.push(f.nome + " (" + f.fase.nome + ")");
            })
            d.funcoesLista = aux.join(', ');
          })

        }, function error(response) {
          //FIXME
        });

      dataFactory.get('subfases')
        .then(function success(response) {
          $scope.funcoes = response;
        }, function error(response) {
          //FIXME
        });
    };

    $scope.reload();

    $scope.editaUsuario = function (usuario) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/editaUsuarioFuncao.html',
        controller: 'editaUsuarioFuncaoCtrl',
        size: 'lg',
        resolve: {
          usuario: function () {
            return usuario;
          },
          funcoes: function () {
            return $scope.funcoes;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          dataFactory.updateUsuarioFuncao(result.usuario)
            .then(function success(response) {
              $scope.reload();
            }, function error(response) {
              //FIXME
              console.log(response)
            })
        }, function (exit) {

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

  usuarioFuncaoCtrl.$inject = ['$scope', '$uibModal', 'dataFactory', 'DTOptionsBuilder'];

  angular.module('ptoApp')
    .controller('usuarioFuncaoCtrl', usuarioFuncaoCtrl);


})();