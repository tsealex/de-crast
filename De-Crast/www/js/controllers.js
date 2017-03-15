//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', ['ngOpenFB'])

    .controller('HomeCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopover, $ionicViewSwitcher, $state, Tasks, $stateParams, ngFB, $ionicHistory, $ionicPopup) {
    //$scope.tasks = Tasks.all();
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        
        if(window.localStorage.getItem("login") == null){
            $state.go('login', {});
        }
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        
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

        /*
        Function to transition to adding a task
         */
    $scope.onClick = function () {
        $ionicViewSwitcher.nextDirection('forward');

        $state.go('addTask', {});
    };

    /*
    Transition functions for popover menu
     */
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
            if($scope.taskName == null) {
                $ionicLoading.show({template: 'Please Enter A Task Name', noBackdrop: true, duration: 1000});
            }
            else if($scope.time == null) {
                $ionicLoading.show({template: 'Please Enter A Due Time', noBackdrop: true, duration: 1000});
            }
            else {
                var newTask = $scope.myFactory.addTask($scope.taskName, $scope.descrip, $scope.category, $scope.time, null, null, null);

                $rootScope.task_list[newTask.task_id] = newTask;
                localStorage.setItem('task_list', angular.toJson($rootScope.task_list));

                //update server here

                $ionicLoading.show({template: 'Task Saved!', noBackdrop: true, duration: 1000});
                $ionicViewSwitcher.nextDirection('back');
                $timeout(function () {
                    $state.go('tab.home', {});
                }, 1000);
            }
        };


    })

    .controller('EditTaskCtrl', function ($scope, $rootScope, $stateParams, $ionicViewSwitcher, $state, TaskFact, $ionicLoading) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.task = $stateParams.task;
        $scope.title = "Edit";
        $scope.taskName = $scope.task.task_name;
        $scope.category = $scope.task.task_category;
        $scope.descrip = $scope.task.task_descrip;
        $scope.myFactory = new TaskFact();

        $scope.editTask = function () {

            if($scope.taskName == null) {
                $ionicLoading.show({template: 'Please Enter A Task Name', noBackdrop: true, duration: 1000});
            }
            else {
              var tempTask = $scope.myFactory.editTask($scope.task, $scope.taskName, $scope.descrip, $scope.category);
              // $rootScope.task_list[tempTask.id] = tempTask;

                localStorage.setItem('task_list', angular.toJson($rootScope.task_list));

                //update server here

                $ionicLoading.show({template: 'Task Saved!', noBackdrop: true, duration: 1000});
                $ionicViewSwitcher.nextDirection('back');

                /*
                $timeout(function () {
                    $state.go('tab.home', {});
                }, 1000);*/
                $state.go('tab.home');
            }

        }
    })

    .controller('ViewTaskCtrl', function ($scope, $state, $stateParams, $ionicViewSwitcher) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.task = $stateParams.task;
        $scope.title = "View";


        $scope.onSubmit = function(task) {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('editTask', {task: task});
        }


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

    .controller('LoginCtrl', function ($scope, $state, $ionicModal, $timeout, ngFB, $window, $ionicHistory, $http) {
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
                                console.log(JSON.stringify(user));
                                
                                /* TEST 1
                                var http = new XMLHttpRequest();
                                var url = 'http://alext.se:8000/auth/';
                                var facebookId = user.id; 
                                var facebookToken = "RANDOM-STRING";
                                var params = "facebookId=" + facebookId + "&facebookToken=" + facebookToken;
                                http.open("POST", url, true);

                                //Send the proper header information along with the request
                                http.setRequestHeader("Content-type", "application/json");
                                http.setRequestHeader("Access-Control-Allow-Origin", "localhost:8100");

                                http.onreadystatechange = function() {//Call a function when the state changes.
                                    if(http.readyState == 4 && http.status == 200) {
                                        alert(http.responseText);
                                    }
                                }
                                http.send(params);*/ 
                                
                                /* TEST 2
                                var obj = {
                                    method: "POST",
                                    path: "",
                                    params: {
                                        facebookId: user.id,
                                        facebookToken:"RANDOM-STRING"}
                                    };

                                createRequest(obj);*/
                                
                                var headers = {
                                    'Access-Control-Allow-Origin' : '*',
                                    'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Access-Control-Allow-Credentials': 'true'
                                };
                                $http({
                                    method: "POST",
                                    headers: headers,
                                    url: 'http://alext.se:8000/auth/',
                                    data: {
                                        facebookId: user.id,
                                        facebookToken:"RANDOM-STRING"}
                                    })
                                        
                                    .success(function(data,status,headers,config){
                                        console.log("You got it: " + JSON.stringify(data));
                                        alert("You got it: " + JSON.stringify(data));
                                        }
                                    ).error(function(data){
                                        console.log(JSON.stringify(headers));
                                        alert("You fail");
                                        });


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

