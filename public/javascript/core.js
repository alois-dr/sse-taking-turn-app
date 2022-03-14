const data = {
  cookie: {
    privateId: '',
    name:''
  },
  roomPath: ''
}

let headers = new Headers()
headers.append("Content-Type", "application/json")

function init(){
  storeCookie()
  storeRoomPath()
  startSSE()
}

function storeCookie(){
  const matches = decodeURIComponent(document.cookie).match(/u=j:(.+)/);
  if(matches.length > 1){
    data.cookie = JSON.parse(matches[1])
  }
}
function storeRoomPath() {
  data.roomPath = location.pathname
}

function askForSpeech(button){
  button.blur()
  const options = {
    credentials: "same-origin",
    method: "POST",
    headers: headers,
    body: JSON.stringify({userId: data.cookie.privateId})
  }

  fetch(`${data.roomPath}/speechs`, options)
}
function nextCurrentSpeech(button){
  button.blur()
  const options = {
    credentials: "same-origin",
    method: "DELETE",
    headers: headers
  }
  fetch(`${data.roomPath}/speechs/current`, options)
}

function click(){
  console.log("truc")
}
