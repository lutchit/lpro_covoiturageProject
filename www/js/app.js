// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
.config(function($compileProvider,$ionicConfigProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'SearchCtrl'
  })

  // .state('routes', {
  //   url: '/routes',
  //   templateUrl: 'templates/routes.html',
  //   controller: 'RoutesCtrl'
  // })

  // Each tab has its own nav history stack:
  
  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('tab.route-detail', {
    url: '/search/:routeId',
    views: {
      'tab-search': {
        templateUrl: 'templates/route-detail.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('tab.suggest', {
    url: '/suggest',
    views: {
      'tab-suggest': {
        templateUrl: 'templates/tab-suggest.html',
        controller: 'SuggestCtrl'
      }
    }
  })

  .state('tab.routes', {
    url: '/routes',
    views: {
      'tab-routes': {
        templateUrl: 'templates/tab-routes.html',
        controller: 'RoutesCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'HomeCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/search');

  $httpProvider.interceptors.push(['$q', '$location', '$window', function($q, $location, $window) {
    return {
        'request': function (config) {
            config.headers = config.headers || {};
            if ($window.localStorage['jwtToken']) {
                config.headers.Authorization = $window.localStorage['jwtToken'];
            }
            return config;
        },
        'responseError': function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/signin');
            }
            return $q.reject(response);
        }
    };
}]);

});
