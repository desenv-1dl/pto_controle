(function () {
    'use strict';

    var subfaseCtrl = function ($scope, $filter, dataFactory, DTOptionsBuilder) {

        $scope.subfases = []
        $scope.reload = function () {
            dataFactory.get('subfases')
                .then(function success(response) {
                    $scope.subfases = response;
                }, function error(response) {
                    //FIXME
                });
        };

        $scope.reload();

        $scope.fases = [];
        //carrega Fases uma única vez
        $scope.loadFases = function () {
            return $scope.fases.length ? null : dataFactory.get('fases')
                .then(function success(response) {
                    $scope.fases = response;
                }, function error(response) {
                    console.log('err')
                    //FIXME
                });
        };

        //
        $scope.changeFase = function (data, id) {
            $scope.fases.forEach(function (d) {
                if (d.id === id) {
                    data.nome = d.nome;
                }
            })
        }
        //Testa valores da edição do campo nome - Não aceita nome vazio
        $scope.check = function (data, id) {
            if (data.trim() == '') {
                return "Este nome não é válido.";
            }
        };

        //Em caso de cancelar a adição
        $scope.cancel = function (data, id) {
            if (data.trim() === "") {
                $scope.subfases = $scope.subfases.filter(function (e) {
                    return e.id != id;
                })
            }
        };

        //Manda para o backend para salvar
        $scope.save = function (data, id) {
            data.nome = data.nome.trim()
            if (typeof id === 'string' && id.substring(0, 3) === 'new') {
                dataFactory.insert('subfases', data)
                    .then(function () {
                        $scope.reload();
                    })
                    .catch(function () {
                        console.log('erro')
                    });
            } else {
                angular.extend(data, {
                    id: id
                });
                dataFactory.update('subfases', data)
                    .then(function () {
                        $scope.reload();
                    })
                    .catch(function () {
                        console.log('erro')
                    });
            }
        };

        // Adiciona no front end um novo elemento
        $scope.add = function () {
            $scope.inserted = {
                id: 'new_' + $scope.subfases.length + 1,
                nome: ''
            };
            $scope.subfases.push($scope.inserted);
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

    subfaseCtrl.$inject = ['$scope', '$filter', 'dataFactory', 'DTOptionsBuilder'];

    angular.module('ptoApp')
        .controller('subfaseCtrl', subfaseCtrl);


})();