(function () {
  'use strict';

  var atividadeCtrl = function ($scope, $uibModal, $window, dataFactory, loginFactory) {

    $scope.reload = function () {
      dataFactory.get('regimes')
        .then(function (response) {
          $scope.regimes = response;
        })

      dataFactory.get('tipospalavrachave')
        .then(function (response) {
          $scope.tiposPalavraChave = response;
        })

      dataFactory.get('tiposatividade')
        .then(function (response) {
          $scope.tiposatividade = response;
        })

      dataFactory.getAtivProdPrioriUser(loginFactory.usuario)
        .then(function (response) {
          $scope.ativPriori1 = response[0];
          if ($scope.ativPriori1 && $scope.ativPriori1.tarefas) {
            var miV = [];
            $scope.ativPriori1.tarefas.forEach(function (d) {
              miV.push(d.mi);

              //adiciona historico
              dataFactory.getAtivHistoricoTarefa(d.id).then(function (res) {
                d.historico = res;
                d.historico.forEach(function (a) {
                  var operadoresV = [];
                  a.operadores.forEach(function (d) {
                    operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
                  })
                  a.operadoresText = operadoresV.join(', ');
                })
              })
            })
            $scope.ativPriori1.miText = miV.join(', ')

            var operadoresV = [];
            $scope.ativPriori1.operadores.forEach(function (d) {
              operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
            })
            $scope.ativPriori1.operadoresText = operadoresV.join(', ')

            $scope.ativPriori1.historicoCol = []
          }

          $scope.ativPriori2 = response[1];
          if ($scope.ativPriori2 && $scope.ativPriori2.tarefas) {
            miV = [];
            $scope.ativPriori2.tarefas.forEach(function (d) {
              miV.push(d.mi);

              //adiciona historico
              dataFactory.getAtivHistoricoTarefa(d.id).then(function (res) {
                d.historico = res;
                d.historico.forEach(function (a) {
                  var operadoresV = [];
                  a.operadores.forEach(function (d) {
                    operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
                  })
                  a.operadoresText = operadoresV.join(', ');
                })
              })

            })
            $scope.ativPriori2.miText = miV.join(', ')

            var operadoresV = [];
            $scope.ativPriori2.operadores.forEach(function (d) {
              operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
            })
            $scope.ativPriori2.operadoresText = operadoresV.join(', ')

            $scope.ativPriori2.historicoCol = []
          }
        });

      dataFactory.getAtivProdInicUser(loginFactory.usuario)
        .then(function (response) {
          $scope.atividadesProdIniciadas = response;
          $scope.atividadesProdIniciadas.forEach(function (a) {
            var miV = [];
            a.tarefas.forEach(function (d) {
              miV.push(d.mi);

              //adiciona historico
              dataFactory.getAtivHistoricoTarefa(d.id).then(function (res) {
                d.historico = res;
                d.historico.forEach(function (h) {
                  var operadoresV = [];
                  h.operadores.forEach(function (d) {
                    operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
                  })
                  h.operadoresText = operadoresV.join(', ');
                })
              })
            })
            a.miText = miV.join(', ')

            var operadoresV = [];
            a.operadores.forEach(function (d) {
              operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
            })
            a.operadoresText = operadoresV.join(', ')

            a.historicoCol = []

          })
        });

      dataFactory.getRegProdExecUser(loginFactory.usuario)
        .then(function (regs) {
          $scope.atividadeProdExecucao = [];
          var promises = []
          regs.forEach(function (d) {
            promises.push(dataFactory.getAtivProd(d.atividadeProducao.id)
              .then(function (response) {
                response[0].registro = {};
                response[0].registro.id = d.id;
                response[0].registro.dataInicio = d.dataInicio;
                $scope.atividadeProdExecucao.push(response[0])
              }));
          })
          Promise.all(promises)
            .then(function () {
              $scope.atividadeProdExecucao.forEach(function (a) {
                var miV = [];
                a.tarefas.forEach(function (d) {
                  miV.push(d.mi);

                  //adiciona historico
                  dataFactory.getAtivHistoricoTarefa(d.id).then(function (res) {
                    d.historico = res;
                    d.historico.forEach(function (at) {
                      var operadoresV = [];
                      at.operadores.forEach(function (u) {
                        operadoresV.push(u.postoGrad.nome + " " + u.nomeGuerra);
                      })
                      at.operadoresText = operadoresV.join(', ');
                    })
                  })

                  if (d.palavrasChave.length === 0) {
                    d.palavrasChave.push({
                      id: null,
                      tipo: {
                        id: null,
                        nome: null
                      }
                    })
                  }

                })
                a.miText = miV.join(', ')

                var operadoresV = [];
                a.operadores.forEach(function (d) {
                  operadoresV.push(d.postoGrad.nome + " " + d.nomeGuerra);
                })
                a.operadoresText = operadoresV.join(', ')
                a.historicoCol = []
              })
            })
        });

      dataFactory.getAtivInicUser(loginFactory.usuario)
        .then(function (response) {
          $scope.atividadesIniciadas = response;
        });

      dataFactory.getRegExecUser(loginFactory.usuario)
        .then(function (regs) {
          $scope.atividadeExecucao = [];
          var promises = []
          regs.forEach(function (d) {
            promises.push(dataFactory.getAtiv(d.atividade.id)
              .then(function (response) {
                response[0].registro = {};
                response[0].registro.id = d.id;
                response[0].registro.dataInicio = d.dataInicio;
                $scope.atividadeExecucao.push(response[0])
              }));
          })
        });

    };

    $scope.reload();

    $scope.pausa = function (ativ) {
      if ($window.confirm('Tem certeza que deseja pausar a atividade?')) {
        //limpa palavras chave
        ativ.tarefas.forEach(function (d) {
          d.palavrasChave = d.palavrasChave.filter(function (e) {
            return e.nome && e.nome.trim() != "";
          })
        })

        var registro = {}
        registro.atividadeProducao = ativ;
        registro.operador = {
          id: loginFactory.usuario.id
        }
        registro.dataInicio = ativ.registro.dataInicio;
        registro.id = ativ.registro.id

        dataFactory.update('registrosproducao', registro)
          .then(function success() {
            $scope.reload();
          }, function error() {
            //FIXME
          })
      }
    };

    $scope.finaliza = function (ativ) {
      if ($window.confirm('Tem certeza que deseja finalizar a atividade?')) {
        //limpa palavras chave
        ativ.tarefas.forEach(function (d) {
          d.palavrasChave = d.palavrasChave.filter(function (e) {
            return e.nome && e.nome.trim() != "";
          })
        })

        var registro = {}
        registro.atividadeProducao = ativ;
        registro.operador = {
          id: loginFactory.usuario.id
        }
        registro.dataInicio = ativ.registro.dataInicio;
        registro.id = ativ.registro.id;
        registro.status = {
          id: 5
        };

        dataFactory.update('registrosproducao', registro)
          .then(function success() {
            $scope.reload();
          }, function error() {
            //FIXME
          })
      }
    };

    $scope.inicia = function (ativ) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/addRegime.html',
        controller: 'addRegimeCtrl',
        size: 'sm',
        resolve: {
          regimes: function () {
            return $scope.regimes;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          result.registro.atividadeProducao = {
            id: ativ.id,
            maxOperadores: ativ.maxOperadores,
            operadores: ativ.operadores
          };
          result.registro.operador = {
            id: loginFactory.usuario.id
          }

          dataFactory.insert('registrosproducao', result.registro)
            .then(function success() {
              $scope.reload();
            }, function error() {
              //FIXME
            })
        }, function (exit) {

        });

    }

    $scope.criaAtiv = function () {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/criaAtividade.html',
        controller: 'criaAtividadeCtrl',
        size: 'lg',
        resolve: {
          tiposatividade: function () {
            return $scope.tiposatividade;
          },
          regimes: function () {
            return $scope.regimes;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          result.registro.operador = {
            id: loginFactory.usuario.id
          }

          dataFactory.insert('registrosatividade', result.registro)
            .then(function success() {
              $scope.reload();
            }, function error() {
              //FIXME
            })
        }, function (exit) {

        });
    };

    $scope.iniciaAtiv = function (ativ) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/views/modal/addRegime.html',
        controller: 'addRegimeCtrl',
        size: 'sm',
        resolve: {
          regimes: function () {
            return $scope.regimes;
          }
        }
      });

      modalInstance.result
        .then(function (result) {
          result.registro.atividade = {
            id: ativ.id
          };

          result.registro.operador = {
            id: loginFactory.usuario.id
          }

          dataFactory.insert('registrosatividade', result.registro)
            .then(function success() {
              $scope.reload();
            }, function error() {
              //FIXME
            })
        }, function (exit) {

        });
    };

    $scope.pausaAtiv = function (ativ) {
      if ($window.confirm('Tem certeza que deseja pausar a atividade?')) {

        var registro = {}
        registro.atividade = {
          id: ativ.id,
          observacao: ativ.observacao
        };
        registro.dataInicio = ativ.registro.dataInicio;
        registro.id = ativ.registro.id

        dataFactory.update('registrosatividade', registro)
          .then(function success() {
            $scope.reload();
          }, function error() {
            //FIXME
          })
      }
    };

    $scope.finalizaAtiv = function (ativ) {
      if ($window.confirm('Tem certeza que deseja pausar a atividade?')) {

        var registro = {}
        registro.atividade = {
          id: ativ.id,
          observacao: ativ.observacao
        };
        registro.dataInicio = ativ.registro.dataInicio;
        registro.id = ativ.registro.id;
        registro.status = {
          id: 5
        };

        dataFactory.update('registrosatividade', registro)
          .then(function success() {
            $scope.reload();
          }, function error() {
            //FIXME
          })
      }
    };

    $scope.addPalavraChave = function (tarefa) {
      tarefa.palavrasChave.push({
        nome: null,
        tipo: {
          id: null,
          nome: null
        }
      });
    };

    $scope.remPalavraChave = function (tarefa) {
      if (tarefa.palavrasChave.length > 1) {
        tarefa.palavrasChave.pop();
      } else {
        tarefa.palavrasChave[0] = {
          nome: null,
          tipo: {
            id: null,
            nome: null
          }
        };
      }
    };

  }

  atividadeCtrl.$inject = ['$scope', '$uibModal', '$window', 'dataFactory', 'loginFactory'];

  angular.module('ptoApp')
    .controller('atividadeCtrl', atividadeCtrl);

})();