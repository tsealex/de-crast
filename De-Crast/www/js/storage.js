angular.module('decrast.storage', []).factory('Storage', function() {
	var taskList = localStorage.getItem('task_list');
	var userList = localStorage.getItem('friend_list');
	var catList = localStorage.getItem('category_list');
	var notifList = localStorage.getItem('notif_list');

	// initiailize user/friend list
	if (userList === null) {
		console.log('initializing user list')
		userList = {};
		localStorage.setItem('friend_list', angular.toJson(userList));
	} else
		userList = angular.fromJson(userList);

	// initiailize category list
	if (catList === null) {
		console.log('initializing category list')
		catList = {};
		localStorage.setItem('category_list', angular.toJson(catList));
	} else
		catList = angular.fromJson(catList);

	// initiailize notification list
	if (notifList === null) {
		console.log('initializing notification list')
		notifList = {};
		localStorage.setItem('notif_list', angular.toJson(notifList));
	} else
		notifList = angular.fromJson(notifList);

	// initiailize task list
	if (taskList === null) {
		console.log('initializing task list')
		taskList = {};
		localStorage.setItem('task_list', angular.toJson(taskList));
	} else
		taskList = angular.fromJson(taskList);

	console.log('storage.js is now online');
	return {
		getItem: function(key) {
			return angular.fromJson(localStorage.getItem(key));
		},
		setItem: function(key, value) {
			localStorage.setItem(key, angular.toJson(value));
			console.log('cache object ' + key);
		},
		getJsonItem: function(key) {
			return localStorage.getItem(key);
		},
		setJsonItem: function(key, value) {
			localStorage.setItem(key, value);
			console.log('cache json object ' + key);
		},
		// notification related
		clearNotifList: function() {
			notifList = {};
			localStorage.setItem('notif_list', angular.toJson(notifList));
		},
		addNotif: function(notif) {
			notifList[notif.notif_notificationId] = notif;
			localStorage.setItem('notif_list', angular.toJson(notifList));
			console.log('local cached notification added: notification ' + notif.notif_notificationId);
		},
		getNotif: function(id) {
			return notifList[id];
		},
		getNotifList: function() {
			return notifList;
		},
		removeNotif: function(id) {
			delete notifList[id];
			localStorage.setItem('notif_list', angular.toJson(notifList));
			console.log('local cached notification deleted: notification ' + id);
		},
		// category-related
		clearCategoryList: function() {
			catList = {};
			localStorage.setItem('category_list', angular.toJson(catList));
		},
		addCategory: function(category) {
			catList[category.id] = category;
			localStorage.setItem('category_list', angular.toJson(catList));
			console.log('local cached category added: category ' + category.id);
		},
		removeCategory: function(id) {
			delete catList[id];
			localStorage.setItem('category_list', angular.toJson(catList));
			console.log('local cached category deleted: category ' + id);
		},
		getCategoryList: function() {
			return catList;
		},
		getCategory: function(id) {
			return catList[id];
		},
		getCategoryName: function(id) {
			if (catList[id] === undefined)
				return 'None';
			return catList[id].name;
		},
		existCategory: function(id) {
			return !(catList[id] === undefined);
		},
		// user-related
		clearUserList: function() {
			userList = {};
			localStorage.setItem('friend_list', angular.toJson(userList));
		},
		getUserList: function() {
			return userList;
		},
		getUser: function(id) {
			console.log('local cached user loaded: user ' + id)
			return userList[id];
		},
		addUser: function(user) {
			userList[user.friend_uid] = user;
			localStorage.setItem('friend_list', angular.toJson(userList));
			console.log('local cached user added: user ' + user.friend_uid);
		},
		removeUser: function(id) {
			delete userList[id];
			localStorage.setItem('friend_list', angular.toJson(userList));
			console.log('local cached user added: user ' + id);
		},
		existUser: function(id) {
			return !(userList[id] === undefined);
		},
		// task-related
		clearTaskList: function() {
			taskList = {};
			localStorage.setItem('task_list', angular.toJson(taskList));
		},
		getTaskList: function() {
			return taskList;
		},
		cacheTaskChanges: function(task) {
			localStorage.setItem('tmpTask' + task.task_id, angular.toJson(task));
		},
		applyTaskChanges: function(id) {
			var tmpTask = localStorage.getItem('tmpTask' + id);
			if (tmpTask != null) {
				taskList[id] = angular.fromJson(tmpTask);
				localStorage.setItem('task_list', angular.toJson(taskList));
				console.log('local cached task changed: task ' + id)
			}
		},
		saveTask: function(task) {
			taskList[task.task_id] = task;
			localStorage.setItem('task_list', angular.toJson(taskList));
			console.log('local cached task saved: task ' + task.task_id)
		},
		getTask: function(id) {
			console.log('local cached task loaded: task ' + id)
			return taskList[id];
		},
		removeTask: function(id) {
			if (taskList[id] !== undefined)
				delete taskList[id];
			localStorage.setItem('task_list', angular.toJson(taskList));
			console.log('local cached task deleted: task ' + id)
		},
		existTask: function(id) {
			return !(taskList[id] === undefined);
		},
		updateTaskViewer: function(id, viewer_name) {
			if (taskList[id] !== undefined) {
				if(taskList[id].task_partner !== undefined) {
					taskList[id].task_partner.friend_name = viewer_name;
				} else {
					taskList[id].task_partner = {friend_name: viewer_name};
				}
			}
		},
		getOwnedTaskList: function(owned) {
			var myTasks = [];
			for (var id in taskList) {
				var task = taskList[id];
				if (task.task_owned == owned)
					myTasks.push(task);
			}
			return myTasks;
		}
	};
});
