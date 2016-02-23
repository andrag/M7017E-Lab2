

var localVid, remoteVid, peerConnection;
var peerConnectionArgs = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

var constraints = {
    audio: true,
    video: true
};
//ws://100.67.23.69:3434 Anders IP
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkit.getUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;



//---------------------------------------------Getting the local media stream-------------------------------------------

var serverIP = 'ws://localhost:3434';

function setIP(){
    //No error check made
    var text = document.getElementById('serverIP');
    serverIP = text.value;
    text.value = "";

    console.log('Server IP address: ', serverIP);

    startButton = document.getElementById('startButton');
    setIPButton = document.getElementById('ipButton');
    setIPButton.disabled = true;
    startButton.disabled = false;
}


function start(){

    localVid = document.getElementById('localVid');
    remoteVid = document.getElementById('remoteVid');

    serverConnection = new WebSocket(serverIP);//Use the IP of the server here

    serverConnection.onmessage = handleIncomingMessage;

    if(navigator.getUserMedia){
        navigator.mediaDevices.getUserMedia(constraints)
            .then(onMediaSuccess)
            .catch(function(error){
                console.error(error);
            })
    } else {
        alert("This browser doesn't support the getUserMedia API.");

    }

    startButton.disabled = true;
    callButton = document.getElementById('callButton');
    callButton.disabled = false;
}

function onMediaSuccess(stream){
    localStream = stream;
    localVid.src = window.URL.createObjectURL(stream);
}

//-------------------------------Communication of signaling and SDP messages through the server------------------------

function call(){

    peerConnection = new RTCPeerConnection(peerConnectionArgs);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    peerConnection.createOffer(gotDescription, logError);
}


function recieveCall(){
    peerConnection = new RTCPeerConnection(peerConnectionArgs);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);
}

//Handle incoming SDP and ICE signaling messages
function handleIncomingMessage(message){
    if(!peerConnection) recieveCall();

    var signal = JSON.parse(message.data);
    if(signal.sdp){
        peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.sdp),
            function() {
                peerConnection.createAnswer(gotDescription, logError);},
            logError);
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
}

//Send ICE candidates via the signalling server to the remote peer
function gotIceCandidate(event){
    if(event.candidate != null){
        serverConnection.send(JSON.stringify({'ice': event.candidate}));
    }
}

function gotDescription(description) {
    console.log('got description');
    peerConnection.setLocalDescription(description, function () {
        serverConnection.send(JSON.stringify({'sdp': description})) ;
    }, function() {console.log('set description error')});
}


function gotRemoteStream(event){
    remoteVid.src = window.URL.createObjectURL(event.stream);
}

function logError(error){
    console.log(error);
}





