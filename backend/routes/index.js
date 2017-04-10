(function () {
  'use strict'

  var express = require('express')
  var router = express.Router()

  var bodyParser = require('body-parser')
  // create application/json parser
  var jsonParser = bodyParser.json()


  var cors = require('cors')
  //  CORS middleware
  router.use(cors({
    exposedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Link, Location',
  }))

  // token de login
  var jwt = require('jsonwebtoken')
  var settings = require('../config.json')
  var jwtSecret = settings.secret

  //middleware para verificar o jwt
  
  var verifyToken = function(req,res,next) {
    //  check header for token
    var token = req.headers['authorization']
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, jwtSecret, function(err, decoded) {      
        if (err) {
          return res.status(401).send({ 
              success: false, 
              message: 'Failed to authenticate token.' 
          })
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next()
        }
      })

    } else {
      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      })
    }    
  }

  //  informa que o serviço de dados está operacional
  router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'Serviço de dados Pontos de Controle em execução'
    })
  })

  //  login
  router.post('/login', jsonParser, function (req, res, next) {
      operations.login(req, res, next, req.body)
  })

  // verifica token para todas as rotas abaixo
  router.use(verifyToken)

  //  Javascript com operações de banco
  var operations = require('../src/operations')

  //  pto_controle - retorna todos os pontos de controle
  router.get('/pontoscontrole', function (req, res, next) {
    operations.get.pontosControle(req, res, next)
  })


  //  pto_controle - insere um ou mais pontos de controle
  router.post('/pontoscontrole', jsonParser, function (req, res, next) {
    operations.post.pontosControle(req, res, next, req.body)
  })


  //  pto_controle - atualiza um ponto de controle determinado pelo codponto
  router.put('/pontoscontrole/:codponto', jsonParser, function (req, res, next) {
    operations.put.pontosControle(req, res, next, req.body, req.params.codponto)
  })

  module.exports = router
})()