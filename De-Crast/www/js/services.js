angular.module('decrast.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    title: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    title: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    title: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    title: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    title: 'Mike Harrington',
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

// dummy Tasks data
.factory('Tasks', function() {
// Might use a resource here that returns a JSON array

// Some fake testing data
  var tasks = [{
    id: 0,
    title: 'Ben Sparrow',
    deadline: '2017-01-01'
  }, {
    id: 1,
    title: 'Max Lynx',
    deadline: '2017-01-03'
  }, {
    id: 2,
    title: 'Adam Bradleyson',
    deadline: '2017-01-02'
  }];

  return {
    all: function() {
      return tasks;
    },
    remove: function(tasks) {
      tasks.splice(tasks.indexOf(task), 1);
    },
    get: function(taskId) {
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
          return tasks[i];
        }
      }
      return null;
    }
  }
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
    star: 'normal'
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
});
