//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', ['ngOpenFB'])

    .controller('HomeCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopover, $ionicViewSwitcher, $state, Tasks, $stateParams, ngFB, $ionicHistory, $ionicPopup) {
    //$scope.tasks = Tasks.all();
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        
        if(window.localStorage.getItem("login") == null){
            $state.go('login', {});
        }
        
    });
    
    $scope.name = window.localStorage.getItem("user");

    // function to fetch data from the server
    $rootScope.task_list = {};

    var listHold = angular.fromJson(localStorage.getItem('task_list'));

    if (listHold != null) {
        $rootScope.task_list = listHold;
    }

    $scope.goDetail = function (task) {
        //$stateParams.$state.go('viewTask', {});
        $ionicViewSwitcher.nextDirection('forward');
        $state.go('viewTask', {task: task});
        //console.log(task);
    };




    $scope.onClick = function () {
        $ionicViewSwitcher.nextDirection('forward');

        $state.go('addTask', {});
    };

    $scope.goBlock = function() {
        $ionicViewSwitcher.nextDirection('forward');
        $state.go('block', {});
        $scope.popover.hide();
    };
        $scope.goNotif = function() {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('manage-notifications', {});
            $scope.popover.hide();
        };
        $scope.goLogout = function() {
            $scope.popover.hide();
            //$state.go('logout', {});
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are You Sure to Quit?'
            });
            confirmPopup.then(function(res) {
            if(res) {
                    ngFB.logout().then(
                        function (response) { 
                                console.log('Facebook logout succeeded');
                                $scope.ignoreDirty = true; //Prevent loop
                                window.localStorage.clear();
                                $ionicHistory.clearCache();
                                $ionicHistory.clearHistory();
                                $state.go('login'); 
                            
                        });
            } else {
                console.log('You stay');
            }
            });

            //$ionicViewSwitcher.nextDirection('forward');
            
        };
        $scope.goCategories = function() {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('manage-categories', {});
            $scope.popover.hide();
        };



    //Settings popover
        $ionicPopover.fromTemplateUrl('templates/settings.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        // Execute action on hidden popover
        $scope.$on('popover.hidden', function() {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            // Execute action
        });
})

    .controller('AddTaskCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state, TaskFact, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.title = "Add";


        $scope.myFactory = new TaskFact();

        $scope.onSubmit = function() {

           var newTask = $scope.myFactory.addTask($scope.taskName, $scope.descrip, $scope.category, $scope.time, null, null, null);

           $rootScope.task_list[newTask.task_id] = newTask;
           localStorage.setItem('task_list', angular.toJson($rootScope.task_list));

           //update server here

            $ionicLoading.show({ template: 'Task Saved!', noBackdrop: true, duration: 1000 });
            $ionicViewSwitcher.nextDirection('back');
            $timeout(function() {
                $state.go('tab.home', {});
            }, 1000);

        };


    })

    .controller('EditTaskCtrl', function ($scope) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.title = "Edit";

        $scope.editTask = function () {

        }
    })

    .controller('ViewTaskCtrl', function ($scope, $state, $stateParams) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.task = $stateParams.task;
        $scope.title = "View";
    })

    .controller('FtasksCtrl', function ($scope, Ftasks) {
        $scope.ftasks = Ftasks.all();
    })
    .controller('NotifCtrl', function ($scope, $stateParams, Notifications) {
        $scope.notifications = Notifications.all();
    })
    .controller('FriendsCtrl', function ($scope, Friends, $stateParams) {
        $scope.friends = Friends.all();
        $scope.$on("$ionicView.afterEnter", function () {
            for (var i = 0; i < $scope.friends.length; i++) {
                $scope.currentFriend = Friends.get(i);
                if ($scope.currentFriend.star == 'on') {
                    console.log("star on");
                    document.getElementById("starRate" + i).className = "icon ion-ios-star";
                }

            }
        });
        $scope.turnStar = function (index) {
            //console.log("You turn star");
            var star = "icon ion-ios-star";
            var starOutline = "icon ion-ios-star-outline";
            var starStatus = document.getElementById("starRate" + index).className;
            if(starStatus == star){
                document.getElementById("starRate" + index).className = starOutline;
                //console.log("this is a star");
            }
            if(starStatus == starOutline){
                document.getElementById("starRate" + index).className = star;
                //console.log("this is a outline");
            }
            //console.log("click star");
            /*
            document.getElementById("starRate" + index).className =
                (document.getElementById("starRate" + index).className == "icon ion-ios-star") ? "" : "icon ion-ios-star";
                */

        }
    })

    .controller('SettingsCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {

        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
    })
/*
    .controller('MainCtrl', function($scope, $ionicPopover) {

        // // .fromTemplate() method
        // var template = '<ion-popover-view><ion-header-bar><h1 class="title">My Popover Title</h1></ion-header-bar><ion-contentHello!</ion-content></ion-popover-view>';
        //
        // $scope.popover = $ionicPopover.fromTemplate(template, {
        //     scope: $scope
        // });

        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('templates/settings.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        // Execute action on hidden popover
        $scope.$on('popover.hidden', function() {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            // Execute action
        });
    })
    */
    
    .controller('LogoutCtrl', function ($scope,$ionicHistory,$state,$window) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });

    })
    .controller('ManageCategoriesCtrl', function ($scope, $state) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        })

    })
    .controller('ManageNotificationsCtrl', function ($scope, $state) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        })

    })
    .controller('BlockCtrl', function ($scope, $state) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        })    

    })

    .controller('LoginCtrl', function ($scope, $state, $ionicModal, $timeout, ngFB, $window, $ionicHistory) {
        /*
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        })
        */ 
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
        });
        
        $scope.fbLogin = function () {
            var runningInCordova = false;
            document.addEventListener("deviceready", function () {
                var runningInCordova = true;
            }, false);
            ngFB.login({scope: 'email,user_posts,publish_actions'}).then(
                function (response) {
                    if (response.status === 'connected') {
                        window.localStorage.setItem("login", "true"); 
                        
                        ngFB.api({
                            path: '/me',
                            params: {fields: 'id,name'}
                        }).then(
                            function (user) {
                                //$scope.user = user;
                                window.localStorage.setItem("user", user.name);
                                //alert(user.name);
                                $state.go('tab.home', {});
                            },
                            function (error) {
                                alert('Facebook error: ' + error.error_description);
                            });

                        console.log('Facebook login succeeded');
                        if (runningInCordova) {
                            $scope.closeLogin();
                        }
                    } else {
                        alert('Facebook login failed');
                    }
                });
            
        };
    })

    .controller('BackCtrl', function ($state, $ionicViewSwitcher, $scope, $ionicHistory) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();

        }

    });

