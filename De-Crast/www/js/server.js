angular.module('decrast.server', [])
    .factory('Server', function($http, ApiEndpoint) {

        // api headers
        var headers = {
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
        };
        var fbApi = 'https://graph.facebook.com/';
        var accessToken = localStorage.getItem('accessToken');

       
        return {

            loginUser: function(fid) {
                return $http.post(ApiEndpoint.url + 'auth/', {
                                            facebookId: fid,
                                            facebookToken:"RANDOM-STRING"})
                            .success(function(response){
                                return response;
                            })
                            .error(function(data){
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
                            method:'POST',
                            url: ApiEndpoint.url + 'user/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {username: username}
                        }).then(function(response){
                            console.log("changeUsername", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("changeUsername", JSON.stringify(response));
                            return response;
                        });
            },
            addNewTask: function(name, description, deadline, category, type) {
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/tasks/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                name: name,
                                description: description,
                                deadline: deadline,
                                category: category,
                                type: type
                            }
                        }).then(function(response){
                            console.log("addNewTask",JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("addNewTask",JSON.stringify(response));
                            return response;
                });
            },
            eidtTask: function(taskId, name, description, category) { // category
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/tasks/'+taskId+"/",
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                name: name,
                                description: description,
                                category: category
// no edit of category?
// may need further change it for deadline permission                                
                                //category: category,
                            }
                        }).then(function(response){
                            console.log("eidtTask", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("eidtTask", JSON.stringify(response));
                            return response;
                });
            },
            getUserTasks: function(){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/tasks/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            console.log("getUserTasks", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("getUserTasks", JSON.stringify(response));
                            return response;
                });
            },

            getTask: function(taskId){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/tasks/' + taskId + '/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            console.log("getTask", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("getTask", JSON.stringify(response));
                            return response;
                });
            },
            addCategory: function(categoryName){
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/categories/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                name: categoryName
                            }
                        }).then(function(response){
                            console.log("addCategory", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("addCategory", JSON.stringify(response));
                            return response;
                });

            },
            getCategory: function(){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/categories/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                        }).then(function(response){
                            console.log("getCategory",JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("getCategory",JSON.stringify(response));
                            return response;
                });
            },
            getEvidenceType: function(taskId){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/tasks/' + taskId + '/evidence/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                        }).then(function(response){
                            console.log("getEvidenceType",JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("getEvidenceType",JSON.stringify(response));
                            return response;
                });
            },
            submitGPS: function(taskId, coordinates){
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/tasks/' + taskId +'/evidence/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                coordinates: coordinates
                            }
                        }).then(function(response){
                            console.log("submitGPS", JSON.stringify(response));
                            return response;
                        }, function(response){
                            console.log("submitGPS", JSON.stringify(response));
                            return response;
                });
            }
        }
    });
