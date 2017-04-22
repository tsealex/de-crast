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


// ftasks dummy data
.factory('Ftasks', function() {
// Might use a resource here that returns a JSON array

// Some fake testing data
  var ftasks = [{
      id: 0,
      title: 'Ben Sparrow',
      deadline: '2017-05-05'
  }, {
      id: 1,
      title: 'Max Lynx',
      deadline: '2017-05-06'
  }, {
      id: 2,
      title: 'Adam Bradleyson',
      deadline: '2017-05-07'
  }];

  return {
      all: function() {
          return ftasks;
      },
      remove: function(ftasks) {
          ftasks.splice(ftasks.indexOf(ftask), 1);
      },
      get: function(ftaskId) {
          for (var i = 0; i < ftasks.length; i++) {
              if (ftasks[i].id === parseInt(ftaskId)) {
                  return ftasks[i];
              }
          }
          return null;
      }
  }
})

// friends dummy data
.factory('Friends', function() {
// Might use a resource here that returns a JSON array

  return function() {
      // currently the uid input is fbId, later will be De-Crast userId
      self.addFriend = function (uid, name, status) {
          var friend = { friend_uid: uid, friend_name: name, friend_status: status };
          return friend;
      };
      // change the friend's status
      self.statusHandler = function(friend, status)
      {
          friend.friend_status = status;
          return friend;
      };
      // other potential handler
      // dropdown menu/popup selection page when creating a new task
      // Be blocked detector
      return self;
  };

})
// notifications dummy data
.factory('Notif', function() {
// Might use a resource here that returns a JSON array

  return function() {
      // currently the uid input is fbId, later will be De-Crast userId
      self.addNotif = function (sender, recipient, type, sent_date, notificationId, task, metadata, file, text) {
          var notif = { notif_sender: sender, notif_recipient: recipient, notif_type: type, notif_sent_date: sent_date, notif_notificationId: notificationId, notif_task: task, notif_metadata: metadata, notif_file: file, notif_text: text };
          return notif;
      };
      // other potential handler
      // dropdown menu/popup selection page when creating a new task
      // Be blocked detector
      return self;
  };
})
/*
 This factory will be used for creating task objects and processing changes to the tasks. We will also likely add functions
 to  update local storage and the server in this factory.
 */

.factory('TaskFact', function() {

    return function() {

        //task constructor?
        self.addTask = function (taskId, name, descrip, category, time, partner, facebook, evidenceType) {

            var task = { task_name: name, task_descrip: descrip, task_category: category, task_time: time, task_partner: partner,
                task_facebook: facebook, task_evidenceType: evidenceType};

            task.task_id = taskId;

            /*
          // CODE TO UPDATE MASTER LIST, LOCAL STORAGE, AND SERVER. NOT SURE IF IT SHOULD GO HERE OR IN CONTROLLER
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

})

.factory('Categories', function() {
  return function() {
      // currently the uid input is fbId, later will be De-Crast userId
      self.addCategory = function (id, name) {
          var category = { id: id, name: name};
          return category;
      };
      return self;
  };

})

.factory('EvidenceTypes', function() {
  var evidenceTypes = [{
      evidenceTypeId: 0,
      name: 'Photo'
  }, {
      evidenceTypeId: 1,
      name: 'GPS'
  }]

  return {
      all: function() {
          return evidenceTypes;
      },
      get: function(evidenceTypeId) {
          for (var i = 0; i < evidenceTypes.length; i++) {
              if (evidenceTypes[i].evidenceTypeId === parseInt(evidenceTypeId)) {
                  return evidenceTypes[i];
              }
          }
          return null;
      }
  }
})

.factory('NotificationParser', function() {
      // currently the uid input is fbId, later will be De-Crast userId
			return{
      	parse: function(notification) {
					alert('PARSING: ' + JSON.stringify(notification));
					if(notification.type == 5) {
						alert('Received invite');
						return 'login';
					}
      	}
			}
});
