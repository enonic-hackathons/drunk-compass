require('../css/styles.less');

var ws = {
    connected: false,
    connection: null,
    keepAliveIntervalId: null
};

var isDrunk = () => true;
var getName = () => '';
var setPosition = () => {};
var getRandomName = () => '';
var currentCoords = () => {};

window.onload = function () {
    const mainContainer = document.getElementById("main-container");

    if (!mainContainer) {
        return;
    }

    const status = document.getElementById('switch-1');
    isDrunk = function () { return status.checked; };
    const statusValue = document.getElementsByClassName('user__status')[0];

    const userName = document.getElementById('user__name');
    getName = () => userName.value

    const userPosition = document.getElementsByClassName('user__position')[0];
    setPosition = (latitude, longitude) => {
      userPosition.innerHTML = `${latitude} ${longitude}`
    };

    generateRandomName();

    status.onchange = () => {
      const value = isDrunk() ? 'Drunk' : 'Sober';
      statusValue.innerHTML = value;
    }

    wsConnect();

    setInterval(function () {
      navigator.geolocation.getCurrentPosition(success, error, geoOptions);
    }, 2 * 1000);

};


function generateRandomName(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET','https://frightanic.com/goodies_content/docker-names.php', true);
  xhr.send();
  xhr.addEventListener("readystatechange", setRandomName, false);
}

function setRandomName(e){
 if (e.target.readyState === 4){
  getRandomName = () => e.target.responseText;
  var userName = document.getElementById('user__name');
  if (!userName.value){
    userName.value = getRandomName();
  }
 }
}

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

/*https://www.movable-type.co.uk/scripts/latlong.html*/

function onWsMessage(event) {
    var message = JSON.parse(event.data);
    console.log("Message --> received: ", message);  
    if (message.randomName!==undefined && message.drunk!==undefined){
      var distance = getDistanceFromLatLonInKm(currentCoords.latitude, currentCoords.longitude, message.latitude, message.longitude);
      var randomName = message.randomName.trim();
      var list = document.querySelector("#personList");
      if (!document.listTemplate){
        document.listTemplate = '<div>Loading...</div>';
      }
      var newItem = listTemplate
      .replace(/{userName}/g, message.name)
      .replace(/{randomName}/g, randomName)
      .replace(/{drunk}/g, (message.drunk?'Yes':'No'))
      .replace(/{position}/g, (message.latitude + ',' + message.longitude));
      if (distance){
       newItem = newItem.replace(/{distance}/g, distance); 
      }
      
      var newItemHtml = createElementFromHTML(newItem).querySelector("tr");
      
      var existingItem = document.querySelector("#"+randomName);
      if (!existingItem){
        list.appendChild(newItemHtml); 
      }else{
        list.replaceChild(newItemHtml,existingItem);
      }
      //console.log(message.name + ' is ' + (message.drunk?'drunk':'sober'));
    }
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d*1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/*function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}*/

function createElementFromHTML(htmlString) {
  var frag = document.createRange().createContextualFragment(htmlString).firstChild;
  //var doc = new DOMParser().parseFromString(htmlString,'text/html').body.firstChild;
  return frag; 
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
  currentCoords = pos.coords;

  setPosition(crd.latitude, crd.longitude);
  var randomName = getRandomName();
  if (randomName !== ''){
    send({
        latitude: crd.latitude,
        longitude: crd.longitude,
        name: getName(),
        drunk: isDrunk(),
        randomName: randomName
    })
  }

  /*console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);*/
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
