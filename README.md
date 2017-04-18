# de-crast
Take the "pro" out of procrastination.

ISSUE TRACKING ===================
We are using Github's Issues feature for bug tracking.
Please feel free to submit any and all bugs through this system, following the link below:
	https://github.com/timdohm/de-crast/issues

Building and Running Instructions
How to run and test our current version of De-Crast fronted:

First, install NodeJS and Ionic according to the instructions on slides 3 and 4 here: https://docs.google.com/presentation/d/1qgip6iJKOP06yRoMFPNgLZCfVkOosg63OTWK1_OpCm0/edit#slide=id.g1c3c317cf2_0_0


Secondly, download our frontend-master branch from https://github.com/timdohm/de-crast/tree/frontend-master

In terminal, `cd` into the De-Crast folder 

We have the following cordova plugins installed that must also be installed:
cordova-plugin-app-event 1.2.0 "Application Events"

cordova-plugin-camera 2.4.0 "Camera"

cordova-plugin-compat 1.1.0 "Compat"

cordova-plugin-console 1.0.6 "Console"

cordova-plugin-device 1.1.5 "Device"

cordova-plugin-inappbrowser 1.7.0 "InAppBrowser"

cordova-plugin-splashscreen 3.1.0 "Splashscreen"

cordova-plugin-statusbar 2.1.3 "StatusBar"

cordova-plugin-whitelist 1.2.2 "Whitelist"

de.appplant.cordova.plugin.local-notification 0.8.4 "LocalNotification"

ionic-plugin-keyboard 2.2.1 "Keyboard"


You can check which ones you have installed using `cordova plugin`
You can use the command `cordova plugin add cordova-plugin-inappbrowser` for example.

From the same folder, run `sudo ionic serve --address localhost`
This serve the web app to your web browser for testing. Chrome is recommended..

If you run into any issues (particularly on OSX) you may need to update/downgrade cordova to version 6.0.

We will need to authorize you to use Facebook with our app, specially we will need either your fbid or your username. Please contact tdohm@wisc.edu or ganders2@wisc.edu

If you wish, you may view the server code by downloading the backend-master branch from:
	https://github.com/timdohm/de-crast/
	in the master branch

You can emulate the app using the command: `ionic emulate android`
Or for the iOS emulator: `ionic emulate ios`
Finally, if you wish to download a compiled version of our Android code, you may do so from: https://drive.google.com/file/d/0Bw-Msnfg9-lzaXpFWDlOTGRJOEE/view



NOTE: Our server is running on an AWS instance, so you will not need to run it locally.

To build the server code and run it locally (this is NOT mandatory):

- You will need to install the following python modules:
	- pyfcm, pymagic, djangorestframework
	- NOTE: The server is intended to be run on a Linux machine. Attempting to run the
					server on a Windows machine may lead to unpredictable results with the pymagic module.

- To run the server, navigate to the local folder containing the manage.py script (<install_loc>/de-crast/decrast_server/), and run the following:
		"python manage.py runserver"

- This should launch a server instance at localhost:8000, and thus all URL's should be relative to this address for running API calls.
