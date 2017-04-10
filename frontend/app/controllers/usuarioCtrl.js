(function () {
  'use strict';

  var usuarioCtrl = function ($scope, $uibModal, dataFactory, DTOptionsBuilder) {

    $scope.reload = function () {
      dataFactory.get('usuarios')
        .then(function success(response) {
          $scope.usuarios = response;
        }, function error(response) {
          //FIXME
        });
      Promise.all([
          dataFactory.get('tiposperfil'),
          dataFactory.get('postgrads'),
          dataFactory.get('turnos'),
          dataFactory.get('secoes')
        ])
        .then(function (response) {
          $scope.tiposPerfil = response[0];
          $scope.postGrads = response[1];
          $scope.turnos = response[2];
          $scope.secoes = response[3];
        })
        .catch(function (err) {

        });
    };

    $scope.reload();

    $scope.add = function () {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/criaUsuario.html',
        controller: 'criaUsuarioCtrl',
        size: 'lg',
        resolve: {
          secoes: function () {
            return $scope.secoes;
          },
          funcoes: function () {
            return $scope.turnos;
          },
          postGrads: function () {
            return $scope.postGrads;
          },
          tiposPerfil: function () {
            return $scope.tiposPerfil;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          dataFactory.insert('usuarios', result.usuario)
            .then(function success(response) {
              $scope.reload();
            }, function error(response) {
              //FIXME
              console.log(response)
            })
        }, function (exit) {

        });
    };


    $scope.edita = function (usuario) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/editaUsuario.html',
        controller: 'editaUsuarioCtrl',
        size: 'lg',
        resolve: {
          secoes: function () {
            return $scope.secoes;
          },
          turnos: function () {
            return $scope.turnos;
          },
          postGrads: function () {
            return $scope.postGrads;
          },
          tiposPerfil: function () {
            return $scope.tiposPerfil;
          },
          usuario: function () {
            return usuario;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          if (result.senha) {
            dataFactory.updateUsuarioSenha(result.senha)
              .then(function success(response) {
                $scope.reload();
              }, function error(response) {
                //FIXME
                console.log(response)
              })
          } else {
            dataFactory.update('usuarios', result.usuario)
              .then(function success(response) {
                $scope.reload();
              }, function error(response) {
                //FIXME
                console.log(response)
              })
          }
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

  usuarioCtrl.$inject = ['$scope', '$uibModal', 'dataFactory', 'DTOptionsBuilder'];

  angular.module('ptoApp')
    .controller('usuarioCtrl', usuarioCtrl);


})();