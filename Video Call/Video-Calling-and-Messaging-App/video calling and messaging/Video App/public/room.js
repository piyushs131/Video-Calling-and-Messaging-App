// estabishing socket connection with backend
const socket = io('/');

// accessing all the elments that will be required
const videoGrid = document.getElementById('video-grid')
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let sendLocation = document.getElementById("showLocation");
let messages = document.querySelector(".messages");
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const endCall=document.querySelector("#endCall");
const speech=document.querySelector('#speech');

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

// loading ting voice
var audio = new Audio('/assets/ting.mp3');

// establishing peer connection
const myPeer = new Peer(undefined, {
  host: '/',
  port: '5001'
});

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
// for accessing mediaDevices like camera and mic
navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)

  // initiating peer call
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  // initiating socket connection
  socket.on('user-connected', userId => {
    audio.play();
    console.log("User Connected " + userId)
    connectToNewUser(userId, stream)
  })
})

// disconnecting user 
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  audio.play();
  
})
//starting peer connection
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id,username)
})

// function for connecting to new User
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

// function for adding video stream to currnt video element
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  console.log('person added');
}

// for sending new message 
send.addEventListener("click", (e) => {
  chatWindowScrollDown.scrollTop=chatWindowScrollDown.scrollHeight;
  if (text.value.length !== 0&&rec===false) {
      socket.emit("message", text.value);
      text.value = "";
  }else if(text.value.length !== 0){
      socket.emit("message", transcript);
      text.value = "";
  }
});

// for entering text in the chat
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0&&rec===false) {
    socket.emit("message", text.value);
    text.value = "";
  }
  else if(e.key === "Enter" && text.value.length !== 0){
    socket.emit("message", transcript);
    text.value = "";
  }
});

//  for implementing Voice to Text feature -------------------------------------------
// for accessing mic
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const recorder= new SpeechRecognition();
recorder.onstart=()=>{
    console.log('Voice Activated');    
}

var transcript;
recorder.onresult=(event)=>{
  const resultIndex = event.resultIndex;
  transcript = event.results[resultIndex][0].transcript;
  console.log(transcript);
  text.value=transcript;
}
var rec=false;
speech.addEventListener("click",()=>{
  text.focus();
  rec=!rec;
  recorder.start();
})
// --------------------------------------------------------------------------------------

// for implmenting feature of stopping video and muting mic -----------------------------
muteButton.addEventListener("click", () => {
  console.log('mute clicked')
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});
// ----------------------------------------------------------------------------------

// for copying room code to the clipboard
inviteButton.addEventListener("click", (e) => {
    var dummy = document.createElement('input'),
    text = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    alert('Code copied');
});

// for getting location of the user
sendLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser.')
  }
  navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('sendLocation', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
      })
  })
})

// for exiting the call
endCall.addEventListener("click",(e)=>{
  window.location.href="http://localhost:5000/dashboard";
})

// for creating new text message
socket.on("createMessage", (message) => {
  if(rec)
  {
    messages.innerHTML =
      messages.innerHTML +
      `<div class="message">
          <b><span> ${
            message.username === username ? "me" : message.username
          }</span> </b>
          <div class="textmsg">
            ${transcript}
          <div class="time">
          ${moment(message.createdAt).format('h:mm a')}
          </div>
        </div>
        
      </div>`;}
  else
  {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><span> ${
          message.username === username ? "me" : message.username
        }</span> </b>
        <div class="textmsg">
          ${message.text}
        <div class="time">
        ${moment(message.createdAt).format('h:mm a')}
        </div>
      </div>
      
    </div>`;}
  chatWindowScrollDown.scrollTop=chatWindowScrollDown.scrollHeight;
rec=false;
});

// for sending location in the chat
socket.on("locationMessage", (message) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><span> ${
          message.username === username ? "me" : message.username
        }</span> </b>
        <div class="textmsg">
          <a href="${message.url}" target="_blank"> ${message.url}</a>
        <div class="time">
        ${moment(message.createdAt).format('h:mm a')}
        </div>
      </div>
      
    </div>`;
  chatWindowScrollDown.scrollTop=chatWindowScrollDown.scrollHeight;

});

// for implementing scroll down feature in the chat
var chatWindowScrollDown=document.getElementsByClassName('main__chat_window')[0];