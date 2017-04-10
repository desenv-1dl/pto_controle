(function () {
    'use strict';

    var faseCtrl = function ($scope, dataFactory, DTOptionsBuilder) {

        $scope.fases = []
        $scope.reload = function () {
            dataFactory.get('fases')
                .then(function success(response) {
                    $scope.fases = response;
                }, function error(response) {
                    //FIXME
                });
        };

        $scope.reload();

        //Testa valores da edição do campo nome - Não aceita nome vazio e nomes repetidos
        $scope.check = function (data, id) {
            if (data.trim() == '') {
                return "Este nome não é válido.";
            }
            var erro = false;
            //FIXME uma verificação mais correta seria testar no backend
            $scope.fases.forEach(function (d) {
                if (d.nome === data.trim() && d.id != id) {
                    erro = true;
                }
            })
            if (erro) return "Este nome já existe."
        };

        //Em caso de cancelar a adição de uma nova fase.
        //O valor do campo fica em branco até salvar no frontend
        $scope.cancel = function (data, id) {
            if (data.trim() === "") {
                $scope.fases = $scope.fases.filter(function (e) {
                    return e.id != id;
                })
            }
        };

        //Manda para o backend para salvar
        $scope.save = function (data, id) {
            data.nome = data.nome.trim()
            if (typeof id === 'string' && id.substring(0, 3) === 'new') {
                dataFactory.insert('fases', data)
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
                dataFactory.update('fases', data)
                    .then(function () {
                        $scope.reload();
                    })
                    .catch(function () {
                        console.log('erro')
                    });
            }
        };

        // Adiciona no front end uma nova fase
        $scope.add = function () {
            $scope.inserted = {
                id: 'new_' + $scope.fases.length + 1,
                nome: '',
            };
            $scope.fases.push($scope.inserted);
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

    faseCtrl.$inject = ['$scope', 'dataFactory', 'DTOptionsBuilder'];

    angular.module('ptoApp')
        .controller('faseCtrl', faseCtrl);


})();