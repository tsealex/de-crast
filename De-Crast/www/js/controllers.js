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

    // function to fetch data from the server
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
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
          viewData.enableBack = true;
      })
      $scope.pagename = "Edit";

      $scope.editTask = function() {

      }
  })

  .controller('ViewTaskCtrl', function($scope, $state, $stateParams) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
          viewData.enableBack = true;
      })
    $scope.task = $stateParams.task;
    $scope.pagename = "View";
  })

.controller('FtasksCtrl', function($scope, Ftasks) {
    $scope.ftasks = Ftasks.all();
})
  .controller('NotifCtrl', function($scope, $stateParams, Notifications) {
      $scope.notifications = Notifications.all();
  })
.controller('FriendsCtrl', function($scope, Friends, $stateParams) {
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
