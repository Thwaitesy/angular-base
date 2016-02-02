(function () {
    'use strict';

    angular
        .module('app')
        .config(routes);

    routes.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider'];
    function routes($stateProvider, $locationProvider, $urlRouterProvider) {

        // clean urls.
        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');

        // defaults to dashboard
        $urlRouterProvider.otherwise('/app/dashboard');

        // 
        // Application Routes
        // -----------------------------------   
        $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: 'app/app.html'
          })
          .state('app.dashboard', {
              url: '/dashboard',
              title: 'Dashboard',
              templateUrl: 'app/dashboard/dashboard.html'
          })
          .state('app.setup', {
              url: '/setup',
              title: 'Setup',
              templateUrl: 'app/setup/setup.html'
          });

    }

})();