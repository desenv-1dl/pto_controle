(function () {
  'use strict'

  var settings = require('../config.json')

  //  configurando o pg-promise
  var promise = require('bluebird')
  var options = {
    promiseLib: promise
  }
  var pgp = require('pg-promise')(options)
  //  bancos de dados
  var dbSdt = pgp(settings.connectionStringSdt)
  var dbAcervo = pgp(settings.connectionStringAcervo)

  // criptografia e token
  var bcrypt = require('bcrypt')
  var jwt = require('jsonwebtoken');
  var jwtSecret = settings.secret

  bcrypt.hash('senha', 10, function (err, hash) {

    console.log(hash)
  })

  //  login no sistema
  //  expects {login: String, senha: String}
  //  TODO validar JSON
  function login(req, res, next, body) {
    var sdtData
    var acervoData
    dbSdt.oneOrNone('SELECT u.id, u.senha, u.nome_guerra, u.posto_grad_id, p.nome_abrev AS posto_grad_nome FROM usuario AS u' +
        ' INNER JOIN posto_grad AS p ON p.id = u.posto_grad_id WHERE u.login = $1', [body.login])
      .then(function (data) {
        sdtData = data
        /*if (sdtData) {
          return dbAcervo.oneOrNone('SELECT usuario.id  FROM usuario  \
             INNER JOIN perfil ON usuario.id = perfil.usuario_id WHERE usuario.id = $1', [data.id])
        } else {
          throw 'usuario/senha'
        }
      })
      .then(function (data) {
        acervoData = data*/
        acervoData = data
        if (acervoData) {
          bcrypt.compare(body.senha, sdtData.senha, function (err, match) {
            if (err) {
              throw 'Erro no bcrypt'
            } else if (match) {
              var usuario = {
                id: sdtData.id,
                nomeGuerra: sdtData.nome_guerra,
                postoGrad: {
                  id: sdtData.posto_grad_id,
                  nome: sdtData.posto_grad_nome
                },
                perfil: {
                  id: acervoData.tipo_perfil_id,
                  nome: acervoData.tipo_perfil_nome
                }
              }
              var token = jwt.sign(usuario, jwtSecret, {
                expiresIn: 1440 // expires in 24 hours
              });
              return res.status(200).json({
                status: 200,
                descricao: 'Login ok',
                token: token
              })
            } else {
              return res.status(401).json({
                status: 401,
                descricao: 'Usuario ou senha incorretos'
              })
            }
          })
        } else {
          throw 'usuario/senha'
        }
      })
      .catch(function (err) {
        console.log(err)
        if (err === 'usuario/senha') {
          return res.status(401).json({
            status: 401,
            descricao: 'Usuario ou senha incorretos'
          })
        } else {
          return res.status(500).json({
            status: 500,
            descricao: 'Erro no backend'
          })
        }
      })
  }


  var get = {};

  // pontos de controleData
  get.pontosControle = function (req, res, next) {
    dbAcervo.one("SELECT row_to_json(fc) AS geojson \
                 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \
                 FROM (SELECT 'Feature' As type \
                 ,ST_AsGeoJSON(pg.geom)::json As geometry \
                 ,row_to_json(pp) As properties \
                 FROM pto.pto_controle_p As pg \
                 INNER JOIN (SELECT id, \
                              altura_antena, \
                              cod_ponto, \
                              ga.valor AS geometria_aproximada, \
                              tr.valor AS tipo_ref,  \
                              tp.valor AS tipo_pto_controle,\
                              mat.valor AS materializado, \
                              latitude, \
                              longitude, \
                              altitude_ortometrica, \
                              altitude_geometrica, \
                              cod_projeto, \
                              sg.valor AS sistema_geodesico, \
                              ra.valor AS referencial_altim,\
                              orgao_ente_resp,\
                              obs, \
                              coord_n, \
                              coord_e, \
                              fuso, \
                              ma.valor AS med_altura, \
                              data_implantacao, \
                              mi.valor AS metodo_implantacao, \
                              referencia_implantacao, \
                              acuracia_horizontal, \
                              acuracia_vertical, \
                              path_croqui, \
                              path_vista_aerea, \
                              path_monografia, \
                              path_rinex, \
                              path_rel_implantacao, \
                              path_rel_acuracia \
                              FROM pto.pto_controle_p AS pto \
                              INNER JOIN dominios.geometria_aproximada AS ga ON ga.code = pto.geometria_aproximada \
                              INNER JOIN dominios.tipo_ref AS tr ON tr.code = pto.tipo_ref \
                              INNER JOIN dominios.materializado AS mat ON mat.code = pto.materializado \
                              INNER JOIN dominios.sistema_geodesico AS sg ON sg.code = pto.sistema_geodesico \
                              INNER JOIN dominios.referencial_altim AS ra ON ra.code = pto.referencial_altim \
                              INNER JOIN dominios.metodo_implantacao AS mi ON mi.code = pto.metodo_implantacao \
                              INNER JOIN dominios.med_altura AS ma ON ma.code = pto.med_altura \
                              INNER JOIN dominios.tipo_pto_controle AS tp ON tp.code = pto.tipo_pto_controle \
                              ) As pp \
      ON pg.id = pp.id ) As f )  As fc;")
    .then(function (data) {
        return res.status(200).json(data.geojson)
      })
      .catch(function (err) {
        return next(err)
      });
  }







  //-------------------------------------------------------------------------------------------------------------------





  // pontos de controleData
  get.pontos = function (req, res, next) {
    dbAcervo.any('Select id,codponto FROM pto.pto_controle_p')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      });
  }

  //  retorna {id: Integer, nome: String}
  get.turnos = function (req, res, next) {
    dbSdt.any('SELECT id, nome FROM turno')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.postgrads = function (req, res, next) {
    dbSdt.any('SELECT id, nome_abrev AS nome FROM posto_grad')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.tiposperfil = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM tipo_perfil')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.secoes = function (req, res, next) {
    dbSdt.any('SELECT id, nome FROM secao')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.tiposatividade = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM tipo_atividade')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.status = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM status')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.regimes = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM regime')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.tipospalavrachave = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM tipo_palavra_chave')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String}
  get.fases = function (req, res, next) {
    dbControle.any('SELECT id, nome FROM fase')
      .then(function (data) {
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String, fase: {id: Integer, nome: String}}
  get.subfases = function (req, res, next) {
    dbControle.any('SELECT sf.id, sf.nome, f.id AS fase_id, f.nome AS fase_nome FROM subfase AS sf INNER JOIN fase AS f ON f.id = sf.fase_id')
      .then(function (data) {
        var result = []

        data.forEach(function (sf) {
          var aux = {
            id: sf.id,
            nome: sf.nome,
            fase: {
              id: sf.fase_id,
              nome: sf.fase_nome
            }
          }
          result.push(aux)
        })

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  ?id = XX
  get.usuarios = function (req, res, next) {

    dbSdt.any('SELECT u.id, u.nome, u.nome_guerra, u.login, s.nome AS secao_nome, s.id AS secao_id, t.nome AS turno_nome, t.id AS turno_id, ' +
        ' p.nome_abrev AS posto_grad_nome, p.id AS posto_grad_id' +
        ' FROM usuario AS u INNER JOIN secao AS s ON s.id = u.secao_id' +
        ' INNER JOIN turno AS t ON t.id = u.turno_id' +
        ' INNER JOIN posto_grad AS p ON p.id = u.posto_grad_id')
      .then(function (data) {
        var result = []

        data.forEach(function (u) {
          var aux = {
            id: u.id,
            nome: u.nome,
            nomeGuerra: u.nome_guerra,
            login: u.login,
            secao: {
              id: u.secao_id,
              nome: u.secao_nome
            },
            turno: {
              id: u.turno_id,
              nome: u.turno_nome
            },
            postoGrad: {
              id: u.posto_grad_id,
              nome: u.posto_grad_nome
            }
          }
          result.push(aux)
        })

        if (req.query.id !== undefined) {
          result = result.filter(function (d) {
            return d.id.toString() === req.query.id
          })
        }

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id: Integer, nome: String, servidorPg: String, portaPg: Integer, insumosPath, dataInicio: Date, dataFim: Date,
  //        tarefas: [{id, mi, inom, nome, escala, areaSuprimento, bdAquisicao, bdValidacao, bdContinuo, observacao, geom}],
  //        subfases: [{id: Integer, nome: String, preRequisitos: [{id: Integer, nome: String}]}]}
  
  get.projetos = function (req, res, next) {
    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT id, nome, servidor_pg, porta_pg, insumos_path, data_inicio, data_fim FROM projeto'),
          t.any('SELECT id, mi, inom, nome, escala, area_suprimento, bd_aquisicao, bd_validacao, bd_continuo, observacao, projeto_id, geom FROM tarefa'),
          t.any('SELECT ps.id AS id, s.id AS subfase_id, s.nome AS subfase_nome, ps.projeto_id FROM projeto_subfase AS ps INNER JOIN subfase AS s ON ps.subfase_id = s.id'),
          t.any('SELECT pr.projeto_subfase_id, s.id AS subfase_id, s.nome AS subfase_nome FROM pre_requisito AS pr INNER JOIN subfase AS s ON pr.subfase_id = s.id')
        ])
      }).then(function (data) {
        var result = []
        data[0].forEach(function (p) {
          var aux = {
            id: p.id,
            nome: p.nome,
            servidorPg: p.servidor_pg,
            portaPg: p.porta_pg,
            insumosPath: p.insumos_path,
            dataInicio: p.data_inicio,
            dataFim: p.data_fim
          }

          aux.tarefas = []
          aux.subfases = []

          data[1].forEach(function (t) {
            if (t.projeto_id === p.id) {
              aux.tarefas.push({
                id: t.id,
                mi: t.mi,
                inom: t.inom,
                nome: t.nome,
                escala: t.escala,
                areaSuprimento: t.area_suprimento,
                bdAquisicao: t.bd_aquisicao,
                bdValidacao: t.bd_validacao,
                bdContinuo: t.bd_continuo,
                observacao: t.observacao,
                geom: t.geom
              })
            }
          })

          data[2].forEach(function (s) {
            s.preRequisitos = []
            data[3].forEach(function (pr) {
              if (pr.projeto_subfase_id === s.id) {
                s.preRequisitos.push({
                  id: pr.subfase_id,
                  nome: pr.subfase_nome
                })
              }
            })

            if (s.projeto_id === p.id) {
              aux.subfases.push({
                id: s.subfase_id,
                nome: s.subfase_nome,
                preRequisitos: s.preRequisitos
              })
            }
          })

          result.push(aux)
        })
        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  ?usuario = XX
  //  ?status = XX
  //  ?execucao = t // f
  //  ?id = XX
  //  retorna  {id, dataInicio, dataFim, horasTrabalhadas, atividadeTecnica, observacao, tipoAtividade: {id, nome},
  //          status: {id, nome}, operador:{id, nomeGuerra, postoGrad:{nome}}}
  get.atividades = function (req, res, next) {
    var sdtData
    var controleData
    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT a.id, a.data_inicio, a.data_fim, a.horas_trabalhadas, a.operador_id, a.atividade_tecnica, a.observacao, ' +
            ' t.id AS tipo_atividade_id, t.nome AS tipo_atividade_nome, s.id AS status_id, ' +
            ' s.nome AS status_nome' +
            ' FROM atividade AS a INNER JOIN tipo_atividade AS t ON t.id = a.tipo_atividade_id' +
            ' INNER JOIN status AS s ON s.id = a.status_id'),
          t.any('SELECT r.id, r.data_inicio, r.data_fim, re.id AS regime_id, re.nome AS regime_nome, r.operador_id, r.atividade_id FROM registro_atividade AS r INNER JOIN regime AS re ON re.id = r.regime_id')
        ])
      })
      .then(function (data) {
        controleData = data
        return dbSdt.any('SELECT u.id, u.nome_guerra, p.nome_abrev AS posto_grad_nome, p.id AS posto_grad_id' +
          ' FROM usuario AS u INNER JOIN posto_grad AS p ON p.id = u.posto_grad_id')
      })
      .then(function (data) {
        sdtData = data
        var result = []

        controleData[0].forEach(function (a) {
          var aux = {
            id: a.id,
            dataInicio: a.data_inicio,
            dataFim: a.data_fim,
            horasTrabalhadas: a.horas_trabalhadas,
            atividadeTecnica: a.atividade_tecnica,
            observacao: a.observacao,
            tipoAtividade: {
              id: a.tipo_atividade_id,
              nome: a.tipo_atividade_nome
            },
            status: {
              id: a.status_id,
              nome: a.status_nome
            },
            regime: {
              id: a.regime_id,
              nome: a.regime_nome
            }
          }

          aux.historico = []
          controleData[1].forEach(function (b) {
            if (a.id === b.atividade_id) {
              sdtData.forEach(function (u) {
                if (b.operador_id === u.id) {
                  aux.historico.push({
                    dataInicio: b.data_inicio,
                    dataFim: b.data_fim,
                    regime: {
                      id: b.regime_id,
                      nome: b.regime_nome
                    },
                    operador: {
                      id: u.id,
                      nomeGuerra: u.nome_guerra,
                      postoGrad: {
                        id: u.posto_grad_id,
                        nome: u.posto_grad_nome
                      }
                    }
                  })
                }
              })
            }
          })

          sdtData.forEach(function (u) {
            if (a.operador_id === u.id) {
              aux.operador = {
                id: u.id,
                nomeGuerra: u.nome_guerra,
                postoGrad: {
                  id: u.posto_grad_id,
                  nome: u.posto_grad_nome
                }
              }
            }
          })

          result.push(aux)
        })

        if (req.query.usuario !== undefined) {
          result = result.filter(function (d) {
            return d.operador.id.toString() === req.query.usuario
          })
        }

        if (req.query.status !== undefined) {
          var status = req.query.status.split(',')
          result = result.filter(function (d) {
            return status.indexOf(d.status.id.toString()) > -1
          })
        }

        if (req.query.id !== undefined) {
          result = result.filter(function (d) {
            return d.id.toString() === req.query.id
          })
        }

        if (req.query.execucao !== undefined) {
          if (req.query.execucao === 't') {
            result = result.filter(function (d) {
              return d.historico.filter(function (u) {
                return !u.dataFim
              }).length > 0
            })
          } else {
            result = result.filter(function (d) {
              return d.historico.filter(function (u) {
                return !u.dataFim
              }).length === 0
            })
          }
        }

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  ?usuario = X
  //  ?status = X,X,X,X
  //  ?bloco = 't' / 'f'
  //  ?subfase = X,X,X,X
  //  ?tarefa = X
  //  ?execucao = 't' / 'f'
  //  ?id = X
  //  retorna {id, dataInicio, dataFim, horasTrabalhadas, observacao, prioridade, atividadeBloco, legada, status: {id, nome},
  //        tarefas: [{id, mi, inom, nome, escala, areaSuprimento, bdAquisicao, bdValidacao, bdContinuo, observacao, palavrasChave: [{id, nome, tipo: {id, nome}}], projeto: {id, nome, servidor_pg, porta_pg, insumos_path}}],
  //        subfase: {id, nome}, maxOperadores, bloco: {id}, operadores: [{id, nomeGuerra, postoGrad: {id, nomeAbrev}}]
  //        distribuicao: [{id, nomeGuerra, postoGrad: {id, nomeAbrev}}]}
  get.atividadesproducao = function (req, res, next, prioritaria) {
    var sdtData
    var controleData

    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT a.id, a.data_inicio, a.data_fim, a.horas_trabalhadas, a.observacao, a.subfase_id, a.prioridade, a.atividade_bloco' +
            ' , a.bloco_id, a.legada, a.max_operadores, s.id AS status_id, s.nome AS status_nome' +
            ' FROM atividade_producao AS a INNER JOIN status AS s ON s.id = a.status_id' +
            ' ORDER BY a.prioridade'),
          t.any('SELECT t.id, t.mi, t.inom, t.nome, t.escala, t.area_suprimento, t.bd_aquisicao, t.bd_validacao, t.bd_continuo, t.observacao, t.projeto_id, t.geom' +
            ' , p.nome AS projeto_nome, p.servidor_pg, p.porta_pg, p.insumos_path, at.atividade_producao_id FROM tarefa AS t INNER JOIN projeto AS p ON p.id = t.projeto_id' +
            ' INNER JOIN atividade_tarefa AS at ON at.tarefa_id = t.id'),
          t.any('SELECT s.id, s.nome, f.id AS fase_id, f.nome AS fase_nome FROM subfase AS s INNER JOIN fase AS f ON s.fase_id = f.id'),
          t.any('SELECT atividade_producao_id, usuario_id FROM distribuicao_atividade'),
          t.any('SELECT atividade_producao_id, usuario_id FROM operador_atividade'),
          t.any('SELECT p.id, p.nome, p.tarefa_id, t.id AS tipo_palavra_chave_id, t.nome AS tipo_palavra_chave_nome FROM palavra_chave AS p INNER JOIN tipo_palavra_chave AS t ON t.id = p.tipo_palavra_chave_id'),
          t.any('SELECT r.id, r.data_inicio, r.data_fim, re.id AS regime_id, re.nome AS regime_nome, r.operador_id, r.atividade_producao_id FROM registro_producao AS r INNER JOIN regime AS re ON re.id = r.regime_id')
        ])
      }).then(function (data) {
        controleData = data

        return dbSdt.any('SELECT u.id, u.nome_guerra, p.nome_abrev AS posto_grad_nome, p.id AS posto_grad_id' +
          ' FROM usuario AS u INNER JOIN posto_grad AS p ON p.id = u.posto_grad_id')
      }).then(function (data) {
        sdtData = data

        var result = []
        controleData[0].forEach(function (a) {
          var aux = {
            id: a.id,
            dataInicio: a.data_inicio,
            dataFim: a.data_fim,
            horasTrabalhadas: a.horas_trabalhadas,
            observacao: a.observacao,
            prioridade: a.prioridade,
            atividadeBloco: a.atividade_bloco,
            legada: a.legada,
            maxOperadores: a.max_operadores,
            status: {
              id: a.status_id,
              nome: a.status_nome
            }
          }

          aux.tarefas = []
          controleData[1].forEach(function (t) {
            var tarefa = {
              id: t.id,
              mi: t.mi,
              inom: t.inom,
              nome: t.nome,
              escala: t.escala,
              areaSuprimento: t.area_suprimento,
              bdAquisicao: t.bd_aquisicao,
              bdValidacao: t.bd_validacao,
              bdContinuo: t.bd_continuo,
              observacao: t.observacao,
              projeto: {
                id: t.projeto_id,
                nome: t.projeto_nome,
                servidorPg: t.servidor_pg,
                portaPg: t.porta_pg,
                insumosPath: t.insumos_path
              },
              geom: t.geom
            }

            tarefa.palavrasChave = []
            controleData[5].forEach(function (pc) {
              if (pc.tarefa_id === tarefa.id) {
                tarefa.palavrasChave.push({
                  id: pc.id,
                  nome: pc.nome,
                  tipo: {
                    id: pc.tipo_palavra_chave_id,
                    nome: pc.tipo_palavra_chave_nome
                  }
                })
              }
            })

            if (a.id === t.atividade_producao_id) {
              aux.tarefas.push(tarefa)
            }
          })

          controleData[2].forEach(function (s) {
            if (a.subfase_id === s.id) {
              aux.subfase = {
                id: s.id,
                nome: s.nome,
                fase: {
                  id: s.fase_id,
                  nome: s.fase_nome
                }
              }
            }
          })

          controleData[0].forEach(function (b) {
            if (a.bloco_id === b.id) {
              aux.bloco = {
                id: b.id
              }
            }
          })

          sdtData.forEach(function (u) {
            if (a.operador_id === u.id) {
              u.postoGrad = {
                id: u.posto_grad_id,
                nome: u.posto_grad_nome
              }
              aux.operador = {
                id: u.id,
                nomeGuerra: u.nome_guerra,
                postoGrad: u.postoGrad
              }
            }
          })

          aux.historico = []
          controleData[6].forEach(function (b) {
            if (a.id === b.atividade_producao_id) {
              sdtData.forEach(function (u) {
                if (b.operador_id === u.id) {
                  aux.historico.push({
                    dataInicio: b.data_inicio,
                    dataFim: b.data_fim,
                    regime: {
                      id: b.regime_id,
                      nome: b.regime_nome
                    },
                    operador: {
                      id: u.id,
                      nomeGuerra: u.nome_guerra,
                      postoGrad: {
                        id: u.posto_grad_id,
                        nome: u.posto_grad_nome
                      }
                    }
                  })
                }
              })
            }
          })

          aux.distribuicao = []
          controleData[3].forEach(function (p) {
            sdtData.forEach(function (u) {
              if (p.usuario_id === u.id) {
                p.usuario = {
                  id: u.id,
                  nomeGuerra: u.nome_guerra,
                  postoGrad: {
                    id: u.posto_grad_id,
                    nome: u.posto_grad_nome
                  }
                }
              }
            })

            if (a.id === p.atividade_producao_id) {
              aux.distribuicao.push(p.usuario)
            }
          })

          aux.operadores = []
          controleData[4].forEach(function (p) {
            sdtData.forEach(function (u) {
              if (p.usuario_id === u.id) {
                p.usuario = {
                  id: u.id,
                  nomeGuerra: u.nome_guerra,
                  postoGrad: {
                    id: u.posto_grad_id,
                    nome: u.posto_grad_nome
                  }
                }
              }
            })

            if (a.id === p.atividade_producao_id) {
              aux.operadores.push(p.usuario)
            }
          })

          result.push(aux)
        })

        if (prioritaria) {
          //  somente atividades com 'operadores' < 'max_operadores'
          //  ou seja, que ainda podem ser iniciadas
          //  equivalente a pesquisar por status 2 ou 4
          result = result.filter(function (d) {
            return d.operadores.length < d.maxOperadores
          })

          //  somente atividades distribuidas ao usuario fornecido como parâmetro
          result = result.filter(function (d) {
            return d.distribuicao.filter(function (u) {
              return u.id.toString() === req.query.usuario
            }).length > 0
          })
          //  somente as duas primeiras prioridades
          //  result já vem ordenado pela prioridade
          result = result.slice(0, 2)
        } else {
          if (req.query.usuario !== undefined) {
            result = result.filter(function (d) {
              return d.operadores.filter(function (u) {
                return u.id.toString() === req.query.usuario
              }).length > 0
            })
          }

          if (req.query.status !== undefined) {
            var status = req.query.status.split(',')
            result = result.filter(function (d) {
              return status.indexOf(d.status.id.toString()) > -1
            })
          }

          if (req.query.id !== undefined) {
            result = result.filter(function (d) {
              return d.id.toString() === req.query.id
            })
          }

          if (req.query.subfase !== undefined) {
            var subfase = req.query.subfase.split(',')
            result = result.filter(function (d) {
              return subfase.indexOf(d.subfase.id.toString()) > -1
            })
          }

          if (req.query.tarefa !== undefined) {
            result = result.filter(function (d) {
              return d.tarefas.filter(function (u) {
                return u.id.toString() === req.query.tarefa
              }).length > 0
            })
          }

          if (req.query.bloco !== undefined) {
            if (req.query.bloco === 't') {
              result = result.filter(function (d) {
                return d.bloco && d.bloco.id
              })
            } else {
              result = result.filter(function (d) {
                return !(d.bloco && d.bloco.id)
              })
            }
          }

          if (req.query.execucao !== undefined) {
            if (req.query.execucao === 't') {
              result = result.filter(function (d) {
                return d.historico.filter(function (u) {
                  return !u.dataFim
                }).length > 0
              })
            } else {
              result = result.filter(function (d) {
                return d.historico.filter(function (u) {
                  return !u.dataFim
                }).length === 0
              })
            }
          }
        }

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  retorna {id, mi, inom, nome, escala, areaSuprimento, bdAquisicao, bdValidacao, bdContinuo, observacao, projeto:{id}, geom,
  //        palavrasChave: [{id, nome, tipo: {id, nome}}]}
  get.tarefas = function (req, res, next) {
    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT id, mi, inom, nome, escala, area_suprimento, bd_aquisicao, bd_continuo, bd_validacao, observacao, projeto_id, geom FROM tarefa'),
          t.any('SELECT p.id, p.nome, p.tarefa_id, t.id AS tipo_palavra_chave_id, t.nome AS tipo_palavra_chave_nome FROM palavra_chave AS p INNER JOIN tipo_palavra_chave AS t ON t.id = p.tipo_palavra_chave_id')
        ])
      }).then(function (data) {
        var result = []

        data[0].forEach(function (t) {
          var aux = {
            id: t.id,
            mi: t.mi,
            inom: t.inom,
            nome: t.nome,
            escala: t.escala,
            areaSuprimento: t.area_suprimento,
            bdAquisicao: t.bd_aquisicao,
            bdValidacao: t.bd_validacao,
            bdContinuo: t.bd_continuo,
            observacao: t.observacao,
            projeto: {
              id: t.projeto_id
            },
            geom: t.geom
          }
          aux.palavrasChave = []
          aux.atividadesProducao = []

          data[1].forEach(function (p) {
            if (p.tarefa_id === t.id) {
              aux.palavrasChave.push({
                id: p.id,
                nome: p.nome,
                tipo: {
                  id: p.tipo_palavra_chave_id,
                  nome: p.tipo_palavra_chave_nome
                }
              })
            }
          })

          result.push(aux)
        })

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  subfase == ??
  //  usuario == ??
  //  execucao == ??
  //  retorna {id, dataInicio, dataFim, regime: {id, nome}, operador: {id, nomeGuerra, postoGrad: {id, nome}},
  //        atividadeProducao: {id, status: {id, nome}, subfase: {id, nome},
  //        tarefas: [{id, mi, projeto: {id, nome}}]}}
  get.registrosproducao = function (req, res, next) {
    var sdtData
    var controleData

    dbControle.task(function (t) {
      return t.batch([
          t.any('SELECT r.id, r.data_inicio, r.data_fim, r.operador_id, re.id AS regime_id, re.nome AS regime_nome,' +
            ' a.id AS atividade_id, s.id AS status_id, s.nome AS status_nome, su.id AS subfase_id, su.nome AS subfase_nome' +
            ' FROM registro_producao AS r INNER JOIN regime AS re ON r.regime_id = re.id' +
            ' INNER JOIN atividade_producao AS a' +
            ' ON a.id = r.atividade_producao_id INNER JOIN status AS s ON s.id = a.status_id INNER JOIN subfase AS su ON su.id = a.subfase_id'),
          t.any('SELECT t.id, t.mi, t.inom, t.nome, t.escala, t.area_suprimento, t.bd_aquisicao, t.bd_validacao, t.bd_continuo, t.observacao, t.projeto_id, t.geom' +
            ' , p.nome AS projeto_nome, p.servidor_pg, p.porta_pg, p.insumos_path, at.atividade_producao_id FROM tarefa AS t INNER JOIN projeto AS p ON p.id = t.projeto_id' +
            ' INNER JOIN atividade_tarefa AS at ON at.tarefa_id = t.id')
        ])
        .then(function (data) {
          controleData = data
          return dbSdt.any('SELECT u.id, u.nome_guerra, pg.id AS posto_grad_id, pg.nome_abrev AS posto_grad_nome FROM usuario AS u INNER JOIN posto_grad AS pg ON pg.id = u.posto_grad_id')
        })
        .then(function (data) {
          sdtData = data

          var result = []

          controleData[0].forEach(function (t) {
            var aux = {
              id: t.id,
              dataInicio: t.data_inicio,
              dataFim: t.data_fim,
              regime: {
                id: t.regime_id,
                nome: t.regime_nome
              },
              atividadeProducao: {
                id: t.atividade_id,
                status: {
                  id: t.status_id,
                  nome: t.status_nome
                },
                subfase: {
                  id: t.subfase_id,
                  nome: t.subfase_nome
                }
              }
            }

            aux.atividadeProducao.tarefas = []
            controleData[1].forEach(function (u) {
              if (t.atividade_id === u.atividade_producao_id) {
                aux.atividadeProducao.tarefas.push({
                  id: u.id,
                  mi: u.mi,
                  projeto: {
                    id: u.projeto_id,
                    nome: u.projeto_nome
                  }
                })
              }
            })

            sdtData.forEach(function (u) {
              if (t.operador_id === u.id) {
                aux.operador = {
                  id: u.id,
                  nomeGuerra: u.nome_guerra,
                  postoGrad: {
                    id: u.posto_grad_id,
                    nome: u.posto_grad_nome
                  }
                }
              }
            })

            result.push(aux)
          })

          if (req.query.usuario !== undefined) {
            result = result.filter(function (d) {
              return d.operador.id.toString() === req.query.usuario
            })
          }

          if (req.query.subfase !== undefined) {
            var subfase = req.query.subfase.split(',')
            result = result.filter(function (d) {
              return subfase.indexOf(d.atividadeProducao.subfase.id.toString()) > -1
            })
          }

          if (req.query.execucao !== undefined) {
            if (req.query.execucao === 't') {
              result = result.filter(function (d) {
                return !d.dataFim
              })
            } else {
              result = result.filter(function (d) {
                return d.dataFim
              })
            }
          }

          return res.status(200).json(result)
        })
        .catch(function (err) {
          return next(err)
        })
    })
  }

  //  usuario == ??
  //  execucao == ??
  //  retorna {id, dataInicio, dataFim, regime: {id, nome}, operador: {id, nomeGuerra, postoGrad: {id, nome}},
  //        atividade: {id}}
  get.registrosatividade = function (req, res, next) {
    var sdtData
    var controleData

    dbControle.any('SELECT r.id, r.data_inicio, r.data_fim, r.operador_id, re.id AS regime_id, re.nome AS regime_nome,' +
        ' a.id AS atividade_id, s.id AS status_id, s.nome AS status_nome' +
        ' FROM registro_atividade AS r INNER JOIN regime AS re ON r.regime_id = re.id' +
        ' INNER JOIN atividade AS a ON a.id = r.atividade_id INNER JOIN status AS s ON s.id = a.status_id')
      .then(function (data) {
        controleData = data
        return dbSdt.any('SELECT u.id, u.nome_guerra, pg.id AS posto_grad_id, pg.nome_abrev AS posto_grad_nome FROM usuario AS u INNER JOIN posto_grad AS pg ON pg.id = u.posto_grad_id')
      })
      .then(function (data) {
        sdtData = data

        var result = []

        controleData.forEach(function (t) {
          var aux = {
            id: t.id,
            dataInicio: t.data_inicio,
            dataFim: t.data_fim,
            regime: {
              id: t.regime_id,
              nome: t.regime_nome
            },
            atividade: {
              id: t.atividade_id
            }
          }

          sdtData.forEach(function (u) {
            if (t.operador_id === u.id) {
              aux.operador = {
                id: u.id,
                nomeGuerra: u.nome_guerra,
                postoGrad: {
                  id: u.posto_grad_id,
                  nome: u.posto_grad_nome
                }
              }
            }
          })

          result.push(aux)
        })

        if (req.query.usuario !== undefined) {
          result = result.filter(function (d) {
            return d.operador.id.toString() === req.query.usuario
          })
        }

        if (req.query.execucao !== undefined) {
          if (req.query.execucao === 't') {
            result = result.filter(function (d) {
              return !d.dataFim
            })
          } else {
            result = result.filter(function (d) {
              return d.dataFim
            })
          }
        }

        return res.status(200).json(result)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  mi = ??
  //  retorna {mi: String, inom: String, escala: Integer, areaSuprimento: String, geom: EWKT}
  get.molduras = function (req, res, next, escala) {
    var banco
    switch (escala) {
      case '25':
        banco = 'insumos.moldura_25k'
        break
      case '50':
        banco = 'insumos.moldura_50k'
        break
      case '100':
        banco = 'insumos.moldura_100k'
        break
      case '250':
        banco = 'insumos.moldura_250k'
        break
    }
    var query = 'SELECT mi, inom, escala, area_suprimento, St_AsEWKT(geom) AS geom from ' + banco

    if (req.query.mi !== undefined) {
      query = query + " WHERE mi LIKE '%" + req.query.mi + "%'"
    }

    query = query + ' LIMIT 16'

    dbAcervo.any({
        text: query
      })
      .then(function (data) {
        data.forEach(function (d) {
          d.areaSuprimento = d.area_suprimento
          delete d.area_suprimento
        })
        return res.status(200).json(data)
      })
      .catch(function (err) {
        return next(err)
      })
  }

  var post = {}

  //  expects {nome: String}
  post.fases = function (req, res, next, body) {
    dbControle.none('INSERT INTO fase(nome) VALUES($1)', [body.nome])
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        //  validação unique constraint (nome)
        return next(err)
      })
  }

  //  expects {nome: String}
  post.secoes = function (req, res, next, body) {
    dbSdt.none('INSERT INTO secao(nome) VALUES($1)', [body.nome])
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        //  validação unique constraint (nome)
        return next(err)
      })
  }

  //  expects {nome: String, fase: {id: Integer}}
  post.subfases = function (req, res, next, body) {
    dbControle.none('INSERT INTO subfase(nome,fase_id) VALUES($1,$2)', [body.nome, body.fase.id])
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        //  validação unique constraint (nome, fase_id)
        return next(err)
      })
  }

  //  expects {nome, nomeGuerra, login, senha, secao:{id}, turno:{id}, postoGrad:{id}, perfil: {id}}
  post.usuarios = function (req, res, next, body) {
    bcrypt.hash(body.senha, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      dbSdt.one('INSERT INTO usuario(nome,nome_guerra,login,senha,secao_id, turno_id, posto_grad_id)' +
          ' VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id', [body.nome, body.nomeGuerra, body.login, hash,
            body.secao.id, body.turno.id, body.postoGrad.id
          ])
        .then(function (usuario) {
          return dbControle.none('INSERT INTO usuario_perfil(usuario_id, tipo_perfil_id) VALUES($1,$2)', [usuario.id, body.perfil.id])
        })
        .then(function (data) {
          return res.status(201).json({
            status: 201,
            descricao: 'Inserido com sucesso'
          })
        })
        .catch(function (err) {
          //  validação unique constraint (login)
          //  FIXME Como a query é realizada em dois bancos distintos em caso de erro no INSERT de perfil não tem como dar rollback no INSERT de usuários
          //  Tal erro deve ser retornado ao frontend.
          console.log(err)
          return next(err)
        })
    })
  }

  //  cria o projeto
  //  expects {nome: String, servidorPg, portaPg, insumosPath, subfases: [{id: Integer, preRequisitos: [{id: Integer}]}], tarefas: [{mi, inom, escala, areaSuprimento, geom}]}
  post.projetos = function (req, res, next, body) {
    var projetoId

    dbControle.tx(function (t) {
        return t.one('INSERT INTO projeto(nome, servidor_pg, porta_pg, insumos_path) VALUES($1,$2,$3,$4) RETURNING id', [body.nome, body.servidorPg, body.portaPg, body.insumosPath])
          .then(function (projeto) {
            projetoId = projeto.id
            //  adiciona subfases do projeto
            return t.task(function (t2) {
              var batchsql = []
              body.subfases.forEach(function (d) {
                batchsql.push(t2.one('INSERT INTO projeto_subfase(projeto_id, subfase_id) VALUES($1,$2) RETURNING id', [projetoId, d.id]))
              })
              return t2.batch(batchsql)
            })
          })
          .then(function (projetoSubfase) {
            //  monta estrutura de pre requisitos
            return t.task(function (t2) {
              var batchsql = []
              body.subfases.forEach(function (d, i) {
                //  FIXME validar pré requistos subfases para evitar ciclos.
                if (d.preRequisitos) {
                  d.preRequisitos.forEach(function (r) {
                    batchsql.push(t2.one('INSERT INTO pre_requisito(projeto_subfase_id, subfase_id) VALUES($1,$2) RETURNING id', [projetoSubfase[i].id, r.id]))
                  })
                }
              })
              body.tarefas.forEach(function (d) {
                batchsql.push(t.none('INSERT INTO tarefa(mi,inom,escala,area_suprimento,projeto_id,geom) VALUES($1,$2,$3,$4,$5,ST_GeomFromEWKT($6))', [d.mi, d.inom, d.escala, d.areaSuprimento, projetoId, d.geom]))
              })
              return t2.batch(batchsql)
            })
          })
      })
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  não existe a porta para POST tarefas pois são criados automaticamente pelo sistema
  post.tarefas = function (req, res, next, body) {
    return next()
  }

  //  somente são criadas atividades de bloco manualmente
  //  expects {subfase:{id}, maxOperadores, atividades: [{id, tarefas: [{id}]}]}
  post.atividadesproducao = function (req, res, next, body) {
    dbControle.tx(function (t) {
        return t.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES(1,$1,TRUE,FALSE,$2, 0) RETURNING id', [body.subfase.id, body.maxOperadores])
          .then(function (data) {
            return t.task(function (t2) {
              var batchsql = []
              body.atividades.forEach(function (d) {
                batchsql.push(t2.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [data.id, d.tarefas[0].id]))
                batchsql.push(t2.none('UPDATE atividade_producao SET bloco_id = $1 WHERE id = $2', [data.id, d.id]))
              })
              return t2.batch(batchsql)
            })
          })
      })
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        //  trigger que verifica se a atividade_producao já faz parte de um bloco.
        return next(err)
      })
  }

  //  cria/inicia atividade
  //  expects {regime: {id}, operador: {id}, atividade: {id, tipoAtividade: {id}, atividadeTecnica,  observacao}}
  post.registrosatividade = function (req, res, next, body) {
    dbControle.tx(function (t) {
        var batchsql = []
        var dataInicio = new Date()
        dataInicio = dataInicio.toISOString()

        if (body.atividade.id) { // continua a atividade, assim somente necessita criar um novo registro.
          batchsql.push(t.none('INSERT INTO registro_atividade(data_inicio, regime_id, atividade_id, operador_id) VALUES($1,$2,$3,$4)', [dataInicio, body.regime.id, body.atividade.id, body.operador.id]))
        } else {
          batchsql.push(t.one('INSERT INTO atividade(data_inicio, tipo_atividade_id, status_id, atividade_tecnica, operador_id, observacao, horas_trabalhadas) VALUES($1,$2,3,$3,$4,$5,0) RETURNING id', [dataInicio, body.atividade.tipoAtividade.id, body.atividade.atividadeTecnica, body.operador.id, body.atividade.observacao])
            .then(function (data) {
              return t.none('INSERT INTO registro_atividade(data_inicio, regime_id, atividade_id, operador_id) VALUES($1,$2,$3,$4)', [dataInicio, body.regime.id, data.id, body.operador.id])
            })
          )
        }

        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  inicia atividade de producao
  //  expects {regime:{id}, atividadeProducao:{id, maxOperadores, operadores: []}, operador: {id}}
  post.registrosproducao = function (req, res, next, body) {
    dbControle.tx(function (t) {
        var batchsql = []
        var dataInicio = new Date()
        dataInicio = dataInicio.toISOString()

        //  cria registro
        batchsql.push(t.none('INSERT INTO registro_producao(data_inicio, regime_id, atividade_producao_id, operador_id) VALUES($1,$2,$3, $4)', [dataInicio, body.regime.id, body.atividadeProducao.id, body.operador.id]))

        //  testa se o operador nunca iniciou a atividade de producao
        if (body.atividadeProducao.operadores.every(function (d) {
            return d.id !== body.operador.id
          })) {
          //  testa se o operador é o ultimo a iniciar a aitivdade
          if (body.atividadeProducao.maxOperadores - body.atividadeProducao.operadores.length > 1) {
            //  não é o ultimo, status = iniciado parcialmente
            batchsql.push(t.none('UPDATE atividade_producao set status_id = $1 WHERE id = $2', [4, body.atividadeProducao.id]))
          } else {
            //  é o ultimo, status = iniciado
            batchsql.push(t.none('UPDATE atividade_producao set status_id = $1 WHERE id = $2', [3, body.atividadeProducao.id]))
          }
          // testa se o operador foi o primeiro a iniciar a atividade
          if (body.atividadeProducao.operadores.length === 0) {
            //  atualiza data de inicio na atividade
            batchsql.push(t.none('UPDATE atividade_producao set data_inicio = $1, prioridade = NULL WHERE id = $2', [dataInicio, body.atividadeProducao.id]))
          }
          //  adiciona o operador a lista de operadores executando a atividade
          //  remove o operador da lista de distribuicao
          batchsql.push(t.none('INSERT INTO operador_atividade(atividade_producao_id, usuario_id) VALUES($1,$2)', [body.atividadeProducao.id, body.operador.id]))
          batchsql.push(t.none('DELETE FROM distribuicao_atividade WHERE atividade_producao_id = $1 AND usuario_id = $2', [body.atividadeProducao.id, body.operador.id]))
        }
        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        return next(err)
      })
  }

  var put = {}

  //  expects {nome}
  put.fases = function (req, res, next, body, id) {
    dbControle.result('UPDATE fase set nome =$1 WHERE id = $2', [body.nome, id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return res.status(200).json({
            status: 200,
            descricao: 'Atualizado com sucesso'
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          return next(err)
        }
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  expects {nome}
  put.secoes = function (req, res, next, body, id) {
    dbSdt.result('UPDATE secao set nome =$1 WHERE id = $2', [body.nome, id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return res.status(200).json({
            status: 200,
            descricao: 'Atualizado com sucesso'
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  expects {nome, fase:{id}}
  put.subfases = function (req, res, next, body, id) {
    dbControle.result('UPDATE subfase set nome =$1, fase_id = $2 WHERE id = $3', [body.nome, body.fase.id, id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return res.status(200).json({
            status: 200,
            descricao: 'Atualizado com sucesso'
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  expects {nome, nomeGuerra, login, secao: {id}, turno: {id}, postoGrad: {id},}
  put.usuarios = function (req, res, next, body, id) {
    //  não da update na senha

    var query = "UPDATE usuario SET "
    var queryVariables = []

    if (body.nome) {
      queryVariables.push('nome=\'' + body.nome + '\'')
    }

    if (body.nomeGuerra) {
      queryVariables.push('nome_guerra=\'' + body.nomeGuerra + '\'')
    }

    if (body.login) {
      queryVariables.push('login=\'' + body.login + '\'')
    }

    if (body.secao && body.secao.id) {
      queryVariables.push('secao_id=' + body.secao.id)
    }

    if (body.turno && body.turno.id) {
      queryVariables.push('turno_id=' + body.turno.id)
    }

    if (body.postoGrad && body.postoGrad.id) {
      queryVariables.push('posto_grad_id=' + body.postoGrad.id)
    }

    query = query + queryVariables.join(', ') + ' WHERE id = ' + body.id

    dbSdt.result({
        text: query
      })
      .then(function (result) {
        if (result.rowCount > 0) {
            return true;
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          throw err
        }
      })
      .then(function () {
        return res.status(201).json({
          status: 201,
          descricao: 'Inserido com sucesso'
        })
      })
      .catch(function (err) {
        //  FIXME Como a query é realizada em dois bancos distintos em caso de erro no INSERT de perfil não tem como dar rollback no INSERT de usuários
        return next(err)
      })
  }

  //  expects {senha}
  put.usuariosSenha = function (req, res, next, body, id) {
    bcrypt.hash(body.senha, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      return dbSdt.result('UPDATE usuario set senha =$1 WHERE id = $2', [hash, id])
        .then(function (result) {
          if (result.rowCount > 0) {
            return res.status(200).json({
              status: 200,
              descricao: 'Atualizado com sucesso'
            })
          } else {
            var err = new Error('id não encontrado')
            err.status = 404
            next(err)
          }
        })
        .catch(function (err) {
          return next(err)
        })
    })
  }

  //  expects {funcoes: [{id}], gerencia: [{id}]}
  put.usuariosFuncao = function (req, res, next, body, id) {
    dbSdt.result('SELECT * from usuario WHERE id = $1', [id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return dbControle.tx(function (t) {
            var batchsql = []
            //  deleta funções anteriores
            batchsql.push(t.none('DELETE FROM subfase_usuario WHERE usuario_id = $1', [id]))
            batchsql.push(t.none('DELETE FROM subfase_gerente WHERE usuario_id = $1', [id]))

            //  insere novas funções
            body.funcoes.forEach(function (d) {
              batchsql.push(t.none('INSERT INTO subfase_usuario(usuario_id, subfase_id) VALUES($1,$2)', [id, d.id]))
            })
            body.gerencia.forEach(function (d) {
              batchsql.push(t.none('INSERT INTO subfase_gerente(usuario_id, subfase_id) VALUES($1,$2)', [id, d.id]))
            })

            return t.batch(batchsql)
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .then(function () {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  metadados tarefa
  //  expects {nome, bdAquisicao, bdValidacao, bdContinuo, observacao}
  put.tarefas = function (req, res, next, body, id) {
    dbControle.result('UPDATE tarefa set nome =$1, bd_aquisicao = $2, bd_validacao=$3, bd_continuo=$4, observacao = $5  WHERE id = $6', [body.nome, body.bdAquisicao, body.bdValidacao, body.bdContinuo, body.observacao, id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return res.status(200).json({
            status: 200,
            descricao: 'Atualizado com sucesso'
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  pausa ou finaliza registro
  //  expects {dataInicio, status: {id}, atividade:{id, observacao}}
  put.registrosatividade = function (req, res, next, body, id) {
    dbControle.tx(function (t) {
        var batchsql = []

        var dataFim = new Date()
        var horasTrabalhadas = (Math.abs(dataFim - new Date(body.dataInicio)) / 3600000).toFixed(2)

        //  finaliza registro
        //  atualiza horas trabalhadas, observacao em atividade
        batchsql.push(t.none('UPDATE atividade SET observacao = $1, horas_trabalhadas = horas_trabalhadas + $2 WHERE id = $3', [body.atividade.observacao, horasTrabalhadas, body.atividade.id]))
        batchsql.push(t.none('UPDATE registro_atividade SET data_fim = $1 WHERE id = $2', [dataFim.toISOString(), id]))

        if (body.status && body.status.id === 5) { // Finalizado
          batchsql.push(t.none('UPDATE atividade SET status_id = $1 WHERE id = $2', [5, body.atividade.id]))
        }
        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  pausa ou finaliza atividade/registro
  //  expects {dataInicio, status: {id}, atividadeProducao:{id, observacao, maxOperadores, tarefas: [{id, projeto: {id}, palavrasChave: [{id, nome, tipo:{id}}]}], operadores: []}, operador: {id}}
  //  FIXME fazer query para descobrir body.atividadeProducao.operadores
  put.registrosproducao = function (req, res, next, body, id) {
    dbControle.tx(function (t) {
        var batchsql = []
        var dataFim = new Date()
        var horasTrabalhadas = (Math.abs(dataFim - new Date(body.dataInicio)) / 3600000).toFixed(2)
        if (body.status && body.status.id === 5) { // Finalizado
          //  finaliza registro
          //  atualiza operadores, status_id, horas trabalhadas e metadados (tarefa e atividade)
          batchsql.push(t.none('UPDATE atividade_producao SET observacao = $1, horas_trabalhadas = horas_trabalhadas + $2 WHERE id = $3', [body.atividadeProducao.observacao, horasTrabalhadas, body.atividadeProducao.id]))
          batchsql.push(t.none('UPDATE registro_producao SET data_fim = $1 WHERE id = $2', [dataFim.toISOString(), id]))

          if (body.atividadeProducao.operadores.length > 1) {
            batchsql.push(t.none('DELETE FROM operador_atividade WHERE atividade_producao_id = $1 AND usuario_id = $2', [body.atividadeProducao.id, body.operador.id]))
            batchsql.push(t.none('UPDATE atividade_producao SET max_operadores = max_operadores - 1 WHERE id = $1', [body.atividadeProducao.id]))
          } else {
            // ultimo operador, finaliza atividade
            batchsql.push(t.none('UPDATE atividade_producao SET status_id = $1, data_fim = $2 WHERE id = $3', [5, dataFim.toISOString(), body.atividadeProducao.id]))

            //  teste se a atividade é de bloco
            if (body.atividadeProducao.atividadeBloco) {
              //  seleciona atividades parte do bloco
              batchsql.push(t.any('SELECT id FROM atividade_producao WHERE bloco_id = $1', [body.atividadeProducao.id])
                .then(function (ativ) {
                  //  atualiza status_id, data_fim, observacao, horas_trabalhadas
                  return t.task(function (t1) {
                    var b = []
                    var avgHoras = horasTrabalhadas / ativ.length
                    ativ.forEach(function (a) {
                      b.push(t1.none('UPDATE atividade_producao SET status_id = $1, horas_trabalhadas = horas_trabalhadas + $2, data_fim=$3, observacao=$4 WHERE id = $5', [5, avgHoras, dataFim.toISOString(), 'Atividade executada em bloco', a.id]))
                    })
                    return t1.batch(b)
                  })
                })
              )
            }

            //  calcula proxima subfase
            batchsql.push(t.one('SELECT projeto_id FROM tarefa WHERE id = $1', [body.atividadeProducao.tarefas[0].id])
              .then(function (projeto) {
                return t.task(function (t1) {
                  var batchProximaAtiv = []
                  body.atividadeProducao.tarefas.forEach(function (x) {
                    //  calculo proximas subfases - calcula todas as subfases com pre-requisto igual a subfase que concluiu no projeto, verifica se elas atendem todos os pre-requisitos
                    batchProximaAtiv.push(t1.any('WITH subfase_projeto_atual AS (SELECT s.id, ps.id AS projeto_subfase_id FROM subfase AS s INNER JOIN projeto_subfase AS ps ON ps.subfase_id = s.id WHERE ps.projeto_id = $1)' +
                        ' , subfase_candidatas AS (SELECT spa.id, spa.projeto_subfase_id FROM subfase_projeto_atual AS spa INNER JOIN pre_requisito AS pr ON pr.projeto_subfase_id = spa.projeto_subfase_id WHERE pr.subfase_id = $2)' +
                        ' , ativ AS (SELECT ap.id, ap.status_id, ap.subfase_id FROM atividade_producao AS ap INNER JOIN atividade_tarefa AS at ON at.atividade_producao_id = ap.id WHERE at.tarefa_id = $3 AND ap.bloco_id IS NULL)' +
                        ' SELECT sc.id, pr.subfase_id AS pre_subfase_id, ap.id AS ativ_prod_id, ap.status_id FROM subfase_candidatas AS sc INNER JOIN pre_requisito AS pr ON pr.projeto_subfase_id = sc.projeto_subfase_id' +
                        ' INNER JOIN ativ AS ap ON ap.subfase_id = pr.subfase_id', [projeto.projeto_id, body.atividadeProducao.subfase.id, x.id])
                      .then(function (result) {
                        var subfases = []
                        var reprovadas = []
                        result.forEach(function (d) {
                          if (d.status_id !== 5) {
                            reprovadas.push(d.id)
                          }
                        })
                        result.forEach(function (d) {
                          if (reprovadas.indexOf(d.id) === -1 && subfases.indexOf(d.id) === -1) {
                            subfases.push(d.id)
                          }
                        })
                        console.log(x.id, subfases)
                        return t1.tx(function (t2) {
                          var sqlV = []
                          subfases.forEach(function (d) {
                            sqlV.push(t2.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES($1,$2,FALSE,FALSE,1,0) RETURNING id', [1, d])
                              .then(function (ativ) {
                                console.log(ativ)
                                return t2.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [ativ.id, x.id])
                              })
                            )
                          })
                          return t2.batch(sqlV)
                        })
                      }))
                  })
                  return t1.batch(batchProximaAtiv)
                })
              })
            )
          }
        } else {
          //  finaliza registro
          //  atualiza horas trabalhadas, observacao em atividade
          //  atualiza nome e palavras chave em tarefas
          batchsql.push(t.none('UPDATE atividade_producao SET observacao = $1, horas_trabalhadas = horas_trabalhadas + $2 WHERE id = $3', [body.atividadeProducao.observacao, horasTrabalhadas, body.atividadeProducao.id]))
          batchsql.push(t.none('UPDATE registro_producao SET data_fim = $1 WHERE id = $2', [dataFim.toISOString(), id]))
        }

        //  atualiza metadados tarefa
        body.atividadeProducao.tarefas.forEach(function (d) {
          batchsql.push(t.none('UPDATE tarefa SET nome = $1 WHERE id = $2', [d.nome, d.id]))
          batchsql.push(t.none('DELETE from palavra_chave WHERE tarefa_id = $1', [d.id]))

          d.palavrasChave.forEach(function (e) {
            batchsql.push(t.none('INSERT into palavra_chave(nome, tipo_palavra_chave_id, tarefa_id) VALUES($1,$2,$3)', [e.nome, e.tipo.id, d.id]))
          })
        })

        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  atualiza distribuição dos usuários, prioridade, e maxOperadores
  //  expects {prioridade, maxOperadores, distribuicao: [{id}]}
  put.distAtivProducao = function (req, res, next, body, id) {
    var batchsql = []
    dbControle.tx(function (t) {
        batchsql.push(t.none('DELETE FROM distribuicao_atividade WHERE atividade_producao_id = $1', [id]))

        if (body.distribuicao.length > 0) {
          body.distribuicao.forEach(function (d) {
            batchsql.push(t.none('INSERT INTO distribuicao_atividade(atividade_producao_id, usuario_id) VALUES($1,$2)', [id, d.id]))
          })
          // somente atualiza status se o status da atividade for != 4 (Iniciada parcialmente)
          batchsql.push(t.none('UPDATE atividade_producao SET status_id = $1 WHERE id = $2 AND status_id != 4', [2, id]))
        } else {
          batchsql.push(t.none('UPDATE atividade_producao SET status_id = $1 WHERE id = $2 AND status_id != 4', [1, id]))
          body.prioridade = null
          batchsql.push(t.none('UPDATE atividade_producao SET prioridade = NULL WHERE id = $1', [id]))
        }

        batchsql.push(t.none('UPDATE atividade_producao SET max_operadores = $1 WHERE id = $2', [body.maxOperadores, id]))

        if (body.prioridade > 0) {
          //  Prioridades só são calculadas para tarefas com status Distribuidas ou Iniciadas Parcialmente
          batchsql.push(t.none('UPDATE atividade_producao SET prioridade = prioridade + 1' +
            ' WHERE prioridade >= $1 AND (status_id = 2 OR status_id = 4)', [body.prioridade]))

          batchsql.push(t.none('UPDATE atividade_producao set prioridade=$1 WHERE id = $2', [body.prioridade, id]))

          //  garante a sequencia correta de 1 a N
          batchsql.push(t.none('WITH foo AS (SELECT id, prioridade FROM atividade_producao WHERE status_id = 2 OR status_id = 4)' +
            ' , bar AS (SELECT id, row_number() OVER (ORDER BY prioridade) as rnum FROM foo)' +
            ' UPDATE atividade_producao a SET prioridade = u.rnum FROM bar AS u WHERE u.id = a.id')) // distribuida
        }

        return t.batch(batchsql)
      })
      .then(function (data) {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  Adiciona tarefas. FIXME não é possível remover tarefas.
  //  expects {tarefas: [{mi, inom, escala, areaSuprimento, geom}]}
  put.projetosTarefas = function (req, res, next, body, id) {
    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT data_inicio FROM projeto WHERE id = $1', [id]),
          t.any('SELECT ps.id AS id, s.id AS subfase_id FROM projeto_subfase AS ps INNER JOIN subfase AS s ON ps.subfase_id = s.id WHERE ps.projeto_id = $1', [id]),
          t.any('SELECT pr.projeto_subfase_id, s.id AS subfase_id FROM pre_requisito AS pr INNER JOIN subfase AS s ON pr.subfase_id = s.id')
        ])
      }).then(function (data) {
        if (data[0].length > 0) {
          return dbControle.tx(function (t) {
            var batchsql = []
            body.tarefas.forEach(function (d) {
              batchsql.push(t.none('INSERT INTO tarefa(mi,inom,escala,area_suprimento,projeto_id,geom) VALUES($1,$2,$3,$4,$5,ST_GeomFromEWKT($6))', [d.mi, d.inom, d.escala, d.areaSuprimento, id, d.geom]))
            })
            // se o projeto já iniciou também cria as atividades sem pré requisitos para cada tarefa adicionada.
            if (data[0][0].data_inicio) {
              var subfases = []
              data[1].forEach(function (s) {
                s.preRequisitos = []
                data[2].forEach(function (pr) {
                  if (pr.projeto_subfase_id === s.id) {
                    s.preRequisitos.push({
                      id: pr.subfase_id
                    })
                  }
                })

                subfases.push({
                  id: s.subfase_id,
                  preRequisitos: s.preRequisitos
                })
              })
              subfases.forEach(function (d) {
                if (d.preRequisitos && d.preRequisitos.length === 0) {
                  //  atividade sem pre-requisito
                  body.tarefas.forEach(function (ta) {
                    batchsql.push(
                      t.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES($1,$2, FALSE, FALSE, 1, 0) RETURNING id', [1, d.id])
                      .then(function (data) {
                        return t.any('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [data.id, ta.id])
                      })
                    )
                  })
                }
              })
            }
            return t.batch(batchsql)
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          throw err;
        }
      })
      .then(function (data) {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  expects {nome, servidorPg, portaPg, insumosPath}
  put.projetos = function (req, res, next, body, id) {
    dbControle.result('UPDATE projeto set nome =$1, servidor_pg = $2, porta_pg = $3, insumos_path = $4 WHERE id = $5', [body.nome, body.servidorPg, body.portaPg, body.insumosPath, id])
      .then(function (result) {
        if (result.rowCount > 0) {
          return res.status(200).json({
            status: 200,
            descricao: 'Atualizado com sucesso'
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .catch(function (err) {
        return next(err)
      })
  }

  //  expects {}
  put.projetosDataInicio = function (req, res, next, body, id) {
    dbControle.task(function (t) {
        return t.batch([
          t.any('SELECT * FROM projeto WHERE data_inicio IS NULL AND id = $1', [id]),
          t.any('SELECT ps.id AS id, s.id AS subfase_id FROM projeto_subfase AS ps INNER JOIN subfase AS s ON ps.subfase_id = s.id WHERE ps.projeto_id = $1', [id]),
          t.any('SELECT pr.projeto_subfase_id, s.id AS subfase_id FROM pre_requisito AS pr INNER JOIN subfase AS s ON pr.subfase_id = s.id'),
          t.any('SELECT id FROM tarefa WHERE projeto_id = $1', [id])
        ])
      }).then(function (data) {
        if (data[0].length > 0) {
          dbControle.tx(function (t) {
            var batchsql = []
            var dataInicio = new Date()
            dataInicio = dataInicio.toISOString()
            batchsql.push(t.none('UPDATE projeto set data_inicio =$1 WHERE data_inicio IS NULL AND id = $2', [dataInicio, id]))

            var subfases = []
            data[1].forEach(function (s) {
              s.preRequisitos = []
              data[2].forEach(function (pr) {
                if (pr.projeto_subfase_id === s.id) {
                  s.preRequisitos.push({
                    id: pr.subfase_id
                  })
                }
              })

              subfases.push({
                id: s.subfase_id,
                preRequisitos: s.preRequisitos
              })
            })
            subfases.forEach(function (d) {
              if (d.preRequisitos && d.preRequisitos.length === 0) {
                //  atividade sem pre-requisito
                data[3].forEach(function (ta) {
                  batchsql.push(
                    t.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES($1,$2, FALSE, FALSE, 1, 0) RETURNING id', [1, d.id])
                    .then(function (ativ) {
                      return t.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [ativ.id, ta.id])
                    })
                  )
                })
              }
            })
            return t.batch(batchsql)
          })
        } else {
          var err = new Error('id não encontrado')
          err.status = 404
          next(err)
        }
      })
      .then(function (data) {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  atualiza atividade de uma atividade de bloco
  //  expects {}
  put.atividadesproducaoBloco = function (req, res, next, body, id) {
    dbControle.tx(function (t) {
        return t.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES(1,$1,TRUE,FALSE,$2, 0) RETURNING id', [body.subfase.id, body.maxOperadores])
          .then(function (data) {
            return t.task(function (t2) {
              var batchsql = []
              body.atividades.forEach(function (d) {
                batchsql.push(t2.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [data.id, d.tarefas[0].id]))
                batchsql.push(t2.none('UPDATE atividade_producao SET bloco_id = $1 WHERE id = $2', [data.id, d.id]))
              })
              return t2.batch(batchsql)
            })
          })
      })
      .then(function (data) {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  atualiza metadados da atividade e de suas tarefas
  put.atividadesproducao = function (req, res, next, body, id) {
    dbControle.tx(function (t) {
        return t.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES(1,$1,TRUE,FALSE,$2, 0) RETURNING id', [body.subfase.id, body.maxOperadores])
          .then(function (data) {
            return t.task(function (t2) {
              var batchsql = []
              body.atividades.forEach(function (d) {
                batchsql.push(t2.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [data.id, d.tarefas[0].id]))
                batchsql.push(t2.none('UPDATE atividade_producao SET bloco_id = $1 WHERE id = $2', [data.id, d.id]))
              })
              return t2.batch(batchsql)
            })
          })
      })
      .then(function (data) {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  finaliza uma atividade de produção sem executa-la (ou seja, pula aquela subfase)
  //  expects {subfase: {id}, tarefas: [{id}]}
  //  FIXME conseguir informaçoes com query
  put.finalizaAtivProd = function (req, res, next, body, id) {
    var data = new Date()
    data = data.toISOString()
    dbControle.tx(function (t) {
        var batchsql = []
        batchsql.push(t.none('UPDATE atividade_producao SET status_id = 5, horas_trabalhadas = 0, data_inicio = $1, data_fim = $1, observacao = $2 WHERE id = $3', [data, 'Atividade não executada', id]))

        //  calcula proxima subfase
        batchsql.push(
          t.task(function (t1) {
            return t1.one('SELECT projeto_id FROM tarefa WHERE id = $1', [body.tarefas[0].id])
              .then(function (projeto) {
                //  calculo proximas subfases - calcula todas as subfases com pre-requisto igual a subfase que concluiu no projeto, verifica se elas atendem todos os pre-requisitos
                return t1.any('WITH subfase_projeto_atual AS (SELECT s.id, ps.id AS projeto_subfase_id FROM subfase AS s INNER JOIN projeto_subfase AS ps ON ps.subfase_id = s.id WHERE ps.projeto_id = $1)' +
                  ' , subfase_candidatas AS (SELECT spa.id, spa.projeto_subfase_id FROM subfase_projeto_atual AS spa INNER JOIN pre_requisito AS pr ON pr.projeto_subfase_id = spa.projeto_subfase_id WHERE pr.subfase_id = $2)' +
                  ' SELECT sc.id, pr.subfase_id AS pre_subfase_id, ap.id AS ativ_prod_id, ap.status_id FROM subfase_candidatas AS sc INNER JOIN pre_requisito AS pr ON pr.projeto_subfase_id = sc.projeto_subfase_id' +
                  ' INNER JOIN atividade_producao AS ap ON ap.subfase_id = pr.subfase_id WHERE ap.id = $3', [projeto.projeto_id, body.subfase.id, id])
              })
              .then(function (result) {
                var subfases = []
                var reprovadas = []
                result.forEach(function (d) {
                  if (d.status_id !== 5) {
                    reprovadas.push(d.id)
                  }
                })
                result.forEach(function (d) {
                  if (reprovadas.indexOf(d.id) === -1 && subfases.indexOf(d.id) === -1) {
                    subfases.push(d.id)
                  }
                })
                return t1.tx(function (t2) {
                  var sqlV = []
                  subfases.forEach(function (d) {
                    body.tarefas.forEach(function (e) {
                      sqlV.push(t2.one('INSERT INTO atividade_producao(status_id, subfase_id, atividade_bloco, legada, max_operadores, horas_trabalhadas) VALUES($1,$2,FALSE,FALSE,1,0) RETURNING id', [1, d])
                        .then(function (ativ) {
                          return t2.none('INSERT INTO atividade_tarefa(atividade_producao_id, tarefa_id) VALUES($1,$2)', [ativ.id, e.id])
                        })
                      )
                    })
                  })
                  return t2.batch(sqlV)
                })
              })
          })
        )

        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  //  envia atividade para uma subfase anterior (dentro de seus pré requisitos)
  //  expects: {subfases: {id}}
  put.enviaSubfaseAnteriorAtiv = function (req, res, next, body, id) {
    //  torna status da atividade de producao 'Inativa' (6)
    //  para cada subfase enviada em body.subfases torna o status da atividade de producao correspondente (para as mesmas tarefas) para o valor 1 (Não distribuída), e remove data_fim
    //  também adiciona um texto na observacao da atividade 'Atividade enviada novamente devido a problemas encontrados'
    dbControle.tx(function (t) {
        var batchsql = []


        return t.batch(batchsql)
      })
      .then(function () {
        return res.status(200).json({
          status: 200,
          descricao: 'Atualizado com sucesso'
        })
      })
      .catch(function (err) {
        console.log(err)
        return next(err)
      })
  }

  var del = {}



  //-------------------------------------------------------------------------------------------------------------------


  module.exports.get = get
  module.exports.post = post
  module.exports.put = put
  module.exports.del = del
  module.exports.login = login
})()
