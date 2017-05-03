//Home of controllers. Most of our logic will go here.
angular.module('decrast.controllers', ['ngOpenFB'])

    .controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicPopover,
        $ionicViewSwitcher, $state, Tasks, $stateParams, ngFB, $ionicHistory, $ionicPopup, Server,
        TaskFact, Friends, Notif, Storage, Categories, Utils, View) {
        //$scope.tasks = Tasks.all();
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            console.log("this is login: " + localStorage.getItem('login'))
            if (localStorage.getItem('login') == null) {
                //localStorage.clear();
                $state.go('login', {});
            } else {
                ngFB.getLoginStatus().then(function(result) {
                    console.log(result);
                    console.log("result: " + result.status);
                    if (result.status == "connected") {
                        localStorage.setItem('fbAccessToken', result.authResponse.accessToken);
                        $scope.fetchFBfriends();
                    } else { // if status is connected, fetch friends
                        console.log("result inside: " + result.status);
                        // localStorage.clear();
                        $ionicLoading.show({
                            template: 'Please login',
                            noBackdrop: true,
                            duration: 1000
                        });
                        $state.go('login');
                    }
                });
            }
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();

            // move global
            View.getUserTasks();
            View.getViewTask();
            View.populateNotification();
        });
        $scope.$on('$ionicView.enter', function(event, viewData) {
            // This event will fire, whether it was the first load or a cached view.
            $rootScope.task_list = Storage.getOwnedTaskList(true);
            $rootScope.viewTask_list = Storage.getOwnedTaskList(false);
            $rootScope.friend_list = Storage.getUserList();
            $rootScope.notif_list = Storage.getNotifList();
            $rootScope.populateCategories();

        });
        $scope.name = localStorage.getItem('user');
        // console.log(Storage.getUserList());
        // function to fetch data from the server

        if ($rootScope.sorting != null)
            $scope.sorting = $rootScope.sorting;
        else
            $scope.sorting = "";

        $scope.doSorting = function() {
            var elem_type = document.getElementById('sorting-select');
            var sort_type = elem_type.options[elem_type.selectedIndex].value;

            if (sort_type == "Due Date") {
                $scope.sorting = "task_time";
            } else if (sort_type == "Category") {
                $scope.sorting = "task_category";
                console.log("here");
            } else {
                $scope.sorting = "task_name";
            }
            $rootScope.sorting = $scope.sorting;
        };

        $scope.doSorting(); // sort by name by default


        /*
        Function to display Task Detail Page
        */
        $scope.goDetail = function(task) {
            //$stateParams.$state.go('viewTask', {});
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('viewTask', {
                task: task
            });
            //console.log(task);
        };

        /*
        Function to transition to adding a task
        */
        $scope.onClick = function() {
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
                title: 'Are You Sure Want to Quit?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    ngFB.getLoginStatus().then(function(response) {
                        if (response && response.status === 'connected') {
                            ngFB.logout().then(function(response) {});
                        }
                        $scope.ignoreDirty = true; //Prevent loop
                        localStorage.clear();
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();

                        Storage.clearCategoryList();
                        Storage.clearUserList();
                        Storage.clearTaskList();
                        Storage.clearNotifList();
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

        $rootScope.populateCategories = function() {

            Server.getCategory().then(function(data) {
                if (data.data.length == 0) {
                    //$ionicLoading.show({template: 'No categories found', noBackdrop: true, duration: 2500});
                }
                for (i = 0; i < data.data.length; i++) {
                    if (!Storage.existCategory(data.data[i].categoryId)) {
                        var cat = (new Categories()).addCategory(data.data[i].categoryId, data.data[i].name);
                        Storage.addCategory(cat);
                    }
                }
                $rootScope.category_list = Storage.getCategoryList();
                //localStorage.setItem('category_list', angular.toJson($rootScope.category_list));
            });
        };

        $scope.categoryIdConverName = function(cid) {
            return Storage.getCategoryName(cid);
        };

        $scope.fetchFBfriends = function() {
            var fbToken = localStorage.getItem('fbAccessToken');
            console.log(fbToken);
            // FB get friends who is also using the app
            ngFB.api({
                //path: '/' + localStorage.getItem('userFBId') + '/friends',
                path: '/me/friends',
                params: {},
                access_token: fbToken
            }).then(
                function(list) {
                    if (list.data.length == 0) {
                        $ionicLoading.show({
                            template: 'Cannot find FB friends using the app',
                            noBackdrop: true,
                            duration: 2500
                        });
                    } else {
                        if (list.data.length <= Storage.getUserListSize()) {
                            // quick fix
                            // we don't need to re-fetch user list from the server, if
                            // we already have it cached
                            // assumption: # of user's friends never changes
                            return;
                        }
                        var friendFbId = list.data[0].id;
                        var friendFbName = [list.data[0].name];
                        for (i = 1; i < list.data.length; i++) {
                            friendFbId += '&' + list.data[i].id;
                            friendFbName.push(list.data[i].name);
                            View.getUserByFbId(friendFbId, friendFbName);
                        }
                        // console.log("check list: ", friendFbId, JSON.stringify(friendFbName));
                    }
                },
                function(error) {
                    $ionicLoading.show({
                        template: 'Please login',
                        noBackdrop: true,
                        duration: 1000
                    });
                    $state.go('login');
                }
            );
        };

    })

    .controller('AddTaskCtrl', function($rootScope, $stateParams, $scope, $ionicPlatform,
        $cordovaLocalNotification, $ionicModal, $ionicLoading, $ionicViewSwitcher, $state,
        TaskFact, $timeout, Server, EvidenceTypes, $ionicPlatform) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });
        var myCategory;
        var mySelector;
        var evidenceType;
        $scope.title = "Add";
        $scope.evidenceTypes = EvidenceTypes.all();
        $scope.myFactory = new TaskFact();
        $scope.consequence = "";
        $scope.con_bool = false;
        $scope.dis = "disabled";
        $scope.viewerObject = {}; // used to hold viewer

        $scope.$on('$ionicView.afterEnter', function(event, viewData) {
            // set select viewer if exist
            $scope.viewerObject = angular.fromJson(localStorage.getItem('selectedViewer'));
            if ($scope.viewerObject) {
                $scope.viewer = $scope.viewerObject.friend_name;
                localStorage.removeItem('selectedViewer');
            }

            // fetch exist task draft
            $rootScope.task = angular.fromJson(localStorage.getItem('currentTask'));
            // holder for exist task draft
            if ($rootScope.task) {
                $scope.taskName = $rootScope.task.task_name;
                $scope.descrip = $rootScope.task.task_descrip;
                $scope.time = $rootScope.task.task_time;
                $scope.category = $rootScope.task.task_category;
                $scope.evidenceType = $rootScope.task.task_evidenceType;
                //document.getElementById('time-textarea').value = new Date($scope.time);
                if ($scope.category == "") {
                    document.getElementById('category-select').value = "";
                } else {
                    document.getElementById('category-select').value = $scope.category;
                }

                if ($scope.evidenceType != null) {
                    document.getElementById('evidenceType-select').value = $scope.evidenceType;
                }
                localStorage.removeItem('currentTask');
            }

        });


        $scope.addText = function() {

            document.getElementById("consequence-textarea").disabled = !($scope.con_bool);
            console.log($scope.con_bool);

        };



        $scope.onSubmit = function() {
            if ($scope.taskName == null) {
                $ionicLoading.show({
                    template: 'Please Enter A Task Name',
                    noBackdrop: true,
                    duration: 1000
                });
            } else if ($scope.time == null) {
                $ionicLoading.show({
                    template: 'Please Enter A Due Time',
                    noBackdrop: true,
                    duration: 1000
                });
            } else {
                // check evidenceType
                evidenceType = document.getElementById('evidenceType-select').value;
                if (evidenceType == null || evidenceType == "") {
                    $ionicLoading.show({
                        template: 'Please Select An Evidence Type',
                        noBackdrop: true,
                        duration: 1000
                    });
                } else {
                    // convert from readable time to UNIX
                    var myDate = new Date($scope.time);
                    var timezone = new Date().getTimezoneOffset();
                    var myEpoch = (myDate.getTime() + timezone * 60000) / 1000.0;

                    mySelector = document.getElementById('category-select');
                    myCategory = mySelector.options[mySelector.selectedIndex].value;

                    //console.log("show me the category Id: ", myCategory);
                    Server.addNewTask($scope.taskName, $scope.descrip, myEpoch, myCategory,
                        parseInt(evidenceType)).then(function(data) {
                        console.log(JSON.stringify(data));
                        if (data.data.detail == "deadline")
                            $ionicLoading.show({
                                template: 'Invalid deadline',
                                noBackdrop: true,
                                duration: 1000
                            });
                        else if (data.status != 200) {
                            var errMsg = data.data.errorMsg + ": " + data.data.detail;
                            $ionicLoading.show({
                                template: errMsg,
                                noBackdrop: true,
                                duration: 1000
                            });
                        } else {

                            if ($scope.viewerObject) {
                                $scope.sendNotification($scope.viewerObject.friend_uid, data.data.taskId);
                            }

                            if ($scope.con_bool) {
                                console.log("submit consequence");
                                Server.submitConsequence(data.data.taskId, $scope.consequence, null).then(function(result) {
                                    console.log(JSON.stringify(result));

                                });
                            }
                            $ionicLoading.show({
                                template: 'Task Saved!',
                                noBackdrop: true,
                                duration: 1000
                            });

                            if (window.cordova) {
                                // when run on device, test the platform and call FCM

                                $ionicPlatform.ready(function() {
                                    // var now = new Date().getTime();
                                    // var _3SecondsFromNow = new Date(now + 3 * 1000);
                                    //var ddl = new Date(myEpoch*1000);
                                    var usertime = new Date($scope.time);
                                    var timezone = new Date().getTimezoneOffset();
                                    var ddl = new Date(usertime.getTime() + timezone * 60000);
                                    $cordovaLocalNotification.schedule({ // This part of code may not work in browser
                                        id: 10,
                                        title: $scope.taskName,
                                        text: 'This task has expired :(',
                                        at: ddl,
                                        data: {
                                            taskId: data.data.taskId
                                        }
                                    }).then(function(result) {
                                        console.log(ddl.getTime + 'a local notification is triggered' + myEpoch * 1000);
                                    });
                                });
                            } else {
                                console.log("Run on browser, cordovaLocalNotification is disabled");
                            }

                            $ionicViewSwitcher.nextDirection('back');
                            $state.go('tab.home', {});
                        }
                    });
                }
            }
        };

        $rootScope.populateViewers = function() {
            // get all the setting
            evidenceType = document.getElementById('evidenceType-select').value;
            mySelector = document.getElementById('category-select');
            myCategory = mySelector.options[mySelector.selectedIndex].value;
            // create temporarily task object
            var newTask = $scope.myFactory.addTask(null, $scope.taskName, $scope.descrip, myCategory,
                $scope.time, null, null, parseInt(evidenceType));

            localStorage.setItem('currentTask', angular.toJson(newTask));
            // we still need viewer to be posted, otherwise cannot link the task and the viewer            
            $state.go('selectViewer', {
                task: newTask
            });
        };

        $scope.sendNotification = function(recipientId, taskId) {
            var type = 5; // Viewer invite
            console.log(type, recipientId, taskId);
            Server.sendNotification(type, recipientId, taskId).then(function(data) {});
        };

    })

    .controller('EditTaskCtrl', function($scope, $rootScope, $stateParams, $ionicViewSwitcher,
        $state, TaskFact, $ionicLoading, Server, $ionicPopup, EvidenceTypes, Storage) {
        var taskId, tmpTask;
        var myDate;
        var myEpoch;
        var changeTime = false;

        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
            $scope.task = $stateParams.task;
            $scope.title = "Edit";
            taskId = $scope.task.task_id;
            $scope.taskName = $scope.task.task_name;
            $scope.category = $scope.task.task_category;
            if ($scope.task.task_evidenceType != null)
                $scope.evidenceTypeName = EvidenceTypes.get($scope.task.task_evidenceType).name;
            $scope.descrip = $scope.task.task_descrip;
            $scope.taskPartner = $scope.task.task_partner;

            if ($scope.task.task_partner != null)
                $scope.viewer = $scope.task.task_partner.friend_name;

            // below are used for deadline change
            $scope.myFactory = new TaskFact();
            myDate = new Date($scope.task.task_time); // $scope.task.task_time is Z (UTC) time
            // myDate.toLocaleString(); // this is the original task deadline translated to GMT
            // add 5 hr to make the time match, may cause bug
            myEpoch = myDate.getTime() / 1000.0 + 60.0 * 60.0 * 5.0; // add 5 hr to UTC
            // myDate = new Date(myEpoch*1000.0); // convert from epoch, get UTC back
            // myDate.toLocaleString(); // get GMT
        });

        $scope.$on('$ionicView.afterEnter', function(event, viewData) {
            if ($scope.category != null) {
                document.getElementById('category-select-edit').value = $scope.category;
            }
        });


        $scope.editTask = function() {
            $scope.category = document.getElementById('category-select-edit').value;
            if ($scope.taskName == null) {
                $ionicLoading.show({
                    template: 'Please Enter A Task Name',
                    noBackdrop: true,
                    duration: 1000
                });
            } else {
                // change within localStorage
                // var tempTask = $scope.myFactory.editTask($scope.task, $scope.taskName, $scope.descrip, $scope.category);
                // $rootScope.task_list[tempTask.id] = tempTask;
                // $scope.time is the new task deadline
                // myEpoch is the old task deadline, newEpoch is the new task deadline
                var tmpTask = angular.fromJson(angular.toJson($scope.task)); // deep clone the task
                tmpTask.task_name = $scope.taskName;
                tmpTask.task_descrip = $scope.descrip;
                tmpTask.task_category = $scope.category;
                Storage.cacheTaskChanges(tmpTask);

                Server.editTask(taskId, $scope.taskName, $scope.descrip, $scope.category).then(function(data) {
                    var msg = 'Task Saved.';
                    if (data.status == 200) {
                        Storage.applyTaskChanges(data.data.taskId);
                        if (changeTime && $scope.time != undefined) {
                            var deadline = $scope.time.getTime() / 1000.0; // TODO: bug $scope.time is undefined, please check
                            Server.sendNotificationThree(3, deadline, taskId).then((function(id, deadline) {
                                return function(data) {
                                    var msg = 'Task Saved.';

                                    if (data.status != 200)
                                        msg = msg + ' Notification not sent due to invalid deadline / no viewer';

                                    $ionicLoading.show({
                                        template: msg,
                                        noBackdrop: true,
                                        duration: 1000
                                    });
                                    task = Storage.getTask(id);
                                    task.purposed_deadline = deadline;
                                    Storage.saveTask(task);
                                    $ionicViewSwitcher.nextDirection('back');
                                    $state.go('tab.home');
                                }
                            })(data.data.taskId, deadline));
                            return;
                        }
                    } else
                        msg = data.data.errorMsg + ": " + data.data.detail;

                    $ionicLoading.show({
                        template: msg,
                        noBackdrop: true,
                        duration: 1000
                    });
                    $ionicViewSwitcher.nextDirection('back');
                    $state.go('tab.home');
                });
            }

        };

        $scope.editDeadline = function() {
            console.log('click');
            var editDeadlinePopup = $ionicPopup.confirm({
                title: 'Edit Deadline',
                template: 'You need viewer\'s permission to edit the deadline ' +
                    'and a notification of deadline edit will be sent automatically.' +
                    'Do you want to continue?'
            });

            editDeadlinePopup.then(function(res) {
                if (res) {
                    document.getElementById('time-textarea').style.display = "none";
                    document.getElementById('time-input').style.display = "block";
                    changeTime = true;
                    // TODO: 
                    // how to indicate the deadline is under pending: set the mark?
                    console.log("need send notification function");
                } else {
                    console.log('canecel');
                }
            });
        };
    })

    .controller('ViewTaskCtrl', function($scope, $state, $stateParams, $ionicViewSwitcher, $ionicPopup,
        $rootScope, EvidenceTypes, Server, Storage) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
            $scope.task = $stateParams.task;
            $scope.title = "View";
            if ($scope.task.task_category == null || $scope.task.task_category == '') {
                document.getElementById('category-textarea').value = 'None';
            }
            $scope.evidenceType = EvidenceTypes.get($scope.task.task_evidenceType);
            $scope.evidenceTypeName = $scope.evidenceType.name;
            console.log("check partner: ", $scope.task.task_partner);
            if ($scope.task.task_partner != null) {
                $scope.viewer = $scope.task.task_partner.friend_name;
            } else {
                $scope.viewer = "No Viewer";
            }
        });


        $scope.onSubmit = function(task) {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('editTask', {
                task: task
            });
        };

        $scope.onComplete = function() {
            if ($scope.evidenceType.evidenceTypeId == 0) {
                $state.go('camera', {
                    task: $scope.task
                });
            }
            if ($scope.evidenceType.evidenceTypeId == 1) {
                $state.go('map', {
                    task: $scope.task
                });
            }
            // Honor Type
            if ($scope.evidenceType.evidenceTypeId == 2) {
                $scope.decisionPopup();
            }
        };

        $scope.decisionPopup = function() {
            var text = 'Have you actually done what you said you would?';
            var title = 'Confirm completion';

            var myPopup = $ionicPopup.show({
                template: text,
                title: title,
                scope: $scope,

                buttons: [{
                    text: 'Negatory',
                    onTap: function(e) {
                        console.log("Well then get to it!");
                    }
                }, {
                    text: 'Of course!',
                    type: 'button-positive',
                    onTap: function(e) {
                        console.log("You better not be lying ...");

                        Server.completeTask($scope.task.task_id).then((function(id) {
                            return function(data) {
                                Storage.removeTask(id);
                                $state.go('tab.home');
                            }
                        })($scope.task.task_id));
                    }
                }]
            });

            myPopup.then(function(res) {});
        };
    })

    .controller('FtasksCtrl', function($scope, Ftasks, $ionicLoading, $state, $rootScope, Storage) {
        //$ionicLoading.show({template: 'No friends\' Tasks found', noBackdrop: true, duration: 2500});
        $rootScope.viewTask_list = Storage.getOwnedTaskList(false);


        $scope.goDetail = function(task) {
            $state.go('viewFTask', {
                task: task
            });
        }

        if ($rootScope.sorting != null)
            $scope.sorting = $rootScope.sorting;
        else
            $scope.sorting = "";



        $scope.doSorting = function() {
            var elem_type = document.getElementById('sorting-select');
            var sort_type = elem_type.options[elem_type.selectedIndex].value;

            console.log(sort_type);

            if (sort_type == "Due Date") {
                $scope.sorting = "task_time";
            } else if (sort_type == "Category") {
                $scope.sorting = "task_category";
                console.log("here");
            } else {
                $scope.sorting = "task_name";
            }
            $rootScope.sorting = $scope.sorting;
        };
    })
    .controller('NotifCtrl', function($scope, $stateParams, $state, $ionicPopup, $ionicLoading,
        Server, Storage, $rootScope, Utils, View) {
        // console.log($rootScope.notif_list);

        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            if ($stateParams.notification != null) {
                console.log('Launching notif list with: ' + JSON.stringify($stateParams.notification));
            } else {
                console.log("Launching notification list without a pre-determined notification.");
            }
        });
        // below 2 state: at enter state check for new notif, at after enter populate the view
        $scope.$on('$ionicView.enter', function(event, viewData) {
            View.populateNotification();
        });
        $scope.$on('$ionicView.afterEnter', function(event, viewData) {
            $rootScope.notif_list = Storage.getNotifList();
        });

        $scope.goNotifDetail = function(currentNotif) {
            var notif = currentNotif;
            var type = notif.notif_type;
            /* type 3: ddl extension
             * type 5: invite
             * type 2: view evidence
             */
            if (type == 2) {
                $state.go('evidenceDetail', {
                    notif: notif
                });
                // TODO: Storage.removeNotif + sendNotificationReead afterwards
            } else if (type == 3 || type == 5) {
                $state.go('notifDetail', {
                    notif: notif
                });
            } else {
                Storage.removeNotif(notif.notif_notificationId);
                Server.sendNotificationRead(notif.notif_notificationId);
            }
        }
        /*
                $scope.decisionPopup = function(notif) {
                    var text = '';
                    var title = '';
                    switch (notif.notif_type) {
                        case (3):
                            text = 'Do you want to permit the deadline extension?';
                            title = 'Permission';
                            break;
                        case (5):
                            text = 'Do you want to view on the task?';
                            title = 'Permission';
                            break;
                        default:
                            break;
                    }
                    var myPopup = $ionicPopup.show({
                        template: text,
                        title: title,
                        scope: $scope,

                        buttons: [{
                            text: 'Decline',
                            onTap: function(e) {
                                $scope.sendNotification(notif, false);
                            }
                        }, {
                            text: 'Accept',
                            type: 'button-positive',
                            onTap: function(e) {
                                // update the task deadline (viewer side)
                                newDeadline = Utils.convertToUTC(parseInt(notif.notif_metadata));
                                Storage.updateTaskDeadline(notif.notif_task, newDeadline);
                                $scope.sendNotification(notif, true);
                            }
                        }]
                    });

                    myPopup.then(function(res) {});
                }*/

        $scope.sendNotification = function(notif, decision) {
            Server.decideOnInvite(notif.notif_notificationId, decision).then((function(nid) {
                return function(data) {
                    if (data.status == 200) {
                        // succeed
                        Storage.removeNotif(nid);
                    } else {
                        $ionicLoading.show({
                            template: data.data.errMsg,
                            noBackdrop: true,
                            duration: 1000
                        });
                    }
                };
            })(notif.notif_notificationId));
        }
    })
    .controller('FriendsCtrl', function($scope, Friends, $stateParams, $rootScope, ngFB,
        Server, Storage, $ionicLoading) {

        //$scope.friends = Friends.all();
        $scope.$on("$ionicView.beforeEnter", function() {
            $rootScope.friend_list = Storage.getUserList();
        });
        $scope.turnStar = function(index) {
            //console.log("You turn star");
            var star = "icon ion-ios-star";
            var starOutline = "icon ion-ios-star-outline";
            var starStatus = document.getElementById("starRate" + index).className;
            if (starStatus == star) {
                document.getElementById("starRate" + index).className = starOutline;
            }
            if (starStatus == starOutline) {
                document.getElementById("starRate" + index).className = star;
            }
        }
    })

    .controller('SettingsCtrl', function($rootScope, $scope, $ionicModal, $ionicLoading,
        $ionicViewSwitcher, $state) {

        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });
    })

    .controller('LogoutCtrl', function($scope, $ionicHistory, $state) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

    })
    .controller('ManageCategoriesCtrl', function($scope, $state, $rootScope, Categories, Server,
        Storage, $ionicLoading) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
            // populate the category list
            $rootScope.category_list = Storage.getCategoryList();
        })

        $scope.addCategory = function(name) {
            Server.addCategory(name).then(function(data) {
                if (data.status == 400) {
                    var errMsg = data.data.errorMsg + ": " + "category";
                    $ionicLoading.show({
                        template: errMsg,
                        noBackdrop: true,
                        duration: 1000
                    });
                } else {
                    var newCategory = (new Categories()).addCategory(data.data.categoryId, data.data.name);
                    Storage.addCategory(newCategory);
                    document.getElementById('categoryName-textarea').value = '';
                }
            });
        }

    })
    .controller('ManageNotificationsCtrl', function($scope, $state) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        })

    })
    .controller('BlockCtrl', function($scope, $state) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        })

    })

    .controller('LoginCtrl', function($scope, $state, $ionicModal, $cordovaLocalNotification,
        $ionicPlatform, $timeout, ngFB, $ionicHistory, $http, ApiEndpoint, Server, $ionicPopup,
        $rootScope, $ionicLoading, $cordovaDevice, $ionicPlatform) {
        /*
        $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
            viewData.enableBack = true;
        })
        */
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
        });

        $scope.fbLogin = function() {
            var runningInCordova = false;
            document.addEventListener("deviceready", function() {
                var runningInCordova = true;
            }, false);
            ngFB.login({
                scope: 'email,user_posts, publish_actions, user_friends'
            }).then(
                function(response) {
                    if (response.status === 'connected') {
                        localStorage.setItem('login', 'true');
                        localStorage.setItem('fbAccessToken', response.authResponse.accessToken);

                        if (window.cordova) {
                            // when run on device, test the platform and call FCM

                            if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
                                FCMPlugin.getToken(
                                    function(token) {
                                        localStorage.setItem('fcmId', token);
                                        Server.updateFcmToken(token);
                                    },
                                    function(err) {
                                        alert('error retrieving FCM token: ' + err);
                                    });
                            }
                        } else {
                            console.log("Run on brower, FCMPlugin is disabled");
                        }

                        ngFB.api({
                            path: '/me',
                            params: {
                                fields: 'id,name'
                            }
                        }).then(
                            function(user) {
                                localStorage.setItem('user', user.name);
                                $rootScope.userFBId = user.id;
                                localStorage.setItem('userFBId', user.id);
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
                                    if (data.data.username != null) {
                                        console.log(data.data.username);
                                        localStorage.setItem('user', data.data.username);
                                        Server.updateFcmToken(localStorage.getItem('fcmId')).then(function(data) {
                                            console.log(JSON.stringify(data));
                                            if (data.data.errorCode == 190) {
                                                alert('Oh no ... FCM errored out')
                                            }
                                        });
                                        $state.go('tab.home');
                                    } else {
                                        $state.go('setUsername');
                                    }
                                });
                            },
                            function(error) {
                                alert('Facebook fetch user info error: ' + error.error_description);
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

    .controller('BackCtrl', function($state, $ionicViewSwitcher, $scope, $ionicHistory) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();

        }
    })
    .controller('setUsernameCtrl', function($state, $ionicViewSwitcher, $scope, $ionicHistory,
        Server, $ionicLoading) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();
            console.log()
        }
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            $scope.username = localStorage.getItem('user');
            $scope.username = $scope.username.toLowerCase();
            $scope.username = $scope.username.replace(" ", "_");
        });
        $scope.setUsername = function() {
            $scope.username = document.getElementById('DCname').value;
            console.log($scope.username);
            if ($scope.checkCharacter($scope.username)) {
                Server.changeUsername($scope.username).then(function(data) {
                    console.log(JSON.stringify(data));
                    if (data.data.errorCode == 190)
                        $ionicLoading.show({
                            template: "username already exists",
                            noBackdrop: true,
                            duration: 2500
                        });
                    else {
                        // may need to be put in the server
                        localStorage.setItem('user', $scope.username);
                        Server.updateFcmToken(localStorage.getItem('fcmId')).then(function(data) {
                            console.log(JSON.stringify(data))
                            if (data.data.errorCode == 190) {
                                $ionicLoading.show({
                                    template: "something with FCM token errored out ...",
                                    noBackdrop: true,
                                    duration: 2500
                                });
                            }
                        });
                        $state.go('tab.home');
                    }
                });
            } else {
                $ionicLoading.show({
                    template: "Only digits, characters and underscores are allowed",
                    noBackdrop: true,
                    duration: 2500
                });
            }

        }

        $scope.checkCharacter = function(username) {
            for (i = 0; i < username.length; i++) {
                console.log(username[i]);
                if (!username[i].match(/[A-Za-z0-9_-]/)) {
                    return false;
                }
            }
            return true;
        }
    })
    .controller('mapCtrl', function($state, $stateParams, $ionicViewSwitcher, $scope, $ionicHistory,
        $cordovaGeolocation, $ionicLoading, Server, Storage, $ionicPlatform) {

        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();
        }
        $scope.task = $stateParams.task;
        $scope.taskId = $scope.task.task_id;
        var latLng;
        $ionicPlatform.ready(function() {
            // add for geolocation not timeout
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location'
            });

            var options = {
                timeout: 10000,
                enableHighAccuracy: true
            };

            if (navigator.geolocation) {

                $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

                    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    var mapOptions = {
                        center: latLng,
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

                    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: latLng
                        });

                        $scope.getAddressFromLatLang(latLng, $scope.map, marker);
                    });
                    $ionicLoading.hide();
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(JSON.stringify(error));
                    $ionicLoading.show({
                        template: "Could not get location, please check your GPS setting and try again",
                        noBackdrop: true,
                        duration: 1000
                    });
                });

                $scope.getAddressFromLatLang = function(latLng, map, marker) {
                    var geocoder = new google.maps.Geocoder();

                    geocoder.geocode({
                        'latLng': latLng
                    }, function(results, status) {
                        //console.log(JSON.stringify(results));
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var infowindow = new google.maps.InfoWindow();
                                infowindow.setOptions({
                                    content: '<div>' + results[1].formatted_address + '</div>',
                                });
                                infowindow.open(map, marker);
                            }
                        } else {
                            alert("error", JSON.stringify(status));
                        }
                    })
                };

            } else {
                // Browser doesn't support Geolocation
                console.log("navigator.geolocation false");
            }
        });



        $scope.confirmGPS = function() {
            var coordinates = '(' + latLng.lat() + ',' + latLng.lng() + ')';
            console.log("Map post coordinates", coordinates);
            // This server is not function correctly            
            Server.submitGPS($scope.taskId, coordinates).then((function(id) {
                return function(data) {
                    if (data.status == 200) {
                        Storage.removeTask(id);
                        $ionicLoading.show({
                            template: 'Task Completed!',
                            noBackdrop: true,
                            duration: 1000
                        });
                    } else {
                        $ionicLoading.show({
                            template: 'submission failed',
                            noBackdrop: true,
                            duration: 1000
                        });
                    }
                    //$ionicHistory.goBack(2);
                    $state.go('tab.home');
                }
            })($scope.taskId));
        }

    })
    .controller('cameraCtrl', function($rootScope, $state, $ionicViewSwitcher, $scope,
        $ionicLoading, $ionicHistory, $cordovaCamera, $stateParams, Server, Storage, Utils) {

        $scope.task = $stateParams.task;
        $scope.taskId = $scope.task.task_id;
        $scope.image = null;
        // TODO: move this function to the global scope, so that other controllers can use this function 
        $rootScope.dataURItoBlob = function(dataURI) {
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++)
                ia[i] = byteString.charCodeAt(i);

            var bb = new Blob([ab], {
                "type": mimeString
            });
            return bb;
        };

        $scope.takePicture = function() {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 500,
                targetHeight: 500,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                //$scope.imgURI = "data:image/jpeg;base64," + imageData;
                $scope.imgURI = "data:image/jpeg;base64," + imageData;
                $scope.imgBlob = $rootScope.dataURItoBlob("data:image/jpeg;base64," + imageData);
                $ionicLoading.show({
                    template: 'Picture taken!',
                    noBackdrop: true,
                    duration: 1000
                });
            }, function(err) {
                // An error occured. Show a message to the user
            });
        };

        //not functioning yet
        $scope.submitPhoto = function() {
            Server.submitPhoto($scope.taskId, $scope.imgBlob).then((function(id) {
                return function(data) {
                    if (data.status == 200) {
                        Storage.removeTask(id);
                        $ionicLoading.show({
                            template: 'Task Completed!',
                            noBackdrop: true,
                            duration: 1000
                        });
                    } else {
                        $ionicLoading.show({
                            template: 'submission failed',
                            noBackdrop: true,
                            duration: 1000
                        });
                    }
                    //$ionicHistory.goBack(2);
                    $state.go('tab.home');
                }
            })($scope.taskId));
            // $state.go('home');

        };
    })
    .controller('selectViewerCtrl', function($stateParams, $rootScope, $state, Storage,
        $ionicViewSwitcher, $scope, $ionicHistory) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            // $ionicHistory.goBack();   
        }

        var selectedViewer;
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            $rootScope.friend_list = Storage.getUserList();
            $scope.task = $stateParams.task;
        });
        $scope.changeViewer = function(viewer) {
            selectedViewer = viewer;
        };
        $scope.data = {
            clientSide: 'ng'
        };
        $scope.confirmViewer = function() {
            localStorage.setItem('selectedViewer', angular.toJson(selectedViewer));
            $ionicHistory.goBack();
        }
    })
    .controller('notifDetailCtrl', function($state, $ionicViewSwitcher, $scope, $ionicHistory,
        $stateParams, Server, $rootScope, TaskFact, Storage, Utils, $filter, $ionicLoading) {
        $scope.onClick = function() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.goBack();
        }
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;

            if ($stateParams.notif != null) {
                $scope.notif = $stateParams.notif;

                if ($scope.notif.notif_type == 5) { // invite
                    $scope.inviteDetail();
                }
                if ($scope.notif.notif_type == 3) {
                    $scope.deadlineChangeDetail();
                }
            }
        });

        $scope.onDecision = function(decision) {
            Server.decideOnInvite($scope.notif.notif_notificationId, decision).then(function(data) {
                if (data.status == 200) {
                    // delete from local when decision sent success
                    Storage.removeNotif($scope.notif.notif_notificationId);
                    $ionicHistory.goBack();
                    if (decision) { // add task to FTask if accept to view
                        if ($scope.notif.notif_type == 5) { // an intive
                            $scope.updateFTask();
                        }
                        if ($scope.notif.notif_type == 3) { // an intive
                            $scope.updateDeadline();
                        }
                    }
                } else {
                    $ionicLoading.show({
                        template: data.errorMsg,
                        noBackdrop: true,
                        duration: 1000
                    });
                }
            });
        }

        $scope.inviteDetail = function() {
            // get task detail to help determine
            Server.getInviteTask($scope.notif.notif_notificationId).then(function(data) {
                if (data.status == 200) { // success
                    var inviteTask = data.data;
                    inviteTask.deadline = Utils.convertToUTC(inviteTask.deadline);
                    // prepare the task so that add to storage when accept viewing
                    $scope.task = (new TaskFact()).addTask(inviteTask.taskId, inviteTask.name,
                        inviteTask.description, null, inviteTask.deadline,
                        $rootScope.friend_list[inviteTask.owner], null, null, false);
                    // dont know evidence type from this endpoint
                } else {
                    $ionicLoading.show({
                        template: data.errorMsg,
                        noBackdrop: true,
                        duration: 1000
                    });
                }
            });
        }

        $scope.deadlineChangeDetail = function() {
            var oldTask = Storage.getTask($scope.notif.notif_task); // this help get the old, which is deadline already in UTC form
            // but user can also edit the task! ( // TODO: Problem? what if the owner change the task to a completely different thing?)

            Server.getTask($scope.notif.notif_task).then(function(taskData) {
                var newTask = (new TaskFact()).addTask(taskData.data[0].taskId, taskData.data[0].name,
                    taskData.data[0].description, taskData.data[0].category, oldTask.task_time,
                    oldTask.task_partner, null, oldTask.task_evidenceType, false);
                $scope.task = newTask;
            });
            var deadline_string = $filter('date')(Utils.convertToUTC($scope.notif.notif_metadata), 'medium', 'UTC');
            // write to the html page
            document.getElementById('new-time-textarea').innerHTML =
                "<div style=\"float: left; width: 100%;\"> \
                <label class=\"item item-input\"> \
                    <textarea disabled type=\"text\" name=\"new-time\" placeholder=\"New Deadline\" style=\"background: transparent; resize: none; \">" + deadline_string + "</textarea> \
                </label> \
            </div>";
        }

        $scope.updateFTask = function() {
            Server.getEvidenceType($scope.task.task_id).then(function(evidence) {
                if (evidence.status == 200) {
                    $scope.task.task_evidenceType = evidence.data.type;
                    Storage.saveTask($scope.task);
                    $rootScope.viewTask_list = Storage.getOwnedTaskList(false);
                } // if not success, task will be added toFTask next time goes to Home
            });
        }

        $scope.updateDeadline = function() {
            Storage.removeTask($scope.notif.notif_task);
            $scope.task.task_time = Utils.convertToUTC($scope.notif.notif_metadata);
            Storage.saveTask($scope.task);
        }
    })
    .controller('viewFTaskCtrl', function($scope, $state, $stateParams, $ionicViewSwitcher, $ionicPopup,
        $rootScope, EvidenceTypes, Server, Storage) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
            $scope.task = $stateParams.task;
            $scope.title = "View Friend's Task";
            $scope.evidenceType = EvidenceTypes.get($scope.task.task_evidenceType);
            $scope.evidenceTypeName = $scope.evidenceType.name;
            $scope.owner = $scope.task.task_partner.friend_name; // the owner(friend) of this friend's task (not the user)
            $scope.checkCompletion($scope.task.task_id);

        });

        $scope.checkCompletion = function(taskId) {
            Server.getEvidence(taskId).then(function(data) {
                if (data.data.file == null) {
                    $scope.complete = "Not Complete";
                } else {
                    $scope.complete = "Complete";
                    // document.getElementById('getEvidence-button').classList.add("button-positive");
                }
            });
        }
    })
    .controller('evidenceDetail', function($scope, $state, $stateParams, $ionicViewSwitcher, Server,
        $ionicHistory, Server, $ionicPlatform, $ionicLoading, $cordovaGeolocation, Storage, $rootScope) {
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
            $scope.notif = $stateParams.notif;
            // if the file path end in jpg, set title to Photo, otherwise, set to GPS
            $scope.evidence_type = ($scope.notif.notif_file.substr(
                $scope.notif.notif_file.lastIndexOf('.') + 1) == 'jpg') ? 'Photo' : 'GPS';
            console.log($scope.notif.notif_file, $scope.evidence_type);
            Server.viewEvidence($scope.notif.notif_notificationId).then(function(data) {
                if ($scope.evidence_type == 'GPS') {
                    $scope.displayMap(window.atob(data.data));
                } else {
                    $scope.imgURI = "data:image/jpeg;base64," + data.data;
                }
            });
        });

        $scope.displayMap = function(data) {
            var coor = data.substr(1, data.length - 2);
            $scope.coor_lat = coor.substr(0, coor.lastIndexOf(','));
            $scope.coor_lng = coor.substr(coor.lastIndexOf(',') + 1);
            console.log($scope.coor_lat, $scope.coor_lng);

            var latLng;
            $ionicPlatform.ready(function() {
                // add for geolocation not timeout
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location'
                });

                var options = {
                    timeout: 10000,
                    enableHighAccuracy: true
                };

                // $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

                latLng = new google.maps.LatLng($scope.coor_lat, $scope.coor_lng);

                var pos = {
                    lat: $scope.coor_lat,
                    lng: $scope.coor_lng
                };

                var mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

                google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        animation: google.maps.Animation.DROP,
                        position: latLng
                    });

                    $scope.getAddressFromLatLang(latLng, $scope.map, marker);
                });
                $ionicLoading.hide();
                /*}, function(error) {
                    $ionicLoading.hide();
                    console.log(JSON.stringify(error));
                    $ionicLoading.show({
                        template: "Could not get location, please check your GPS setting and try again",
                        noBackdrop: true,
                        duration: 1000
                    });
                });*/

                $scope.getAddressFromLatLang = function(latLng, map, marker) {
                    var geocoder = new google.maps.Geocoder();

                    geocoder.geocode({
                        'latLng': latLng
                    }, function(results, status) {
                        //console.log(JSON.stringify(results));
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var infowindow = new google.maps.InfoWindow();
                                infowindow.setOptions({
                                    content: '<div>' + results[1].formatted_address + '</div>',
                                });
                                infowindow.open(map, marker);
                            }
                        } else {
                            alert("error", JSON.stringify(status));
                        }
                    })
                };
            });
        }

        $scope.finishView = function() {
            delete $rootScope.notif_list[$scope.notif.notif_notificationId];
            Server.sendNotificationRead($scope.notif.notif_notificationId);
            $ionicHistory.goBack();
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

/* issue on UTC:
The epoch sent to server should add 5 hours
The epoch get from the server minus 5 hours
store the minus five hr UTC to the localstorage of task
*/