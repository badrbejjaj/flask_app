from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins='*')

def getStatusMessage(status = 'default'):
    message = {
        'default' : {
            "alertClass": "success",
            "title": "Lorem ipsum is placeholder text",
            "description": "orem Ipsum is simply dummy text of the printing and typesetting industry."
        },
        'temp' : {
            "alertClass": "warning",
            "title": "Temperature is High",
            "description": "orem Ipsum is simply dummy text of the printing and typesetting industry."
        },
        'acc' : {
            "alertClass": "danger",
            "title": "Voiture est sortie",
            "description": "orem Ipsum is simply dummy text of the printing and typesetting industry."
        },
        'gas' : {
            "alertClass": "warning",
            "title": "Niveau de Gaz est tres haut",
            "description": "orem Ipsum is simply dummy text of the printing and typesetting industry."
        }
    }

    return message[status]

# get Message Text By Status
def getMessages(status):
    message = {}

    for s, value in status.items():
        print(type(value))
        if int(value):
            message[s] = getStatusMessage(s)

    if len (message) > 0:
        return message

    message['default'] = getStatusMessage()
    return message

# get the current car position
def getDefaultPosition():
    defaultposition = { 
        "lat": 31.794525, 
        "lng":  -7.0849336 
    }
    return defaultposition

@app.route("/")
def index():
    return render_template('home/index.html')

@app.route("/change_status", methods=['POST'])
def changeStatus():
    print(request.form)
    status = {
        "temp" : request.form['temp'],
        "acc" : request.form['acc'],
        "gas" : request.form['gas']
    }

    location = {
        "lat" : float(request.form['lat']),
        "lng" : float(request.form['lng']),
    }

    # get car localisation
    position = int(request.form['currentStatus']) and location or getDefaultPosition()

    # get message by status code
    message = getMessages(status)

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

    current = {
        "temp" : 0,
        "acc" : 0,
        "gas" : 0
    }

    # get car localisation
    position = getDefaultPosition()
    # get message by status code
    message = getMessages(current)

    data = {
        "status" :  current,
        "message": message,
        "position" : position
    }

    return jsonify(data)

@socketio.on('changeAlert')
def handleAlertChange(msg):
	send(msg, broadcast=True)



if __name__ == '__main__':
    	socketio.run(app)