angular.module('decrast.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

// friends dummy data
.factory('Friends', function() {
// Might use a resource here that returns a JSON array

// Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    star: 'on'
  }, {
    id: 1,
    name: 'Max Lynx',
    star: 'off'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    star: 'block'
  }, {
    id: 3,
    name: 'Perry Governor',
    star: 'off'
  }, {
    id: 4,
    name: 'Mike Harrington',
    star: 'on'
  }];

  return {
    all: function() {
      return friends;
    },
    remove: function(friends) {
      friends.splice(friends.indexOf(friend), 1);
    },
    get: function(friendId) {
      for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === parseInt(friendId)) {
          return friends[i];
        }
      }
      return null;
    }
  }
})
/*
 This factory will be used for creating task objects and processing changes to the tasks. We will also likely add functions
 to  update local storage and the server in this factory.
 */

    .factory('TaskFact', function() {

    return function() {

        //task constructor?
        self.addTask = function (name, descrip, category, time, partner, facebook, evidence) {

            var task = { task_name: name, task_descrip: descrip, task_category: category, task_time: time, task_partner: partner,
                task_facebook: facebook, task_evidence: evidence};

            task.task_id = name+descrip+category+time;

          /* CODE TO UPDATE MASTER LIST, LOCAL STORAGE, AND SERVER. NOT SURE IF IT SHOULD GO HERE OR IN CONTROLLER
           $rootScope.task_list[task.task_id] = task;

           localStorage.setItem('task_list', angular.toJson($rootScope.task_list));
           //api call
           */
            return task;
        };

        //task editor?
        self.editTask = function(task, name, descrip, category)
        {
            task.task_name = name;
            task.task_descrip = descrip;
            task.task_category = category;

          /*
           Could put code to update localStorage and server here or at the calls.
           */
            return task;
        };

        self.updateDue = function (task, update_bool, time) {
            if(update_bool == true) {
                task.task_time = time;
            }

            return task;
          /*
           Again, we can do local storage here or at the point of call.
           */
        };


        return self;
    };

});