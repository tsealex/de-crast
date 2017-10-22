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
                    return response;
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
            getConsequence: function(taskId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/tasks/' + taskId + '/consequence/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getConsequence", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getConsequence", JSON.stringify(response));
                    return response;
                });
            },
            submitConsequence: function(taskId, consequence, data_uri) {
                var con = false;
                var uri = false;
                console.log("incoming consequence message");
                console.log(consequence);
                var form = new FormData();
                var form2 = new FormData();
                var url = ApiEndpoint.url + 'user/tasks/' + taskId + '/consequence/';

                if(consequence != null && consequence != "") {
                    form.append("message", consequence);
                    console.log("con appended");
                    console.log(form);
                    con = true;
                }
                else {
                    console.log("con not appended");
                    form = null;
                }

                console.log("this is data uri: " + data_uri);

                if(data_uri != null && data_uri != "") {
                    form2.append("file", data_uri, 'consequence.jpg');
                    uri = true;
                    console.log("IS THIS HAPPENING????");
                }
                else {
                    form2 = null;
                }

                console.log("con is: " + con);
                console.log("uri is: " + uri);
                // TODO: why not just use a single form ?
                // TODO: this one probably would not work
                /*
                if(con && uri) {
                    console.log("case both null");
                    return $http.post(url, form, form2, {
                        headers: {
                            'Authorization': 'JWT ' + accessToken,
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    }, function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    });
                }
                else */
                if(con && !uri) {
                    console.log("case uri null");
                    return $http.post(url, form, {
                        headers: {
                            'Authorization': 'JWT ' + accessToken,
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    }, function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    });

                }
                /*
                else if(!con && uri) {
                    console.log("case message null");
                    return $http.post(url, form2, {
                        headers: {
                            'Authorization': 'JWT ' + accessToken,
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    }, function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    });

                }
                */
                else {
                    console.log("case both null");
                    return $http.post(url, new FormData(), {
                        headers: {
                            'Authorization': 'JWT ' + accessToken,
                            'Content-Type': undefined
                        }
                       // transformRequest: angular.identity,
                    }).then(function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    }, function (response) {
                        console.log("submitConsequence", JSON.stringify(response));
                        return response;
                    });

                }
            },
            /*
            http://alext.se:8000/user/notifications/3/file/ GET
            */
            viewEvidence: function(notifId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/' + notifId + '/file/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    },
                }).then(function(response) {
                    console.log("viewEvidence", JSON.stringify(response.data));
                    return response;
                }, function(response) {
                    console.log("viewEvidence", JSON.stringify(response));
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
            sendNotification: function(type, recipient, task) {
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
                    console.log("sendNotification", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("sendNotification", JSON.stringify(response));
                    return response;
                });
            },
            getNotification: function() {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getNotification", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getNotification", JSON.stringify(response));
                    return response;
                });
            },
            getNotificationDetail: function(notifId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/' + notifId + '/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getNotificationDetail", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getNotificationDetail", JSON.stringify(response));
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
            },
            getInviteTask: function(notificationId) {
                return $http({
                    method: 'GET',
                    url: ApiEndpoint.url + 'user/notifications/' + notificationId + '/task/',
                    headers: {
                        'Authorization': 'JWT ' + accessToken
                    }
                }).then(function(response) {
                    console.log("getInviteTask", JSON.stringify(response));
                    return response;
                }, function(response) {
                    console.log("getInviteTask", JSON.stringify(response));
                    return response;
                });
            }
        }
    });
