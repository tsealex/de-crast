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
.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
  $scope.turnStar = function(index){
    //console.log("You turn star");
    document.getElementById("starRate"+index).className = 
      (document.getElementById("starRate"+index).className == "icon ion-ios-star") ? "icon ion-ios-star-outline" : "icon ion-ios-star";
  }
})

  .controller('SettingsCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
  });
