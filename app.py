from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins='*')

# get Message Text By Status
def getMessage(status):
    message = {
        # success green / danger red / warning yellow
        "alertClass": "",
        # Alert Title
        "title": "",
         # Alert Description
        "description": ""
    }
    print(type(status))
    if status == '0':
        message['title'] = "ALL GOOD"
        message['description'] = "Whenever you need to, ALL GOOD be sure to use margin utilities to keep things nice and tidy."
        message['alertClass'] = "success"
    elif status == '1':
        message['title'] = "ERROR"
        message['description'] = "Whenever you need to, ERROR be sure to use margin utilities to keep things nice and tidy."
        message['alertClass'] = "danger"
    else:
        message['title'] = "WARNING"
        message['description'] = "Whenever you need to, WARNING be sure to use margin utilities to keep things nice and tidy."
        message['alertClass'] = "warning"
    
    return message

# get the current car position 
def getCurrentPosition(status = 0):
    defaultposition = { "lat": 31.794525, "lng":  -7.0849336 }
    if status != 0:
        defaultposition = { "lat": 31.794525, "lng":  -7.0849336 }
    return defaultposition


@app.route("/")
def index():
    return render_template('home/index.html')

@app.route("/change_status/<status>")
def changeStatus(status):
    # get car localisation
    position   = getCurrentPosition(status)
    # get message by status code
    message = getMessage(status)
    
    data = {
        "status" :  status,
        "message": message,
        "position" : position
    }

    # emit for update front data
    socketio.emit("changeAlert", data)

    return jsonify(True)

@app.route("/current_status")
def getCurrentStatus():
    # TOODE - replaec by original get current status function
    current = "0"
    # get car localisation
    position   = getCurrentPosition(current)
    # get message by status code
    message = getMessage(current)
    data = {
        "status" :  current,
        "message": message,
        "position" : position
    }
    print(data)

    return jsonify(data)

@socketio.on('changeAlert')
def handleAlertChange(msg):
	send(msg, broadcast=True)



if __name__ == '__main__':
    	socketio.run(app)