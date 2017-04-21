// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('decrast', ['ionic', 'decrast.controllers', 'decrast.services', 'decrast.server', 'ngOpenFB', 'ngCordova', 'ngOrderObjectBy'])

.run(function($ionicPlatform, ngFB) {
  
  ngFB.init({appId: '859339004207573'});

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

		FCMPlugin.onNotification(function(data){
      if(data.wasTapped){
        //Notification was received on device tray and tapped by the user.
        alert( JSON.stringify(data) );
      }else{
      //Notification was received in foreground. Maybe the user needs to be notified.
        alert( JSON.stringify(data) );
      }
    });


  });
})
.constant('ApiEndpoint', {
  url: 'http://alext.se:8000/'
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
    cache:false,
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
      .state('addTask', {
          url: '/addTask',
          cache: false,
          params: {
            viewer: 'Friends'
          },
          templateUrl: 'templates/task.html',
          controller: 'AddTaskCtrl'
      })
    .state('viewTask', {
          url: '/viewTask',
          params: {
            task: 'Tasks'
          },
          cache: false,
          templateUrl: 'templates/viewTask.html',
          controller: 'ViewTaskCtrl'
    })
    .state('editTask', {
        url: '/editTask',
        params: {
            task: 'Tasks'
        },
        cache: false,
          templateUrl: 'templates/editTask.html',
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
    })
      .state('manage-categories', {
          url: '/manage-categories',
          templateUrl: 'templates/manage-categories.html',
          controller: 'ManageCategoriesCtrl'
      })
      .state('manage-notifications', {
          url: '/manage-notifications',
          templateUrl: 'templates/manage-notifications.html',
          controller: 'ManageNotificationsCtrl'
      })
      .state('block', {
          url: '/block',
          templateUrl: 'templates/block-unblock-users.html',
          controller: 'BlockCtrl'
      })
      .state('logout', {
          url: '/logout',
          templateUrl: 'templates/logout.html',
          controller: 'LogoutCtrl'
      })
      .state('login', {
          url: '/login',
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
      })
      .state('setUsername', {
          url: '/setUsername',
          templateUrl: 'templates/setUsername.html',
          controller: 'setUsernameCtrl'
      })
      .state('map', {
          url: '/map',
          params: {
            task: 'Tasks'
          },
          templateUrl: 'templates/map.html',
          controller: 'mapCtrl'
      })
      .state('camera', {
          url: '/camera',
          params: {
              task: 'Tasks'
          },
          templateUrl: 'templates/camera.html',
          controller: 'cameraCtrl'
      })
      .state('selectViewer', {
          url: '/selectViewer',
          cache: false,
          params: {
            task: 'Tasks'
          },
          templateUrl: 'templates/selectViewer.html',
          controller: 'selectViewerCtrl'
      })
      .state('notifDetail', {
          url: '/notifDetail',
          cache: false,
          params: {
            notif: 'Notif'
          },
          templateUrl: 'templates/notifDetail.html',
          controller: 'notifDetailCtrl'
      })
      .state('viewFTask', {
          url: '/viewFTask',
          params: {
            task: 'Tasks'
          },
          templateUrl: 'templates/viewFTask.html',
          controller: 'viewFTaskCtrl'
      });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});

