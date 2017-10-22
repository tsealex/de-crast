# de-crast
Take the "pro" out of procrastination.

## ISSUE TRACKING 

We are using Github's Issues feature for bug tracking.
Please feel free to submit any and all bugs through this system, following the link below:
	https://github.com/timdohm/de-crast/issues

## TAGS 

Frontend branch tag: frontend_to_qa
Backend  branch tag: to_qa


## Building and Running Instructions 
How to run and test our current version of De-Crast fronted:

First, install NodeJS and Ionic according to the instructions on slides 3 and 4 here: https://docs.google.com/presentation/d/1qgip6iJKOP06yRoMFPNgLZCfVkOosg63OTWK1_OpCm0/edit#slide=id.g1c3c317cf2_0_0

A helpful overview of ionic installation instructions can be found on its website:
	https://ionicframework.com/docs/intro/installation/

Secondly, download our frontend-master branch from https://github.com/timdohm/de-crast/tree/frontend-master

In terminal, `cd` into the De-Crast folder 

We have the following cordova plugins installed that must also be installed via the following commands:

cordova plugin add cordova-plugin-app-event

cordova plugin add cordova-plugin-camera

cordova plugin add cordova-plugin-compat

cordova plugin add cordova-plugin-console

cordova plugin add cordova-plugin-device

cordova plugin add cordova-plugin-inappbrowser

cordova plugin add cordova-plugin-splashscreen

cordova plugin add cordova-plugin-statusbar

cordova plugin add cordova-plugin-whitelist

cordova plugin add de.appplant.cordova.plugin.local-notification

cordova plugin add ionic-plugin-keyboard

cordova plugin add cordova-plugin-fcm

cordova plugin add cordova-plugin-geolocation


You can check which ones you have installed using `cordova plugin`

From the same folder, run `sudo ionic serve --address localhost`
This serve the web app to your web browser for testing. Chrome is recommended..

If you run into any issues (particularly on OSX) you may need to update/downgrade cordova to version 6.0.

We will need to authorize you to use Facebook with our app, specially we will need either your fbid or your username. Please contact tdohm@wisc.edu or ganders2@wisc.edu

If you wish, you may view the server code by downloading the backend-master branch from:
	https://github.com/timdohm/de-crast/
	in the master branch

You can emulate the app using the command: `ionic emulate android`
Or for the iOS emulator: `ionic emulate ios`

The project can be run in the browser via: `ionic serve`

NOTE: Push notifications will only work on mobile devices. Push notifications are not supported in the browser
version of our application.

Finally, if you wish to download a compiled version of our Android code, you may do so from: https://drive.google.com/open?id=0Bw-Msnfg9-lzaXpFWDlOTGRJOEE

## BACKEND INFO 

NOTE: Our server is running on an AWS instance, so you will not need to run it locally.

To build the server code and run it locally (this is NOT mandatory):

- You will need to install the following python modules:
	- pyfcm, pymagic, djangorestframework, django-cors-headers
	- If you run into any other import issues, please install the asked-for modules in the error message.
	- NOTE: The server is intended to be run on a Linux machine. Attempting to run the
		server on a Windows machine may lead to unpredictable results with the pymagic module.

- To run the server, navigate to the local folder containing the manage.py script (<install_loc>/de-crast/decrast_server/), and run the following:
		1) `python manage.py migrate`
		2) `python manage.py runserver`

- This should launch a server instance at localhost:8000, and thus all URL's should be relative to this address for running API calls.
