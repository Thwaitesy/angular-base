(function () {
    'use strict';

    angular
        .module('app.loadingbar')
        .config(loadingbar);

    loadingbar.$inject = ['cfpLoadingBarProvider'];
    function loadingbar(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 500;
        cfpLoadingBarProvider.parentSelector = '.wrapper > section';
    };

})();