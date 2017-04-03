//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', ['ngOpenFB'])
    
    .controller('HomeCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopover, $ionicViewSwitcher, $state, Tasks, $stateParams, ngFB, $ionicHistory, $ionicPopup, Server, TaskFact) {
        //$scope.tasks = Tasks.all();
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            
            if(localStorage.getItem('login') == null){
                $state.go('login', {});
            }
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            Server.getUserTasks().then(function(data){
                $scope.populateTasks(data.data);
            });
            $scope.populateCategories();
            
        });
        $scope.name = localStorage.getItem('user');

        // function to fetch data from the server
        $rootScope.task_list = {};
        
        var listHold = angular.fromJson(localStorage.getItem('task_list'));

        if (listHold != null) {
            $rootScope.task_list = listHold;
        }

        /*
        Function to display Task Detail Page
        */
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
                                localStorage.clear();
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
        /*
        Function to display the task list
        */
        $scope.populateTasks = function(response){
            for(i=0;i<response.length;i++){
                
                Server.getTask(response[i].taskId).then(function(data){
                    var myDate = new Date( data.data[0].deadline *1000);
                    //console.log(JSON.stringify(data));
                    var newTask = (new TaskFact()).addTask(data.data[0].taskId, data.data[0].name, data.data[0].description, data.data[0].category, myDate, null, null, null);
                    $rootScope.task_list[data.data[0].taskId] = newTask;
                });
            }
            
            localStorage.setItem('task_list', angular.toJson($rootScope.task_list));
            
        }

        $scope.populateCategories = function(){
            $rootScope.category_list = {};
            Server.getCategory().then(function(data){
                if(data.data.length == 0){
                    //$ionicLoading.show({template: 'No categories found', noBackdrop: true, duration: 2500});
                }
                for(i=0;i<data.data.length;i++){
                    $rootScope.category_list[data.data[i].categoryId] = data.data[i];
                }
                localStorage.setItem('category_list', angular.toJson($rootScope.category_list));
            });
        
        $scope.categoryIdConverName = function(cid){
            var taskCategory = $rootScope.category_list[cid];
            if(taskCategory == null){
                return "None";
            }else{
                return taskCategory.name;
            }
            
        }
            
        }
    })

    .controller('AddTaskCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state, TaskFact, $timeout, Server) {
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
                /* Add Task to localStorage
                var newTask = $scope.myFactory.addTask($scope.taskName, $scope.descrip, $scope.category, $scope.time, null, null, null);

                $rootScope.task_list[newTask.task_id] = newTask;
                localStorage.setItem('task_list', angular.toJson($rootScope.task_list));
                */
                /*
                Add Task to localStorage and Server
                */
                // convert from readable time to UNIX
                var myDate = new Date($scope.time); 
                var myEpoch = myDate.getTime()/1000.0;
                var mySelector = document.getElementById('category-select');
                var myCategory = mySelector.options[mySelector.selectedIndex].value;
                console.log(myCategory);
                if(myCategory == ""){
                    myCategory = null;
                }
                //console.log(mySelector, myCategory);
                Server.addNewTask($scope.taskName, $scope.descrip, myEpoch, myCategory, 1).then(function(data) {
                    //console.log(JSON.stringify(data));
                });
                $ionicLoading.show({template: 'Task Saved!', noBackdrop: true, duration: 1000});
                $ionicViewSwitcher.nextDirection('back');
                $timeout(function () {
                    $state.go('tab.home', {});
                }, 1000);
            }
        };

    })

    .controller('EditTaskCtrl', function ($scope, $rootScope, $stateParams, $ionicViewSwitcher, $state, TaskFact, $ionicLoading, Server, $ionicPopup) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.task = $stateParams.task;
        $scope.title = "Edit";
        var taskId = $scope.task.task_id;
        $scope.taskName = $scope.task.task_name;
        $scope.category = $scope.task.task_category;
        $scope.descrip = $scope.task.task_descrip;
        // below are used for deadline change
        $scope.myFactory = new TaskFact();
        var myDate = new Date($scope.task.task_time); 
        var myEpoch = myDate.getTime()/1000.0;

        $scope.editTask = function () {

            if($scope.taskName == null) {
                $ionicLoading.show({template: 'Please Enter A Task Name', noBackdrop: true, duration: 1000});
            }
            else {
                // change within localStorage
                // var tempTask = $scope.myFactory.editTask($scope.task, $scope.taskName, $scope.descrip, $scope.category);
                // $rootScope.task_list[tempTask.id] = tempTask;
                if($scope.time != null){
                    myDate = new Date($scope.time); 
                    myEpoch = myDate.getTime()/1000.0;
                }
                //console.log($scope.taskName, $scope.descrip, $scope.task.task_time, myDate, myEpoch, taskId);
                Server.eidtTask(taskId, $scope.taskName, $scope.descrip, $scope.category).then(function(data){
                    // TODO
                    console.log(JSON.stringify(data));
                });
                //localStorage.setItem('task_list', angular.toJson($rootScope.task_list));

                //update server here

                $ionicLoading.show({template: 'Task Saved!', noBackdrop: true, duration: 1000});
                $ionicViewSwitcher.nextDirection('back');

                
                /*$timeout(function () {
                    $state.go('tab.home', {});
                }, 1000);*/
                $state.go('tab.home');
            }

        }
        $scope.editDeadline = function(){
            console.log('click');
            var editDeadlinePopup = $ionicPopup.confirm({
                title: 'Edit Deadline',
                template: 'You need viewer\'s permission to edit the deadline and a notification of deadline edit will be sent automatically. Do you want to continue?'
            });

            editDeadlinePopup.then(function(res) {
                if (res) {
                    document.getElementById('time-textarea').style.display = "none";
                    document.getElementById('time-input').style.display = "block";
// TODO: send notification
// how to indicate the deadline is under pending: set the mark?
                    console.log("need send notification function");
                } else {
                    console.log('canecel');
                }
            });
        }
    })

    .controller('ViewTaskCtrl', function ($scope, $state, $stateParams, $ionicViewSwitcher, $ionicPopup, $rootScope) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
        $scope.task = $stateParams.task;
        $scope.title = "View";


        $scope.onSubmit = function(task) {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('editTask', {task: task});
        }
        
        $scope.onComplete = function(){
            var evidenceType = $ionicPopup.show({
                template: '<img >'
            });
        }
        $rootScope.category_list = angular.fromJson(localStorage.getItem('category_list'));
    })

    .controller('FtasksCtrl', function ($scope, Ftasks, $ionicLoading) {
        $scope.ftasks = Ftasks.all();
        //$ionicLoading.show({template: 'No friends\' Tasks found', noBackdrop: true, duration: 2500});
    })
    .controller('NotifCtrl', function ($scope, $stateParams, Notifications) {
        $scope.notifications = Notifications.all();
    })
    .controller('FriendsCtrl', function ($scope, Friends, $stateParams, $rootScope, ngFB, Server, $ionicLoading) {
        
        //$scope.friends = Friends.all();
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.fetchFBfriends();
        });
        $scope.turnStar = function (index) {
            //console.log("You turn star");
            var star = "icon ion-ios-star";
            var starOutline = "icon ion-ios-star-outline";
            var starStatus = document.getElementById("starRate" + index).className;
            if(starStatus == star){
                document.getElementById("starRate" + index).className = starOutline;
            }
            if(starStatus == starOutline){
                document.getElementById("starRate" + index).className = star;
            }
        }

        $scope.fetchFBfriends = function(){
            // prepare friends container
            $rootScope.friend_list = {};
            
            // FB get friends who is also using the app
            ngFB.api({
                path: '/me/friends',
                params: {}
            }).then(
                function (list) {
                    if(list.data.length == 0){
                        $ionicLoading.show({template: 'Cannot find FB friends using the app', noBackdrop: true, duration: 2500});
                    }
                    
                    for(i=0;i<list.data.length;i++){
                        var friendId = list.data[i].id;
                        var friendName = list.data[i].name;
                        // TODO: api call to fetch De-Crast userId and username using FBId

                        // currentId and name is facebookId and name, later need to inject De-Crast userId
                        // default status as normal
                        var newFriend = (new Friends()).addFriend(friendId, friendName, 'normal');
                        $rootScope.friend_list[friendId] = newFriend;
                    }
                    localStorage.setItem('friend_list', angular.toJson($rootScope.friend_list));
                },
                function (error) {
                    alert('Facebook error: ' + error.error_description);
                });

            // populate view
            var friendList = angular.fromJson(localStorage.getItem('friend_list'));
            if(friendList != null){
                $rootScope.friend_list = friendList;
            }
        }
    })

    .controller('SettingsCtrl', function ($rootScope, $scope, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state) {

        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });
    })
    
    .controller('LogoutCtrl', function ($scope,$ionicHistory,$state) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        });

    })
    .controller('ManageCategoriesCtrl', function ($scope, $state, $rootScope, Categories, Server, $ionicLoading) {
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
            // populate the category list
            $rootScope.category_list = {};
            
            var categoryHold = angular.fromJson(localStorage.getItem('category_list'));
            console.log(localStorage.getItem('category_list'));
            if (categoryHold != null) {
                $rootScope.category_list = categoryHold;
            }
            
        })
        
        $scope.addCategory = function(name){
            Server.addCategory(name).then(function(data){
                var newCategory = (new Categories()).addCategory(data.data.categoryId, name);
                $rootScope.category_list[data.data.categoryId] = newCategory;
            });
        }
        
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

    .controller('LoginCtrl', function ($scope, $state, $ionicModal, $timeout, ngFB, $ionicHistory, $http, ApiEndpoint, Server, $ionicPopup, $rootScope, $ionicLoading) {
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
            ngFB.login({scope: 'email,user_posts, publish_actions, user_friends'}).then(
                function (response) {
                    if (response.status === 'connected') {
                        localStorage.setItem('login', 'true'); 
                        localStorage.setItem('fbAccessToken', response.authResponse.accessToken);
                        
                        ngFB.api({
                            path: '/me',
                            params: {fields: 'id,name'}
                        }).then(
                            function (user) {
                                localStorage.setItem('user', user.name);
                                $rootScope.userFBId = user.id;
                                console.log(JSON.stringify(user));
                                var userId; // user's De-Crast Id
                                var accessToken;
                                // user facebookId to login user
                                Server.loginUser(user.id).then(function(data) {
                                    console.log(JSON.stringify(data));
                                    userId = data.data.userId;
                                    accessToken = data.data.accessToken;
                                    console.log("test response username\n", JSON.stringify(data.data.username));
                                    localStorage.setItem('userId', userId);
                                    localStorage.setItem('accessToken', accessToken);
                                    if(data.data.username != null){
                                        console.log(data.data.username);
                                        localStorage.setItem('user', data.data.username);
                                        $state.go('tab.home');
                                    }else{
                                        $state.go('tab.home');
                                        //$state.go('setUsername');
                                    }
                                });
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
    })
    .controller('setUsernameCtrl', function ($state, $ionicViewSwitcher, $scope, $ionicHistory, Server) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();
            console.log()
        }
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            $scope.username = localStorage.getItem('user');
            
        });
        $scope.setUsername = function(){
            $scope.username = document.getElementById('DCname').value;
            console.log($scope.username);
            Server.changeUsername($scope.username).then(function(data) {
                console.log(JSON.stringify(data));
                localStorage.setItem('user', $scope.username);
                $state.go('tab.home');
            });
        }
    })

/* localStorage List:
"userId", decrastId
"userFBId", FBId
"login", true/false
'fbAccessToken'
"user", username, default FB name, specify on De-Crast name
"task_list"
"friend_list"
*/