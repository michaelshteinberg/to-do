
Parse.initialize('7Yyb87ypHgjYydiiVsgkcmBujYqHqYJbclEVOGTs', 'ixXUsqgb5mGJGUBF5UCYGDPZmyG7uCZ1tkFqcUUG');

var ToDo = angular.module('ToDo', ['ngRoute']);

function ToDoFactory()
{
	var TaskParse = Parse.Object.extend("Task");
	
	this.editTask = function(request)
	{
		var response = {};
		
		var taskParse = new TaskParse();
		
		if(request.task.id != null)
		{
			taskParse.id = request.task.id;
		}
		
		taskParse.set("title",request.task.title);
		taskParse.set("description",request.task.description);
		
		taskParse.save(null, {
			success: function(object) {
				
				response.task = request.task;
				
				request.callback(response.task);
			},
			error: function(object, error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
		
		return response;
	}
		
	this.getTask = function(request)
	{
		var response = {};
		
		var task = {
			id: request.task.id
		}
		
		var taskParseQuery = new Parse.Query(TaskParse);
		taskParseQuery.get(request.task.id,{
			success: function(object) {
				
				task.title = object.get('title');
				task.description = object.get('description');
				
				response.task = task;
				
				request.callback(task);
			},
			error: function(object, error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
		
		return response;
	}
	
	this.getTasks = function(request)
	{
		var response = {
			tasks: new Array()
		};
		
		var taskParseQuery = new Parse.Query(TaskParse);
		
		taskParseQuery.find({
			success: function(objects) {
				
				for (var objectIndex = 0; objectIndex < objects.length; objectIndex++)
				{
					object = objects[objectIndex];
					
					response.tasks.push({
						id: object.id,
						title: object.get('title'),
						description: object.get('description')
					});
				}
				
				request.callback(response.tasks);
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
		
		return response;
	}
}

var toDoFactory = new ToDoFactory();

ToDo.config(function($routeProvider) {
	$routeProvider
	.when('/main', {
		templateUrl : 'templates/main.html',
		controller  : 'MainController'
	})
	.when('/task/:taskId', {
		templateUrl : 'templates/task.html',
		controller  : 'TaskController'
	})
	.otherwise({
		redirectTo: '/main'
	});
});

ToDo.controller('ToDoController', function ($scope) {
	
});

ToDo.controller('TaskController', ['$routeParams','$scope', function($routeParams,$scope) {
	$scope.task = {
		id : $routeParams.taskId,
		title: {
			value : "",
			error : {
				empty: false
			},
		},
		description: {
			value : "",
			error : {
				empty: false
			},
		}
	}
	
	$scope.editTaskComplete = false;
	
	$scope.getTask = function(){
		
		toDoFactory.getTask({
			task: {
				id: $scope.task.id
			},
			callback: function(task){
				$scope.task.title.value = task.title;
				$scope.task.description.value = task.description;
				
				$scope.$apply();
			}
		});
	}
	
	$scope.editTask = function()
	{
		var taskApproved = true;
		
		$scope.task.title.error.empty = false;
		$scope.task.description.error.empty = false;
		$scope.editTaskComplete = false;
		
		if($scope.task.title.value == "")
		{
			taskApproved = false;
			$scope.task.title.error.empty = true;
		}
		if($scope.task.description.value == "")
		{
			taskApproved = false;
			$scope.task.description.error.empty = true;
		}
		
		if(taskApproved)
		{
			toDoFactory.editTask({
				task: {
					id: $scope.task.id,
					title: $scope.task.title.value,
					description: $scope.task.description.value,
				},
				callback: function(){
					$scope.editTaskComplete = true;
					
					$scope.$apply();
				}
			});
		}
	};
	
	$scope.getTask();
}]);

ToDo.controller('MainController', function ($scope) {
	$scope.task = {
		title: {
			value : "",
			error : {
				empty: false
			},
		},
		description: {
			value : "",
			error : {
				empty: false
			},
		}
	}
	
	$scope.addTaskComplete = false;
	
	$scope.tasks = [];
	
	$scope.getTasks = function()
	{
		$scope.tasks = [];
		
		toDoFactory.getTasks({
			callback: function(tasks){
				
				$scope.tasks = tasks;
				
				$scope.$apply();
			}
		});
	}
	
	$scope.addTask = function()
	{
		var taskApproved = true;
		
		$scope.task.title.error.empty = false;
		$scope.task.description.error.empty = false;
		$scope.addTaskComplete = false;
		
		if($scope.task.title.value == "")
		{
			taskApproved = false;
			$scope.task.title.error.empty = true;
		}
		if($scope.task.description.value == "")
		{
			taskApproved = false;
			$scope.task.description.error.empty = true;
		}
		
		if(taskApproved)
		{
			toDoFactory.editTask({
				task: {
					id: null,
					title: $scope.task.title.value,
					description: $scope.task.description.value,
				},
				callback: function(task){
					$scope.task.title.value = "";
					$scope.task.description.value = "";
					$scope.addTaskComplete = true;
					
					$scope.$apply();
					
					$scope.getTasks();
				}
			});
		}
	};
	
	$scope.getTasks();
});