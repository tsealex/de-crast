# create a new user. The server will respond with an error json, or json 
# containing a new user authentication token.
req_create_user = \
        {"func": "create user", 
         "username": "myusername", 
         "password": "123password"}

res_create_user_ = \
        {"code": "201", 
         "token": "89787jwejkfds8w897uiojaf_some_token"}

res_create_user_succ = \
        {"code": "400", 
         "client-error": "username already exists"} 

# use basic authentication with the server. This will return an error json
# or a json with the user's new access token.
req_basic_auth = \
        {"func": "basic auth", 
         "username": "jcloud2", "password": "123password"}

res_basic_auth_succ = \
        {"code": "200", 
         "token": "89787jwejkfds8w897uiojaf_some_token"}

res_basic_auth_fail = \
        {"code": "400", 
         "client-error": "username already exists"}

# push a task. This will return an error jcos or a conformation json
req_push_task = \
        {"func": "push task",
         "token": "89787jwejkfds8w897uiojaf_some_token",
         "text": "my task is to do something",
         "deadline": "some agreed apon datetime format",
         "viewers": ["user1", "user2"],
         "evidence": "blob"}

res_push_task_succ = \
        {"code": "201"}

res_push_task_fail = \
        {"code": "400",
         "client-error": "something went wrong"}

# get all tasks.         
req_pull_tasks = \
        {"func": "pull task",
         "token": "89787jwejkfds8w897uiojaf_some_token",

res_pull_task_succ = \
        [
            {"code": "200",
             "text": "my task is to do something",
             "deadline": "some agreed apon datetime format",
             "viewers": ["user1", "user2"],
             "evidence": "blob"},
            ...
        ]

res_pull_task_fail = \
        {"code": "400",
         "client-error": "something went wrong"}

# get all messages
req_pull_messages = \
        {"func": "pull messages",
         "token": "89787jwejkfds8w897uiojaf_some_token"}

message = \
        {"func": "pull messages",
         "token": "sdasd8f78s9adfu98isdny9082358",
         "id": "some unique number",
         "from": "user sent from",
         "to": "user sent to",
         "text": "I'm a message"}

res_pull_messages_succ = \
        {"code": "200",
         "messages": [message1, message2, ...]}

# push message
req_push_message = \
        {"func": "push message",
         "token": "kghjasdf786a7683287ew8asdfh87",
         "message": message}

res_push_message_succ = \
        {"code": "201"}


