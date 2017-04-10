(function () {
  'use strict';

  var mainCtrl = function ($scope, $location, $uibModal, dataFactory, loginFactory,leafletData) {

    if(!loginFactory.usuario.perfil || loginFactory.usuario.perfil.id === 1){
      $location.path('')
    } else {
      $scope.usuario = loginFactory.usuario
    }

    $scope.logout = function () {
      loginFactory.logout()
      $location.path('')
    }

    

    $scope.abaAtiva = 'visualizacao'


    $scope.perfil = function () {

      dataFactory.getUsuarioId($scope.usuario.id)
        .then(function(response){
          $scope.usuario.nome = response[0].nome
          
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/views/modal/selfEditaUsuario.html',
            controller: 'selfEditaUsuarioCtrl',
            size: 'lg',
            resolve: {
              usuario: function () {
                return $scope.usuario;
              }
            }
          });

          modalInstance.result
            .then(function (result) {
              if (result.senha) {
                dataFactory.updateUsuarioSenha(result.senha)
                  .then(function success(response) {
                  })
              } else {
                dataFactory.update('usuarios', result.usuario)
                  .then(function success(response) {
                  })
              }
            });
      })
    };

  }

  mainCtrl.$inject = ['$scope', '$location', '$uibModal', 'dataFactory', 'loginFactory']

  angular.module('ptoApp')
    .controller('mainCtrl',mainCtrl)
})()