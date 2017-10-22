// global function

function fetchFBfriends = function() {
    // FB get friends who is also using the app
    ngFB.api({
        path: '/' + localStorage.getItem('userFBId') + '/friends',
        params: {}
    }).then(
        function(list) {
            if (list.data.length == 0) {
                $ionicLoading.show({
                    template: 'Cannot find FB friends using the app',
                    noBackdrop: true,
                    duration: 2500
                });
            } else if (list.data.length <= Storage.getUserListSize()) {
                // quick fix
                // we don't need to re-fetch user list from the server, if
                // we already have it cached
                // assumption: # of user's friends never changes
                return;
            }
            for (i = 0; i < list.data.length; i++) {
                var friendFbId = list.data[i].id;
                var friendFbName = list.data[i].name;
                $scope.getUserByFbId(friendFbId, friendFbName); // TODO: can you make a change here
                // TODO: intead of one fbId at a time, you can request for several users:
                // TODO: i.e. user/facebook/32425&9353&232324&2425347/ each separated by '&'
            }
        },
        function(error) {
            alert('Facebook error: ' + error.error_description);
        });

    // populate view

};