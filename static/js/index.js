$(document).ready(function () {
  var socket = io.connect("http://127.0.0.1:5000");
  socket.on("changeAlert", function (data) {
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
  $.ajax({
    url: "/change_status/" + $(this).data("status"),
    type: "GET",
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
  switch (parseInt(status)) {
    case 0:
      // default map position (morocco)
      const defaultPosition = { lat: 31.794525, lng: -7.0849336 };

      // init Map with the default position of the car
      reloadMap(status, defaultPosition);

      // init alert message and color
      initAlertMessage(message, position);
      break;
    case 1 :
    case 2:
      // init Map with the position of the car
      reloadMap(status, position);

      // intit alert message and color
      initAlertMessage(message, position);
      break;
    default:
      console.error(status, position, message);
      break;
  }
}

function reloadMap(status = 0, position) {


  // marke a position
  if (status != 0) {
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

function initAlertMessage(message, position) {
  $(".alert-heading").text(message.title);
  $(".alert-description").text(message.description);
  // remove recent alert class
  $(".alert").attr('class', 'alert')
  $(".alert").addClass("alert-" + message.alertClass);
  $(".car-location #lat").text(position.lat);
  $(".car-location #lng").text(position.lng);
}
