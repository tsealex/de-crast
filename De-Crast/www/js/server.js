angular.module('decrast.server', [])
    .factory('Server', function($http, ApiEndpoint) {

        // api headers
        var headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        var fbApi = 'https://graph.facebook.com/';
        var accessToken = localStorage.getItem('accessToken');

        var lock = {
            'addNewTask': false
        };
        
        return {

            loginUser: function(fid) {
                return $http.post(ApiEndpoint.url + 'auth/', {
                        facebookId: fid,
                        facebookToken: "RANDOM-STRING"
                    })
                    .success(function(response) {
                        console.log(JSON.stringify(response));
                        if (response.accessToken)
                            accessToken = response.accessToken;
                        return response;
                    })
                    .error(function(data) {
                        return data;
                    });
            },
            /*fetchUsers: function() {
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'users/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                        });
            },*/
            changeUsername: function(username) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        username: username
                    }
                }).then(function(response) {
                    console.log("changeUsername", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("changeUsername", JSON.stringify(response));
                    return response;
                });
            },
            updateFcmToken: function(fcm_id) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        fcm_token: fcm_id
                    }
                }).then(function(response) {
                    console.log("updateFcmToken", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("updateFcmToken", JSON.stringify(response));
                    return response;
                });
            },
            addNewTask: function(name, description, deadline, category, type) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/tasks/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        name: name,
                        description: description,
                        deadline: deadline,
                        category: category,
                        type: type
                    }
                }).then(function(response) {
                    console.log("addNewTask", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("addNewTask", JSON.stringify(response));
                    return response;
                });
            },
            editTask: function(taskId, name, description, category) { // category
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + "/",
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        name: name,
                        description: description,
                        category: category
                        // no edit of category?
                        // may need further change it for deadline permission
                        //category: category,
                    }
                }).then(function(response) {
                    console.log("editTask", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("editTask", JSON.stringify(response));
                    return response;
                });
            },
            expireTask: function(taskId) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        expired: 1
                    }
                }).then(function(response) {
                    console.log('expireTask', JSON.stringify(response));
                });
            },
            completeTask: function(taskId) {
              return $http({
                      method:'POST',
                      url: ApiEndpoint.url + 'user/tasks/' + taskId + '/',
                      headers: {'Authorization': 'JWT ' + accessToken},
                      data: {completed: 1}
                  }).then(function(response) {
                    console.log('completeTask', JSON.stringify(response));
                  });
            },
						getUserTasks: function() {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getUserTasks", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getUserTasks", JSON.stringify(response));
                    return response;
                });
            },

            getTask: function(taskId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getTask", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getTask", JSON.stringify(response));
                    return response;
                });
            },
            addCategory: function(categoryName) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/categories/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        name: categoryName
                    }
                }).then(function(response) {
                    console.log("addCategory", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("addCategory", JSON.stringify(response));
                    return response;
                });

            },
            getCategory: function() {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/categories/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                }).then(function(response) {
                    console.log("getCategory", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getCategory", JSON.stringify(response));
                    return response;
                });
            },
            getEvidenceType: function(taskId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                }).then(function(response) {
                    console.log("getEvidenceType", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getEvidenceType", JSON.stringify(response));
                    return response;
                });
            },
            submitGPS: function(taskId, coordinates) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        coordinates: coordinates
                    }
                }).then(function(response) {
                    console.log("submitGPS", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("submitGPS", JSON.stringify(response));
                    return response;
                });
            },
            /*
            http://alext.se:8000/user/notifications/3/file/ GET
            */
            viewEvidence: function(notifId){
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/' + notifId + '/file/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getGPS", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getGPS", JSON.stringify(response));
                    return response;
                });
            },
            //I'm sure this isn't right but it's filler for now
            submitPhoto: function(taskId, file_uri) {
                var form = new FormData();
                var url = ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/';
                form.append("file", file_uri, 'evidence.jpg');
                return $http.post(url, form, {
                    /*
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken,
                    },
                    mimeType: "multipart/form-data",
                    data: form*/
                    headers: {
                        'Authorization': 'JWT ' + accessToken,
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                }).then(function(response) {
                    console.log("submitPhoto", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("submitPhoto", JSON.stringify(response));
                    return response;
                });
            },
            getUserByFbId: function(fbId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/facebook/' + fbId + '/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                }).then(function(response) {
                    console.log("getUserByFbId", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getUserByFbId", JSON.stringify(response));
                    return response;
                });
            },
            fakesendNotification: function(type, recipient, task) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/notifications/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        type: type,
                        recipient: recipient,
                        task: task
                    }
                }).then(function(response) {
                    console.log("fakesendNotification", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("fakesendNotification", JSON.stringify(response));
                    return response;
                });
            },
            fakegetNotification: function() {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("fakegetNotification", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("fakegetNotification", JSON.stringify(response));
                    return response;
                });
            },
            fakegetNotificationDetail: function(notifId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/' + notifId + '/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("fakegetNotificationDetail", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("fakegetNotificationDetail", JSON.stringify(response));
                    return response;
                });
            },
            sendNotificationThree: function(type, deadline, task) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/notifications/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        type: type,
                        deadline: deadline,
                        task: task
                    }
                }).then(function(response) {
                    console.log("sendNotificationThree", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("sendNotificationThree", JSON.stringify(response));
                    return response;
                });
            },
            sendNotificationRead: function(notifId) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/notifications/respond/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        "notification": [{
                            id: notifId
                        }]
                    }
                }).then(function(response) {
                    console.log("sendNotificationRead", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("sendNotificationRead", JSON.stringify(response));
                    return response;
                });
            },
            decideOnInvite: function(notificationId, decision) {
                return $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/notifications/respond/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                    data: {
                        "notification": [{
                            id: notificationId,
                            decision: decision
                        }]
                    }
                }).then(function(response) {
                    console.log("decideOnInvite", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("decideOnInvite", JSON.stringify(response));
                    return response;
                });
            },
            getViewTask: function(notifId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/viewing/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getViewTask", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getViewTask", JSON.stringify(response));
                    return response;
                });
            },
            getEvidence: function(taskId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getEvidence", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getEvidence", JSON.stringify(response));
                    return response;
                });
            }
        }
    });
