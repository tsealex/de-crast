###################################
#	NOTE: FOR TESTING PURPOSES ONLY
###################################

import SimpleHTTPServer
import SocketServer
import json
import sys

# Defaulted to something just in case
PORT = 1818
USER = 8

#Text file names to read
TASK_TABLE_FILE = "user_tasks.csv"

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
	userID = 8

	@staticmethod
	def setUserId(uid):
		userID = uid

	def applyStandardHeaders(self):
			self.send_response(200)
			self.send_header('Content-type', 'text/json')
			self.end_headers()


	def do_GET(self):

		q_mark_index = self.path.find('?')

		URL = ""
		if (q_mark_index >= 0):
			URL = self.path[0:q_mark_index]
		else:
			URL = self.path

		print("URL: " + URL)

		query_params = None
		if(q_mark_index >= 0):
			query_params = self.path[q_mark_index+1:]
			print("Params: " + query_params)

		# Handle the '/user/tasks/' API call.
		if(URL == '/user/tasks/'):
			if(query_params):
				json_to_send = self.jsonForTask(query_params)
			else:
				json_to_send = self.jsonForUserTaskIDs()

			print("Sending: " + str(json_to_send))

			# Send the HTML message
			self.applyStandardHeaders()
			self.wfile.write(str(json_to_send))

			return



	def jsonForUserTaskIDs(self):
		task_ids = []
		str_list = ""

		print("Fetching task IDs for user " + str(Handler.userID));
		try:

			# Parse through the task table file, and add all the task
			# IDs to our task ID list on lines where uid == Handler.UserId
			with open("./" + TASK_TABLE_FILE) as file:
				for line in file:

					if(line[0] == '#'):
						continue

					print("Splitting: " + line)
					spl = line.split(",")

					if(len(spl) < 3):
						continue

					print("Split len: " + str(len(spl)))
					if(int(spl[1]) == Handler.userID):
						task_ids.append(int(spl[0]))

			# Turn the ID list into a comma-delimited string.
			for x in range(len(task_ids)):
				str_list += (str(task_ids[x]) + ",")

			# Trim the last comma off the end of the string and
			# return a json representation of the taskIDs.
			return json.dumps({'size': str(len(task_ids)),  'ids': str_list[:-1]})

		except(IOError):
			print("ERROR: Could not open expected file: " + TASK_TABLE_FILE)



	# TODO: Make this handle lists of taskIDs ...
	def jsonForTask(self, params):
		task_ids = []
		str_list = ""

		print("Fetching task " + params);
		try:

			taskID = int(params)

			# Parse through the task table file, and add all the task
			# IDs to our task ID list on lines where uid == Handler.UserId
			with open("./" + TASK_TABLE_FILE) as file:
				for line in file:

					if(line[0] == '#'):
						continue

					spl = line.split(",")

					if(len(spl) < 3):
						continue


					if(int(spl[0]) == taskID):
						return json.dumps({'type':'task', 'id':str(taskID),
						'name':spl[2], 'deadline':spl[3], 'description':spl[4]
						, 'category':spl[5][:-1]})

		except(IOError):
			print("ERROR: Could not open expected file: " + TASK_TABLE_FILE)

# ==================== END OF CLASS : Handler ====================


# Parse out port number to use.
if(len(sys.argv) < 3):
	print("USAGE: test_server.py <PORT> <USER_ID>")
else:
	PORT = int(sys.argv[1])
	USER = int(sys.argv[2])
	if(PORT < 1024):
		print("NOTICE: Port " + str(PORT) + " is below 1024 ... tread lightly");

Handler.setUserId(USER)
httpd = SocketServer.TCPServer(("", PORT), Handler) # Can also use ForkingTCPServer
print("serving at port", PORT)
httpd.serve_forever()
