// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('decrast', ['ionic', 'decrast.controllers', 'decrast.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
      .state('addTask', {
          url: '/addTask',
          templateUrl: 'templates/task.html',
          controller: 'AddTaskCtrl'
      })
    .state('viewTask', {
      url: '/viewTask',
          templateUrl: 'templates/task.html',
          controller: 'ViewTaskCtrl'
    })
    .state('editTask', {
      url: '/editTask',
          templateUrl: 'templates/task.html',
          controller: 'EditTaskCtrl'
    })

  .state('tab.ftasks', {
      url: '/ftasks',
      views: {
        'tab-ftasks': {
          templateUrl: 'templates/tab-ftasks.html',
          controller: 'FtasksCtrl'
        }
      }
    })

  .state('tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/tab-friends.html',
        controller: 'FriendsCtrl'
      }
    }
  })

    .state('tab.notif', {
      url: '/notif',
      views: {
        'tab-notif': {
          templateUrl: 'templates/tab-notifications.html',
          controller: 'NotifCtrl'
        }
      }
    })

    .state('settings', {
      url: '/settings',
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});


/*
This factory will be used for creating task objects and processing changes to the tasks. We will also likely add functions
to  update local storage and the server in this factory.
 */
decrast.factory('taskFact', function() {

  return function() {

      //task constructor?
      self.addTask = function (name, descrip, category, time) {

        var task = {};



      return task;
      };

      //task editor?
      self.editTask = function(task, name, descrip, category)
      {



      return task;
      };


      return self;
  };

});
