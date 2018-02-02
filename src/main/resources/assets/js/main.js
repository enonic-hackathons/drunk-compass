require('../css/styles.less');

var ws = {
    connected: false,
    connection: null,
    keepAliveIntervalId: null
};

(function () {
    window.onload = function () {
        const mainContainer = document.getElementById("main-container");

        if (!mainContainer) {
            return;
        }


        const toggleOnlineStatus = function () {
            mainContainer.classList.toggle("online", navigator.onLine);
            mainContainer.classList.toggle("offline", !navigator.onLine);
        };

        toggleOnlineStatus();

        window.addEventListener("offline", toggleOnlineStatus);
        window.addEventListener("online", toggleOnlineStatus);

        wsConnect();
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

    setTimeout(wsConnect, 2000); // attempt to reconnect
}

function onWsMessage(event) {
    var message = JSON.parse(event.data);
    console.log("Message --> received: ", message);
}

var positionUpdated = function () {
    send({
        positon: "-34,53",
        drunk: true
    })
};


var send = function (data) {

    ws.connection.send(JSON.stringify(data));
};
