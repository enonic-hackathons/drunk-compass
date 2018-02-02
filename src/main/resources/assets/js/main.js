require('../css/styles.less');

var ws = {
    connected: false,
    connection: null,
    keepAliveIntervalId: null
};

var isDrunk = function () { return true; }

(function () {
    window.onload = function () {
        const mainContainer = document.getElementById("main-container");

        if (!mainContainer) {
            return;
        }


        const status = document.getElementById('switch-1');
        isDrunk = () => status.checked;
        const statusValue = document.getElementsByClassName('user__status')[0];

        status.onchange = () => {
          const value = isDrunk() ? 'Drunk' : 'Sober';
          statusValue.innerHTML = value;
          console.log(value);
        }

        wsConnect();

        setInterval(function () {
          navigator.geolocation.getCurrentPosition(success, error, geoOptions);
        }, 2 * 1000);

    };
})();


function wsConnect() {
    console.log("Connecting to WS");
    ws.connection = new WebSocket(wsUrl, ['result']);
    ws.connection.onopen = onWsOpen;
    ws.connection.onclose = onWsClose;
    ws.connection.onmessage = onWsMessage;

}

function onWsOpen() {

    console.log("Connected to WS");

    ws.keepAliveIntervalId = setInterval(function () {
        if (ws.connected) {
            ws.connection.send('{"action":"KeepAlive"}');
        }
    }, 10 * 1000);
    ws.connected = true;
}

function onWsClose() {
    console.log("Im closing the connection: ");
    clearInterval(ws.keepAliveIntervalId);
    ws.connected = false;

    setTimeout(wsConnect, 2000);
}

function onWsMessage(event) {
    var message = JSON.parse(event.data);
    console.log("Message --> received: ", message);
}

var send = function (data) {
    ws.connection.send(JSON.stringify(data));
};

var geoOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;

  send({
      latitude: crd.latitude,
      longitude: crd.longitude,
      drunk: isDrunk()
  })

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
