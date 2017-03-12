//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', [])

.controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state, Tasks, $stateParams) {
    $scope.tasks = Tasks.all();
    $scope.name = "De-Crast User";
    
    $scope.goDetail = function(task){
      //$stateParams.$state.go('viewTask', {});
      $state.go('viewTask', {task: task});
      //console.log(task);
    }
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

  .controller('ViewTaskCtrl', function($scope, $state, $stateParams) {
    //console.log($state.params.task);
    $scope.task = $stateParams.task;

  })

.controller('FtasksCtrl', function($scope) {
})
  .controller('NotifCtrl', function($scope, $stateParams) {
  })
.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
  $scope.$on("$ionicView.afterEnter", function(){
        for(var i=0; i < $scope.friends.length; i++){
          $scope.currentFriend = Friends.get(i);
          if($scope.currentFriend.star == 'on'){
            console.log("star on");
            document.getElementById("starRate"+i).className = "icon ion-ios-star";
          }
            
        }
    });
  $scope.setStar = function(friends){
    
  }
  $scope.turnStar = function(index){
    //console.log("You turn star");
    document.getElementById("starRate"+index).className = 
      (document.getElementById("starRate"+index).className == "icon ion-ios-star") ? "icon ion-ios-star-outline" : "icon ion-ios-star";
  }
})

  .controller('SettingsCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {
  });
