(function () {
  'use strict'

  //  express generator
  var express = require('express')
  var path = require('path')

  // log requests - just for dev
  var logger = require('morgan')

  var routes = require('./routes/index')

  var app = express()

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jade')

  app.use(logger('dev'))

  app.use(express.static(path.join(__dirname, 'public')))

  //  clear cache
  app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.header('Pragma', 'no-cache')
    res.header('Expires', 0)
    next()
  })

  app.disable('etag')

  //  Lower case query parameters
  app.use(function (req, res, next) {
    for (var key in req.query) {
      req.query[key.toLowerCase()] = req.query[key]
    }

    next()
  })

  //  chama arquivo de rotas
  app.use('/', routes)

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })



  app.use(function (err, req, res, next) {
    console.log(err)
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })

  module.exports = app
})()




