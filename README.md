# de-crast
Take the "pro" out of procrastination.

Building and Running Instructions
How to run and test our current version of De-Crast fronted:

First, install NodeJS and Ionic according to the instructions on slides 3 and 4 here: https://docs.google.com/presentation/d/1qgip6iJKOP06yRoMFPNgLZCfVkOosg63OTWK1_OpCm0/edit#slide=id.g1c3c317cf2_0_0

Secondly, download our frontend-master branch from https://github.com/timdohm/de-crast/tree/frontend-master

In terminal, `cd` into the De-Crast folder and run `sudo ionic serve --address localhost`
This serve the web app to your web browser for testing. Chrome is recommended..

If you run into any issues (particularly on OSX) you may need to update cordova to version 6.0.

We will need to authorize you to use Facebook with our app, specially we will need either your fbid or your username. Please contact tdohm@wisc.edu or ganders2@wisc.edu

If you wish, you may view the server code by downloading the backend-master branch from:
	https://github.com/timdohm/de-crast/tree/backend-master	

NOTE: Our server is running on an AWS instance, so you will not need to run it locally.

Backend server tag: sprint_two
Frontend server tag: sprint_two_frontend

You can emulate the app using the command: `ionic emulate android`
Or for the iOS emulator: `ionic emulate ios`
Finally, if you wish to download a compiled version of our Android code, you may do so from: https://www.dropbox.com/s/126frbh4ya4le22/android-debug.apk?dl=0 
