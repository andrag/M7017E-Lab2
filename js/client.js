/**
 * Created by Anders on 2016-02-11.
 */

var localVid, remoteVid, peerConnection;
var peerConnectionArgs = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

var constraints = {
    audio: true,
    video: true
};

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkit.getUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCRTCIceCandidate = window.RTCRTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;



//---------------------------------------------Getting the local media stream-------------------------------------------


function pageLoaded(){
    localVid = document.getElementById('localVid');
    remoteVid = document.getElementById('remoteVid');

    serverConnection = new WebSocket('ws://100.67.23.69:3434');//Use the IP of the server here
    serverConnection.onmessage = handleIncomingMessage;


    //If it doesn't work, try the traditional approach
    if(navigator.getUserMedia){//Or navigator,MediaDevices.getUserMedia, or just navigator.getUserMedia
        navigator.mediaDevices.getUserMedia(constraints)
            .then(onMediaSuccess)
            .catch(function(error){
                //Do some logging
                console.error(error);
            })
    } else {
        alert("This browser doesn't support the getUserMedia API.");

    }
}

function onMediaSuccess(stream){
    localStream = stream;
    localVid.src = window.URL.createObjectURL(stream);
}

//-------------------------------Communication of signalling and SDP messages through the server------------------------

function call(){
    peerConnection = new RTCPeerConnection(peerConnectionArgs);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    peerConnection.createOffer(gotDescription, logError);//Maybe an if statement for checking who is the caller?
}

//Test this
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
                peerConnection.createAnswer(gotDescription, logError());},
            logError());
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

function gotDescription(description){
    peerConnection.setLocalDescription(description, onSetDescription, function() {console.log('Failed setting local description')});
}

function onSetDescription(description){
    serverConnection.send(JSON.stringify({'sdp': description}));
}

function gotRemoteStream(event){
    remoteVid.src = window.URL.createObjectURL(event.stream);
}

function logError(error){
    console.log(error);
}



