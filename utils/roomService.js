const Room = require("../models/Room");
const Util = require("./Util");
const animalsNameFr = require("../utils/animals_fr")

let rooms = {}
const TIME_TO_RETRY = 10000
function isFieldAdminBoolean(json){
  return json !== undefined && json && typeof json === "object"
    && json.admin !== undefined && json.admin !== null
    && typeof json.admin === "boolean"
}

function chooseRoomName(lang = "fr"){
  let name
  const arr = animalsNameFr.filter(s => Object.keys(rooms).lastIndexOf(s) === -1);
  if(arr.length){
    name = Util.randomElem(arr)
  } else {
    do {
      name = Util.randomElem(arr) + `${Math.floor(Math.random() * 100)}`
    } while (rooms[name] !== undefined)
  }
  return name
}

const service = {
  getUser: (req, res) => {
    const room = rooms[req.params["name"]]
    if (room !== undefined) {
      const user = room.findUserBy(req.params["username"])
      if (user !== undefined) {
        res.send(user)
        return
      }
    }
    res.sendStatus(404)
  },
  updateUser: (req, res) => {
    const userCookie = req.cookies.u;
    const body = req.body
    const room = rooms[req.params["name"]]

    if(room === undefined){
      res.sendStatus(404)
      return
    }
    let user = room.users[req.params["username"]];
    if(user === undefined){
      res.sendStatus(401)
      return
    }
    if(user.privateId === body.privateId
      && body.username !== undefined && body.username && body.username.length){
      user.name = body.username
    } else {
      res.sendStatus(403)
      return
    }
    const currentAdmin = room.findUserBy(userCookie.privateId)
    if(currentAdmin !== undefined && currentAdmin.admin
      && isFieldAdminBoolean(body)){
      room.changeUserAdmin(user)
    } else {
      room.updateUser(user)
    }
    res.sendStatus(200)
  },
  createRoom: (req, res) => {
    let roomName = req.body["room-name"];
    const username = req.body["username"];
    if(roomName === undefined || !roomName.length){
      roomName = chooseRoomName()
    }
    console.log(roomName)
    const keyRoom = roomName.replace(/\s/g, '-')
    let room = rooms[keyRoom];
    let admin = false
    if(room === undefined){
      room = new Room(roomName)
      admin = true
    }

    let user = room.users[username]
    if(user === undefined){
      user = room.createUser(username, admin);
    }

    rooms[keyRoom] = room
    res.cookie("u", user.privateInfo(), {sameSite: "strict", maxAge: 30 * 24 * 3600})
      .redirect("/rooms/" + keyRoom)
  },
  getRoom: (req, res) => {
    let room = rooms[req.params["name"]]
    if(room === undefined){
      res.sendStatus(404)
      return;
    }
    const cookie = req.cookies["u"];
    if(cookie === undefined){
      res.clearCookie().sendStatus(401)
      return;
    }
    let user = room.findUserBy(cookie.privateId);
    if (user === undefined){
      res.sendStatus(403)
      return
    }
    room.clearTimeoutIfExists(user)
    res.render("room", {state: room.state(), user: user})
  },
  openSSE: (req, res) => {
    const room = rooms[req.params["name"]]
    if (room !== undefined && room.users[req.cookies.u.name] !== undefined) {
      let user = room.users[req.cookies.u.name]
      user.httpConnection = res
      room.users[user.name] = user

      const headers = {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/event-stream'
      }
      res.writeHead(200, headers);

      res.write(`\n\n retry: ${TIME_TO_RETRY}\n\n`);

      req.on('close', () => {
        console.log(`${user.privateId} sse closed`);
        room.pendingExit(user)
      });
    } else {
      res.sendStatus(404)
    }
  },
  newSpeech: (req, res) => {
    const room = rooms[req.params["name"]];
    const body = req.body;
    const userCookie = req.cookies.u;
    if(room === undefined) {
      res.sendStatus(404)
      return
    }
    if(body.userId !== userCookie.privateId) {
      res.sendStatus(401)
      return
    }
    room.pushNewSpeechRequest(userCookie.privateId) === -1 ? res.sendStatus(401) : res.sendStatus(201)
  },
  getAllSpeechs: (req, res) => {
    const room = rooms[req.params["name"]];
    if(room === undefined){
      res.sendStatus(404)
      return
    }
    if(room.findUserBy(req.cookies.u.privateId) === undefined){
      res.sendStatus(403)
      return;
    }
    res.json(room.speechs)
  },
  closeCurrentSpeech: (req, res) => {
    const room = rooms[req.params["name"]]
    if(room === undefined){
      res.sendStatus(404)
      return
    }

    const user = room.users[req.cookies['u'].name];
    if(user === undefined || !user.admin){
      res.sendStatus(403)
      return;
    }
    room.pollFirstRequest()
    res.sendStatus(200)
  }
}
module.exports = service
