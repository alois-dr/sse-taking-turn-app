function resetCookie(){
  document.cookie = ''
}

async function join(){
  const form = document.querySelector("form")
  const username = form["username"].value
  const roomName = form["room-name"].value
  const res = await fetch("/rooms/" + roomName + "/users/" + username, {method: "GET", headers: {}})
  if(res.status === 200){
    let error = document.getElementById("error-username")
    setTimeout(() => error.innerHTML = "", 3000)
    error.innerHTML = "Pseudo déjà utilisé"
    error.style.color = 'red'
  } else {
    form.submit()
  }
}
