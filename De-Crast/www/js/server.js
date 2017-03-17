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
            fetchUsers: function(accessToken) {
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'users/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                        });
            },
            changeUsername: function(uid, accessToken, username) {
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {userId: uid, username: username}
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                        });
            },
            addNewTask: function(accessToken, name, deadline, description, category, viewer) {
                return $http({
                            method:'POST',
                            url: ApiEndpoint.url + 'user/tasks/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                name: name,
                                deadline: deadline,
                                description: description,
                                category: category,
                                viewer: null
                            }
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                });
            },
            getUserTasks: function(accessToken){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/tasks/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                });
            },
            /*
            getTask: function(accessToken, taskId){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/tasks/' + taskId + '/',
                            headers: {'Authorization': 'JWT ' + accessToken}
                        }).then(function(response){
                            console.log(JSON.stringify(response));
                            return response;
                        }, function(response){
                            return response;
                });
            },*/
            addCategory: function(accessToken, categoryName){
                return $http({
                            method:'PUT',
                            url: ApiEndpoint.url + 'user/categories/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                            data: {
                                name: categoryName
                            }
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                });

            },
            getCategory: function(accessToken){
                return $http({
                            method:'GET',
                            url: ApiEndpoint.url + 'user/categories/',
                            headers: {'Authorization': 'JWT ' + accessToken},
                        }).then(function(response){
                            return response;
                        }, function(response){
                            return response;
                });
            }
        }
    });
