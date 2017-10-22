Authenticate the user by sending his facebook id and token to our server.
On success, the server will return an access token that is needed for other
api calls to identify the user. 
> **REQUEST**
```
http://alext.se:8000/auth/ POST
{  
   "facebookId":954161645,
   "facebookToken":"Ir3A9d3A3fjavA8gg4jawRT0zpER8am4t25"
}
```
> **RESPONSE**
```
{  
   "tokenExpiration":1496285816,
   "userId":1,
   "username":null,
   "refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MSwiZXhwIjoxNDk2Mjg1ODE2LCJ0eXBlIjoiUkVGUkVTSCJ9.gRLz_mqPV6xggKnQVwgW2vIhxEd8KKT7Xt_U4Jn_QII",
   "accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MSwiZXhwIjoxNDk2Mjg1ODE2LCJ0eXBlIjoiQUNDRVNTIn0.zoHM7FDxigB1FXXMpPcEUdlfLp79FOSHnjNOrqaMmiU"
}
```
---
Refresh the access token our api issued, using the refresh token returned when
the client first authenticated with our server. This way, we don't have to re-
obtain a facebook token again and send it tp /auth/.
> **REQUEST**
```
http://alext.se:8000/refresh/ POST
{  
   "userId":1,
   "refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MSwiZXhwIjoxNDk2Mjg1ODE2LCJ0eXBlIjoiUkVGUkVTSCJ9.gRLz_mqPV6xggKnQVwgW2vIhxEd8KKT7Xt_U4Jn_QII"
}
```
> **RESPONSE**
```
{  
   "userId":1,
   "username":null,
   "tokenExpiration":1496286784,
   "refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MSwiZXhwIjoxNDk2Mjg1ODE2LCJ0eXBlIjoiUkVGUkVTSCJ9.gRLz_mqPV6xggKnQVwgW2vIhxEd8KKT7Xt_U4Jn_QII",
   "accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6MSwiZXhwIjoxNDk2Mjg2Nzg0LCJ0eXBlIjoiQUNDRVNTIn0.xVo1MoUIG_0HJGDE6vY1a8Kki9AQOPmbqsWS8f-Ba20"
}
```
---
Name the user. This action can only be performed once. Client should make thi
call as soon as user first logged in. You can tell whether a user has already
registered by looking at the 'username' field in the above JSON reponses. If it
is null, that means the user is new. 
> **REQUEST**
```
http://alext.se:8000/user/ POST
{  
   "username":"myusername"
}
```
> **RESPONSE**
```
{  
   "userId":1,
   "username":"myusername",
   "karma":0
}
```
---
Create a new category. Keep in mind that the category name cannot be the same
as any categories' the user created. 
> **REQUEST**
```
http://alext.se:8000/user/categories/ POST
{
   "name":"category1"
}
```
> **RESPONSE**
```
{
   "name":"category1",
   "categoryId":1
}
```
---
Get all of the user's categories. Note that the response contains an array, not
just a single object. You may need to handle the data differently. 
> **REQUEST**
```
http://alext.se:8000/user/categories/ GET
```
> **RESPONSE**
```
[
   {
      "name":"category1",
      "categoryId":1
   }
]
```
---
The url portion '/1/' can replaced with whatever category's id the user owns. 
This call changes the name of an existing category. Unique name constraint is
still enforeced here. 
> **REQUEST**
```
http://alext.se:8000/user/categories/1/ POST
{
   "name":"changed-category1"
}
```
> **RESPONSE**
```
{
   "name":"changed-category1",
   "categoryId":1
}
```
---
Create a new task. Tasks with the same name is allowed, unlike category. Some
fields are optional, which include 'description', 'category'. The 'type' here 
indicated the type of the evidence, supported type values are listed below in
the NOTE section.
Make sure 'category' contains a valid category id value that the user created, 
if it is included in the request. Make sure the deadline is at least an hour 
later than the current time.
> **REQUEST**
```
http://alext.se:8000/user/tasks/ POST
{
   "name":"task1",
   "description":"task details",
   "deadline":1546300800,
   "category":1,
   "type":1
}
```
> **RESPONSE**
```
{
   "taskId":1
}
```
NOTE
- type values: 1: GPS coordinate, 0: photo
---
Get a list of ids of the tasks created by user. Note that this returns an array.
> **REQUEST**
```
http://alext.se:8000/user/tasks/ GET
```
> **RESPONSE**
```
[
   {
      "taskId":1
   }
]
```
---
Get task detail by id. You can include multiple ids in the url query (the '/1/' 
portion). For example, '/1&2&3/'. Make sure those ids belong to the tasks that
the user views or owns. If a task isn't returned, it's probably because the 
user is neither the owner or viewer of that task. 'ended' indicates whether the
task is expired or completed.
If the user is a viewer, the category id is useless since the client won't be 
able to obtain another user's category.  
> **REQUEST**
```
http://alext.se:8000/user/tasks/1/ GET
```
> **RESPONSE**
```
[
   {
      "owner":1,
      "category":1,
      "taskId":1,
      "description":"task details",
      "last_notify_ts":"2017-04-02T03:23:40.955447Z",
      "deadline":1546300800,
      "name":"task1",
      "ended": false,
      "viewer":null
   }
]
```
---
Edit the task info. All fields are optional and these are the only fields that
the user can directly edit. If you want to change the deadline or add a viewer,
you must send a notification.
> **REQUEST**
```
http://alext.se:8000/user/tasks/1/ POST
{
   "name":"changed-task1",
   "description":"more task details",
   "category":null
}
```
> **RESPONSE**
```
{
   "taskId":1
}
```
---
There are three types of notifications you can send for now. If you want to
invite someone for viewing the task, set 'type' to 5 and include two fields,
the 'task' you want to add viewer to and the id of the user you want to invite.
> **REQUEST**
```
http://alext.se:8000/user/notifications/ POST
{
   "type":5,
   "recipient":2,
   "task":1
}
```
> **RESPONSE**
```
{
   "success":true
}
```
---
Get a list of ids of the notification you received and have not yet "viewed".
The concept of marking messages as "viewed" will be explain later.
> **REQUEST**
```
http://alext.se:8000/user/notifications/ GET
```
> **RESPONSE**
```
[
   {
      "notificationId":1
   }
]
```
---
Here, by calling this endpoint, client can mark user's notifications as viewed.
Being viewed means that the notification can no longer be retrieved from the
server while the client can still keep the local copy of it. 'decision' field
is only required for notifications of type 5 (Viewer invite), type 3 (deadline
extention); by setting it to true (accepting the request), the server will 
update the model state, such as making the user the viewer of a task. If it is 
set to false (declining), then nothing will be performed. Either way, the 
notification will be set as 'viewed' thus the client won't be able to retrieve
it again. If 'decision' is omitted for type 3 or type 5 notifications, the
notifications will remain "unviewed" until a proper request (with 'decision'
included) is sent. For other types of notifications, 'decision' can be omitted
as a yes/no response is not necessary (in which case you only need 'id' to
indicate that notification has been viewed. You can include a list of id(s) in
a single request. Note that you will need to make the list the value of the
'notification' field. The response is a list of unviewed notifications' ids you 
still have, the format is the same the format for above call's response. 
> **REQUEST**
```
http://alext.se:8000/user/notifications/respond/ POST
{
   "notification":[
      {
         "id":1,
         "decision":true
      }
   ]
}
```
> **RESPONSE**
```
[

]
```
---
This is another type of notification you can send. Type 3 is for deadline 
extension. For this you need to include the 'deadline' field. Make sure the 
deadline is at least an hour later than the current time.
> **REQUEST**
```
http://alext.se:8000/user/notifications/ POST
{
   "type":3,
   "deadline":1577836800,
   "task":1
}
```
> **RESPONSE**
```
{
   "success":true
}
```
---
Retrieve a notification. You can see the detail of this notification. Again,
you can only retrieve a notification that has not been "viewed". You can 
replace '/2/' with something like '/2&3/' to retrieve a list of notifications.
If the 'file' field is not null, that means there is an attachment to this 
notification, you can retrieve it from the endpoint 'user/notifications/2/file/'
for example. Of course, you can't get the file for this notification since
there is none. Only receiver can view the notification, the sender can't.
> **REQUEST**
```
http://alext.se:8000/user/notifications/2/ GET
```
> **RESPONSE**
```
[
   {
      "sender":1,
      "recipient":2,
      "type":3,
      "sent_date":"2017-04-02T03:46:07.874054Z",
      "notificationId":2,
      "task":1,
      "metadata":"1577836800",
      "file":null,
      "text":"myusername sent you a request for changing the deadline of the task \"changed-task1\"."
   }
]
```
---
Sending a reminder. Type 0 is a reminder, you must include the field 'text',
which includes the content of this notification. 
> **REQUEST**
```
http://alext.se:8000/user/notifications/ POST
{
   "type":0,
   "text":"just wanted to remind you",
   "task":1
}
```
> **RESPONSE**
```
{
   "success":true
}
```
---
Get a list of task ids the user is viewing. Note that ended/completed tasks are 
automatically removed from this list.
> **REQUEST**
```
http://alext.se:8000/user/tasks/viewing/ GET
```
> **RESPONSE**
```
[
   {
      "taskId":1
   }
]
```
---
Search users by username. Return a list of user ids and their usernames. 
> **REQUEST**
```
http://alext.se:8000/user/search/myuser/ GET
```
> **RESPONSE**
```
[
   {
      "userId":1,
      "username":"myusername",
      "karma":0
   }
]
```
---
Get users by their facebook id. Return a list of user ids and their usernames. 
> **REQUEST**
```
http://alext.se:8000/user/facebook/8456324/ GET
```
> **RESPONSE**
```
[
   {
      "userId":2,
      "username":"userTwo",
      "karma":0
   }
]
```
---
Submit the evidence. Note that this body format is only for coordinate-type
evidence. For file/image-type, you must send a file, i.e. make a call like:
```
curl
  -H "Content-Type:multipart/form-data"  \
  -H "Authorization: JWT <access_token>" \ 
  -X POST \
  -F file=@<full_file_path> \
     <server_endpoint_url>
```
Note that all uploaded files must be under 2MB and is actually an image type or the
type corresponding to the evidence type (currently only image is supported).

---
> **REQUEST**
```
http://alext.se:8000/user/tasks/1/evidence/ POST
{
   "coordinates":"(43.0765920,-89.4124875)"
}
```
> **RESPONSE**
```
{
   "success":true
}
```
NOTE
- the input format is subject to change
---
Retrieve the notification. Nothing different from the previous retrieval call.
However, note that this time 'file' is not null meaning the user can access the
file. Also, note that the gps coordinate will be stored in a text file called
'evidence.gps'.
> **REQUEST**
```
http://alext.se:8000/user/notifications/3/ GET
```
> **RESPONSE**
```
[
   {
      "sender":1,
      "recipient":2,
      "type":2,
      "sent_date":"2017-04-02T04:30:27.013716Z",
      "notificationId":3,
      "task":1,
      "metadata":null,
      "file":"uploads/task_1/evidence.gps",
      "text":"myusername has submitted evidence for the task \"changed-task1\"."
   }
]
```
---
Get the file. Note that this will download the file. The response here contains
the content in the downloaded file.
> **REQUEST**
```
http://alext.se:8000/user/notifications/3/file/ GET
```
> **RESPONSE** (RAW DATA)
```
(43.0765920,-89.4124875)
```
---
Get the evidence of a task. If 'file' is not null, you can retrieve it using
call 'evidence/file/' (discussed below). By looking at whether 'file' is null,
you can tell if the task is completed (uploaded evidence => task completed, for
the current version of our app). 
> **REQUEST**
```
http://alext.se:8000/user/tasks/1/evidence/ GET
```
> **RESPONSE**
```
{
   "type":1,
   "taskId":1,
   "upload_date":1491107426,
   "file":"uploads/task_1/evidence.gps"
}
```
---
Retrieve the evidence. In fact, client likely doesn't need to make this call
because when a task is completed, a notification attached with the uploaded
evidence will be sent to (all) the viewer(s).  
> **REQUEST**
```
http://alext.se:8000/user/tasks/1/evidence/file/ GET
```
> **RESPONSE**
```
(43.0765920,-89.4124875)
```
---
Delete a category. This will reset the 'category' of all the tasks under this 
category to null.
> **REQUEST**
```
http://alext.se:8000/user/categories/1/ DELETE
```
> **RESPONSE**
```
{
   "success": true
}
```
---
List all users. For development stage only.
> **REQUEST**
```
http://alext.se:8000/user/list/ GET
```
> **RESPONSE**
```
[
   {
      "userId":1,
      "username":"myusername",
      "karma":0
   },
   {
      "userId":2,
      "username":"userTwo",
      "karma":0
   }
]
```
---
Populate our database with a new template message, which may be posted to a 
user's Facebook timeline if they missed the deadline and they didn't specify
the consequence.
> **REQUEST**
```
http://alext.se:8000/meme/message/ POST
{  
   "message":"Posted By De-Crast."
}
```
> **RESPONSE**
```
{
   "id":1,
   "text":"Posted By De-Crast."
}
```
---
> **REQUEST**
```
http://alext.se:8000/meme/message/1/ DELETE
```
> **RESPONSE**
```
{
   "success":true
}
```
---
Populate our database with a new template image, which may be posted to a 
user's Facebook timeline if they missed the deadline, along with a message.


```
http://alext.se:8000/meme/image/ POST

curl --request POST \
  --url http://alext.se:8000/meme/image/ \
  --header 'content-type: multipart/form-data' \
```
---
OTHER NOTES:

every time a task is created, the client must make a POST call to the endpoint 
  /user/tasks/<id>/consequence/ to initialize the consequence. To use default
  consequence, just don't pass any parameters. Otherwise, client must pass 'file'
  and 'message' two parameters. For example, make a call like
```
curl --request POST \
  --url http://alext.se:8000/user/tasks/<id>/consequence/ \
  --header 'content-type: multipart/form-data' \
  --form file=@<filepath>
  --form message='you message'
```
---
To retrieve the consequence message and/or file, make calls to:
```
/user/tasks/<id>/consequence/ POST
```
return three fields: ('message', 'taskId', 'file')
```
/user/tasks/<id>/consequence/file/ POST
```
- can start downloading the file
- before trying to retrieve the file, call the first endpoint to make that
  there is a file (i.e. 'file' is non-null).

Note: only the task owner can perform this action; viewer cannot view the consequence

