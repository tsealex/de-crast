# Server backend branch

This branch will host the backend server code. This will serve to keep the two
halves of the project seperate and the repo organized.

## JSON request object ideas
{ "user" : "user-id",
  "password" : "some-password",
  "function" : [
    "push-task", 
    "get-all-tasks,
    "send-message",
    "get-messages",
    "..."],
  "args" : [{"arg1" : "type"},{"arg2" : "type"}]}
