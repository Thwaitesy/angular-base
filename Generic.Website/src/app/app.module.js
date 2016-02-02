(function () {
    'use strict';

    angular
        .module('app', [

            // external
            'ngRoute',
            'ngAnimate',
            'ngStorage',
            'ngCookies',
            'ui.bootstrap',
            'ui.router',
            'cfp.loadingBar',
            'ngSanitize',
            'ngResource',
            'ui.utils',

            // framework
            'app.utils',
            'app.sidebar',
            'app.preloader',
            'app.loadingbar',

            // app
            'configuration.module',
            'templates.module',
            'dashboard.module',
            'setup.module'
        ]);

})();