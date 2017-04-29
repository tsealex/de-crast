angular.module('decrast.storage', []).factory('Storage', function() {
	var taskList = localStorage.getItem('task_list');
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
			return localStorage.getItem(key);
		},
		setItem: function(key, value) {
			localStorage.setItem(key, value);
		},
		// task-related
		clearTaskList: function() {
			taskList = {};
			localStorage.setItem('task_list', angular.toJson(taskList));
		},
		getTaskList: function() {
			return taskList;
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
