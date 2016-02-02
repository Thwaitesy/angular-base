(function () {
    'use strict';

    angular
        .module('app')
        .run(run);

    run.$inject = ['$rootScope', '$state', '$stateParams', '$window', '$templateCache', '$localStorage'];

    function run($rootScope, $state, $stateParams, $window, $templateCache, $localStorage) {

        // Global Settings
        // -----------------------------------
        $rootScope.app = {
            name: 'Generic',
            year: ((new Date()).getFullYear()),
            layout: {
                isCollapsed: false
            },
            asideToggled: false,
            viewAnimation: 'ng-fadeIn'
        };

        // Set reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$storage = $window.localStorage;

        // Restore layout settings
        if (angular.isDefined($localStorage.layout)) {
            $rootScope.app.layout = $localStorage.layout;
        } else {
            $localStorage.layout = $rootScope.app.layout;
        }

        $rootScope.$watch('app.layout', function () {
            $localStorage.layout = $rootScope.app.layout;
        }, true);

        // Close sub menu when sidebar change from collapsed to normal
        $rootScope.$watch('app.layout.isCollapsed', function (newValue) {
            if (newValue === false)
                $rootScope.$broadcast('closeSidebarMenu');
        });

        //// Disables animation on items with class .ng-no-animation
        //$animateProvider.classNameFilter(/^((?!(ng-no-animation)).)*$/);

        // cancel click event easily
        $rootScope.cancel = function ($event) {
            $event.stopPropagation();
        };

        // State not found
        $rootScope.$on('$stateNotFound',
          function (event, unfoundState/*, fromState, fromParams*/) {
              console.log(unfoundState.to); // "lazy.state"
              console.log(unfoundState.toParams); // {a:1, b:2}
              console.log(unfoundState.options); // {inherit:false} + default options
          });

        // State error
        $rootScope.$on('$stateChangeError',
          function (event, toState, toParams, fromState, fromParams, error) {
              console.log(error);
          });

        // State success
        $rootScope.$on('$stateChangeSuccess',
          function (/*event, toState, toParams, fromState, fromParams*/) {
              // display new view from top
              $window.scrollTo(0, 0);
          });

    }

})();