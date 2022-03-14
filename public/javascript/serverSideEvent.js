const NEW_USER = "new-user"
const USER_QUIT = "user-quit"
const NEW_SPEECH_REQUEST = "new-speech-request"
const CLOSE_CURRENT_SPEECH = "close-current-speech"
const NEW_ADMIN = "new-admin"

function startSSE(){
  const source = new EventSource(`${location.pathname}/sse`, { withCredentials: true } );
  source.onopen = e => console.log("sse open")
  source.addEventListener(NEW_USER, addNewUser, false);
  source.addEventListener(NEW_SPEECH_REQUEST, addNewSpeechRequest, false);
  source.addEventListener(USER_QUIT, userQuit, false);
  source.addEventListener(CLOSE_CURRENT_SPEECH, closeCurrentSpeech, false);
  source.addEventListener(NEW_ADMIN, reload, false);
}

function addNewSpeechRequest(event) {
  const speech = JSON.parse(event.data)
  addSpeech(speech.username, speech.id)
}

function addSpeech(username, id){
  const list = document.getElementById("speech-list");
  let li = document.createElement("li")
  li.id = `${username}_${id}`
  let globalContainer = document.createElement("div")

  let newIdElem = document.createElement("span")
  newIdElem.className = "index-speech"
  newIdElem.innerHTML = `${id}.`

  let usernameContainer = document.createElement("div")
  usernameContainer.className = "speech"

  let usernameElem = document.createElement("span")
  usernameElem.innerHTML = username

  let closeSpeech = document.createElement("span")
  closeSpeech.className = "close"
  // closeSpeech.onclick =
  closeSpeech.innerHTML = "&#10060";

  usernameContainer.appendChild(usernameElem)
  usernameContainer.appendChild(closeSpeech)

  globalContainer.appendChild(newIdElem)
  globalContainer.appendChild(usernameContainer)

  li.appendChild(globalContainer)
  list.appendChild(li)
}
function closeCurrentSpeech(event){
  const opt = {
    headers: headers,
    method: "GET"
  }
  fetch(`${data.roomPath}/speechs`, opt)
    .then(res => {
      if(res.status === 200) return res.json()
    })
    .then(speechs => {
      const speechList = document.getElementById("speech-list");

      while (speechList.firstChild) {
        speechList.removeChild(speechList.lastChild);
      }
      for (let speech of speechs){
        addSpeech(speech.username, speech.id)
      }
    })

}
function addNewUser(event){
  const username = JSON.parse(event.data);
  const list = document.getElementById("user-list");
  let li = document.createElement("li")
  li.textContent = username
  li.id = username
  list.appendChild(li)
}
function userQuit(event) {
  const username = JSON.parse(event.data)
  document.getElementById(username).remove()
}
function reload(event){
  location.reload()
}
