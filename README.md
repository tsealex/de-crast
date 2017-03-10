Note: 
Authentication hasn't been implemented yet, so the requests to any endpoints must contain a request body that include the field "userId" to indicate the identity of the user. Authentication will probably be implemented until the end of the first sprint or the beginning of the second sprint.

###########################################################
Endpoints:
===========================================================
/list/
For testing purpose only, list all the registered users' id and username. It only handles GET request, no JSON body is required. 
===========================================================
/auth/
used for registering users to the app

INPUT (Case 1, POST): for new user to register
{
  "facebookId" a number (doesn't have to be a real FB id),
  "facebookToken": "this can be anything for now (must be a string tho)"
}
OUTPUT (Case 1):
{
  "userId": user id,
  "username": null or "string",
  "accessToken": "no_access_token_available",
  "refreshToken": "no_refresh_token_available"
}
------------------------------------------------------------
INPUT (Case 2, POST): (for existing user to refresh their access token)
{
  "userId": user id,
  "refreshToken": "this can be anything for now (must be a string tho)"
}
OUTPUT (Case 2):
{
  "userId": user id,
  "username": null or "string",
  "accessToken": "no_access_token_available",
  "refreshToken": "no_refresh_token_available"
}
===========================================================
/user/
new endpoint that is not mentioned in the design document but it's needed. For newly registered users to specify their username.

INPUT (POST):
{
  "userId": user id,
  "username": "a string (input check hasn't been implemented yet)"
}
OUTPUT:
{
  "userId": user id,
  "username": "the username specified in the input"
}
===========================================================
SUGGESTED TOOLS FOR TESTING:
$ curl -H ""Content-Type: application/json" -X <POST or GET> -d "JSON body" <url>
or you can also use Advanced REST client (Chrome ext) for making requests

Also, you can access /list/ in your browser directly since it handles GET request and doesn't take any input.

FINAL NOTE:
Let us (backend team) know if there is any unexpected error message / exceptions.