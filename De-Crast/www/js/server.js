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
                            console.log(accessToken);
                            return response;
                        }, function(response){
                            return response;
                        });
            }
            
        }
    });
/*

                                $http({
                                    method: 'POST',
                                    headers: headers,
                                    url: ,
                                    data: 
                                        
                                    .success(function(data,status,headers,config){
                                        console.log(JSON.stringify(status));
                                        console.log(JSON.stringify(headers));
                                        console.log(JSON.stringify(config));
                                        console.log("You got it: " + JSON.stringify(data));
                                        alert("You got it: " + JSON.stringify(data));
                                        }
                                    ).error(function(data){
                                        console.log(JSON.stringify(headers));
                                        console.log(JSON.stringify(data));
                                        alert("You fail");
                                    });
*/