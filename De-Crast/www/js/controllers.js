//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', [])

.controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
    $scope.name = "De-Crast User";

    $rootScope.task_list = {};
    var listHold = angular.fromJson(localStorage.getItem('task_list'));

    if(listHold != null) {
        $rootScope.task_list = listHold;
    }

    $scope.onClick = function() {
      $state.go('addTask', {});
    };
    $scope.goSettings = function() {
        $state.go('settings', {});
    };
})
//  for some reason, can't inject a factory into addtaskctrl without breaking it
  .controller('AddTaskCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state, TaskFact) {
      $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
          viewData.enableBack = true;
      });
      $scope.pagename = "Add";


     $scope.myFactory = new TaskFact();


  })

  .controller('EditTaskCtrl', function($scope) {
      $scope.pagename = "Edit";

      $scope.editTask = function() {

      }
  })

  .controller('ViewTaskCtrl', function($scope) {
      $scope.pagename = "View";


  })

.controller('FtasksCtrl', function($scope) {
})
  .controller('NotifCtrl', function($scope, $stateParams) {
  })
.controller('FriendsCtrl', function($scope, Friends, $stateParams) {
  $scope.friends = Friends.all();
  $scope.turnStar = function(index){
    //console.log("You turn star");
    document.getElementById("starRate"+index).className = 
      (document.getElementById("starRate"+index).className == "icon ion-ios-star") ? "icon ion-ios-star-outline" : "icon ion-ios-star";
  }
})

  .controller('SettingsCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
      $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
          viewData.enableBack = true;
      });
  });
