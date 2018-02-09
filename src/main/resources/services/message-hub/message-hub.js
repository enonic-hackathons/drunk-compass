var webSocketLib = require('/lib/xp/websocket');
var channel = 'result';

function handleGet(req) {

    if (!req.webSocket) {
        return {
            status: 404
        };
    }

    return {
        webSocket: {
            data: {},
            subProtocols: ["result"]
        }
    };
}


function sendToGroup(channel, message) {
    var msg = JSON.stringify(message);
    webSocketLib.sendToGroup(channel, msg);
}

function handleEvent(event) {

    if (event.type === 'open') {
        connect(event);
    }

    if (event.type === 'message') {
        handleWsMessage(event);
    }

    if (event.type === 'close') {
        leave(event);
    }
}

function connect(event) {
    webSocketLib.addToGroup(channel, getSessionId(event));
    sendToGroup(channel, "Connected: %s" + JSON.stringify(event));
}

function handleWsMessage(event) {
    var message = JSON.parse(event.message);

    //log.info("MESSAGE: %s", JSON.stringify(message));

    /* if (message.action == 'join') {
         join(event, message.avatar);
         return;
     }

     if (message.action == 'chatMessage') {
         if (message.message.toLowerCase() == 'info') {
             sendInfoMessage(event);
         }
         else {
             handleChatMessage(event, message);
         }
         return;
     }
     */

    webSocketLib.sendToGroup(channel, JSON.stringify(message));
}

function leave(event) {
    var sessionId = getSessionId(event);
    sendToGroup(channel, "Disconnected: %s" + JSON.stringify(event))
    websocketLib.removeFromGroup(chatGroup, sessionId);

}

function getSessionId(event) {
    return event.session.id;
}

exports.webSocketEvent = handleEvent;
exports.get = handleGet;