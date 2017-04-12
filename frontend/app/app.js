(function () {
  'use strict'
  //  ui.bootstrap https://angular-ui.github.io/bootstrap/ - MIT License
  //  ngRoute https://docs.angularjs.org/api/ngRoute - MIT License
  //  ngMessages https://docs.angularjs.org/api/ngMessages/directive/ngMessages - MIT License
  //  cgBusy - https://github.com/cgross/angular-busy
  //  xeditable - https://vitalets.github.io/angular-xeditable/,
  //  datatables / datatables.bootstrap - https://l-lin.github.io/angular-datatables/#/angularWay
  //  ui.select https://github.com/angular-ui/ui-
  //  ngStorage https://github.com/gsklee/ngStorage
  var app = angular.module('ptoApp', ['ui.bootstrap', 'ngRoute', 'ngMessages', 'cgBusy', 'xeditable', 'datatables', 
                           'datatables.bootstrap', 'ui.select', 'ngStorage', 'nemLogging', 'ui-leaflet']);

  app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'loginCtrl',
        templateUrl: 'app/views/login.html'
      })
      .when('/main', {
        controller: 'mainCtrl',
        templateUrl: 'app/views/index.html'
      })
      .when('/visualizacao', {
        controller: 'visualizacaoCtrl',
        templateUrl: 'app/views/visualizacao.html'
      })
      .otherwise({
        redirectTo: '/'
      })
  })

  app.run(function (editableOptions) {
    editableOptions.theme = 'bs3' // bootstrap3 theme. Can be also 'bs2', 'default'
  })

  /**
   * http://plnkr.co/edit/?p=preview
   * AngularJS default filter with the following expression:
   * "person in people | filter: {name: $select.search, age: $select.search}"
   * performs a AND between 'name: $select.search' and 'age: $select.search'.
   * We want to perform a OR.
   */
  app.filter('propsFilter', function () {
    return function (items, props) {
      var out = []

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false

          var keys = Object.keys(props)
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i]
            var text = props[prop].toLowerCase()
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true
              break
            }
          }

          if (itemMatches) {
            out.push(item)
          }
        })
      } else {
        // Let the output be the input untouched
        out = items
      }

      return out
    }
  })
})()