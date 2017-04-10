(function () {
    'use strict';

    var gerenciaFluxoCtrl = function ($scope, $uibModal, dataFactory, loginFactory, DTOptionsBuilder) {


        var subfases = []
        var gerencia
        $scope.reload = function () {
            subfases = []
            dataFactory.getUsuarioId(loginFactory.usuario.id)
            .then(function(data){
                gerencia = data[0].gerencia
                data[0].gerencia.forEach(function (d) {
                    subfases.push(d.id);
                })
                subfases = subfases.join(",")

                dataFactory.getAtivProdSecExec(subfases)
                    .then(function success(result) {
                        $scope.atividadeEmExecucaoSecao = result;
                        $scope.atividadeEmExecucaoSecao.forEach(function (d) {
                            d.tempoRegistro = (Math.abs(new Date() - new Date(d.dataInicio)) / 3600000).toFixed(2);
                        })
                        $scope.atividadeEmExecucaoSecao.forEach(function (d) {
                            d.miV = [];
                            d.atividadeProducao.tarefas.forEach(function (e) {
                                d.miV.push(e.mi);
                            })
                            d.miText = d.miV.join(", ")
                        })

                    }, function error() {
                        //FIXME
                    });
                dataFactory.getAtivProdSecInic(subfases)
                    .then(function success(result) {
                        $scope.atividadePausadasSecao = result;
                        $scope.atividadePausadasSecao.forEach(function (d) {
                            d.operadorV = [];
                            d.operadores.forEach(function (e) {
                                d.operadorV.push(e.postoGrad.nome + " " + e.nomeGuerra)
                            })
                            d.operadorText = d.operadorV.join(", ")
                        })
                        $scope.atividadePausadasSecao.forEach(function (d) {
                            d.miV = [];
                            d.tarefas.forEach(function (e) {
                                d.miV.push(e.mi);
                            })
                            d.miText = d.miV.join(", ")
                        })
                    }, function error() {
                        //FIXME
                    });
                dataFactory.getAtivProdSecDist(subfases)
                    .then(function success(result) {
                        $scope.atividadeDistribuidaSecao = result;
                        $scope.atividadeDistribuidaSecao.forEach(function (d) {
                            d.usuarios = []
                            d.distribuicao.forEach(function (e) {
                                d.usuarios.push(e.postoGrad.nome + " " + e.nomeGuerra);
                            })
                            d.usuariosTexto = d.usuarios.join(", ");
                        })
                        $scope.atividadeDistribuidaSecao.forEach(function (d) {
                            d.miV = [];
                            d.tarefas.forEach(function (e) {
                                d.miV.push(e.mi);
                            })
                            d.miText = d.miV.join(", ")
                        })
                    }, function error() {
                        //FIXME
                    });
                dataFactory.getAtivProdSecNaoDist(subfases)
                    .then(function success(result) {
                        $scope.atividadeNaoDistribuidaSecao = result;
                        $scope.atividadeNaoDistribuidaSecao.forEach(function (d) {
                            d.miV = [];
                            d.tarefas.forEach(function (e) {
                                d.miV.push(e.mi);
                            })
                            d.miText = d.miV.join(", ")
                        })
                    }, function error() {
                        //FIXME
                    });
            })
        };

        $scope.reload();

        $scope.distribuiAtiv = function (atividade) {
            dataFactory.getUsuariosFuncao(atividade.subfase.id)
                .then(function success(result) {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/views/modal/distribuiAtiv.html',
                        controller: 'distAtivCtrl',
                        size: 'lg',
                        resolve: {
                            atividade: function () {
                                return atividade;
                            },
                            usuarios: function () {
                                return result;
                            }
                        }
                    });

                    modalInstance.result
                        .then(function (result) {

                            if(result.distribuicao){
                                dataFactory.updateAtivDist(result.distribuicao)
                                    .then(function success(response) {
                                        $scope.reload();
                                    })
                            }

                            if(result.metadados){

                            }

                            if(result.subfase){

                            }

                            if(result.bloco){

                            }
                        });
                }, function error() {
                    //FIXME
                });


        };

        $scope.addAtivBloco = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/views/modal/criaAtividadeBloco.html',
                controller: 'criaAtividadeBlocoCtrl',
                size: 'lg',
                resolve: {
                    subfases: function () {
                        return gerencia;
                    },
                    atividades: function () {
                        return $scope.atividadeNaoDistribuidaSecao.filter(function (d) {
                            return d.tarefas.length === 1;
                        })
                    }
                }
            });

            modalInstance.result
                .then(function (result) {
                    //fixme
                    dataFactory.insert('atividadesproducao', result.bloco)
                        .then(function success(response) {
                            $scope.reload();
                        })
                }, function (exit) {

                });

        }

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

    gerenciaFluxoCtrl.$inject = ['$scope', '$uibModal', 'dataFactory', 'loginFactory', 'DTOptionsBuilder'];

    angular.module('ptoApp')
        .controller('gerenciaFluxoCtrl', gerenciaFluxoCtrl);


})();