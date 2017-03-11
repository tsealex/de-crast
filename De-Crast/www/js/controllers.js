//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', [])

.controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
    $scope.name = "De-Crast User";
    $scope.onClick = function() {
      $state.go('addTask', {});
    };
    $scope.goSettings = function() {
        $state.go('settings', {});
    };
})
  .controller('AddTaskCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
      $scope.pagename = "Add";

  })

  .controller('EditTaskCtrl', function($scope) {
      $scope.pagename = "View";
  })

  .controller('ViewTaskCtrl', function($scope) {})

.controller('FtasksCtrl', function($scope) {
})
  .controller('NotifCtrl', function($scope, $stateParams) {
  })
.controller('FriendsCtrl', function($scope) {
})

  .controller('SettingsCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
  });
