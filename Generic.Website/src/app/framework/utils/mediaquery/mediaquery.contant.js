(function() {
    'use strict';

    angular
        .module('app.utils')
        .constant('APP_MEDIAQUERY', {
            'desktopLG': 1200,
            'desktop':   992,
            'tablet':    768,
            'mobile':    480
        });

})();