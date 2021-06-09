$(document).ready(function () {
  var socket = io.connect("http://webapp.local:5000");
  socket.on("changeAlert", function (data) {
    console.log("🚀 ~ file: index.js ~ line 17 ~ getCurrentStatus ~ data.message", data.message)
    console.log("🚀 ~ file: index.js ~ line 17 ~ getCurrentStatus ~ data.status", data.status)
    changeStatus(data.status, data.position, data.message);
  });
});
function getCurrentStatus() {
  // get current status
  $.ajax({
    url: "/current_status",
    type: "GET",
    beforeSend() {
      $(".alert-container").addClass("alert-loading");
    },
    success: function (data) {
      changeStatus(data.status, data.position, data.message);

    },
    error: function (data) {
      console.log(data);
    },
    complete: function () {
      $(".alert-container").removeClass("alert-loading");
    },
  });
}

// handle change status buttons
$(".change-status-button").on("click", function (e) {
  e.preventDefault();
  data = {
    "temp" : 0,
    "gas" : 0,
    "acc" : 0
  }
  $.ajax({
    url: "/change_status",
    type: "POST",
    data,
    beforeSend() {
      $(".alert-container").addClass("alert-loading");
    },
    error: function (data,error) {
      console.log(error, data);
    },
    complete: function () {
      $(".alert-container").removeClass("alert-loading");
    },
  });
});

// change the car status
function changeStatus(status, position, message) {
  generalStatus = Object.keys(status).filter((item) => parseInt(status[item]))

  if (generalStatus.length > 0) {
    reloadMap(status, position);
    initAlertMessage(message, position, false);
  } else {
    reloadMap(generalStatus.length, position);
    initAlertMessage(message, position, true);
  }
}

function reloadMap(status, position) {
  // marke a position
  if (status) {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: position,
    });
    const image = "../../static/images/crash.png";
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: image,
    });
  } else {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: position,
    });
  }
}

function initAlertMessage(message, position, isDefault) {
  $('.alert-container').html(getAlertHtml(message, position, isDefault));
}




function getAlertHtml(message, position, isDefault) {

  let alertHtml = getStatusContent(message);
  alertHtml += !isDefault ? getLocationHtml(position) : '' ;

  return alertHtml;
}

function getLocationHtml(position) {
  return  `<div class="car-location">
              <h3>Location</h3>
              <ul class="list-group">
                <li class="list-group-item list-group-item-info">
                  <span class="font-weight-bold">Lat</span> =
                  <span class="font-italic" id="lat">${position.lat}</span>
                </li>
                <li class="list-group-item list-group-item-info">
                  <span class="font-weight-bold">Lng</span> =
                  <span class="font-italic" id="lng"></span>${position.lng}</span>
                </li>
              </ul>
            </div>`
}

function getStatusContent(messages) {
  let statusContent = '<ul class="list-group">';
  Object.keys(messages).forEach(message => {
    statusContent += `<div class="alert alert-${messages[message].alertClass}">
                        <h3 class="alert-heading">${messages[message].title}</h3>
                        <p class="alert-description mb-5">${messages[message].description}</p></div>`;
  });

  return statusContent;
}

function getAlertClass(message) {
  console.log("🚀 ~ file: index.js ~ line 156 ~ getAlertClass ~ message", message)
  const isAcc = Object.keys(message).filter(item => item === 'acc');

  if(isAcc.length) {
    return message?.acc?.alertClass
  }

  return message?.temp?.alertClass ||  message?.gas?.alertClass;
}