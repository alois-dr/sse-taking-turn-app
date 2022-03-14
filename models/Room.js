const Util = require("../utils/Util")
const User = require("./User")
const {NewUserEvent, UserQuitEvent, NewSpeechRequestEvent, CloseCurrentSpeechEvent, UpdateUserEvent} = require("./Event");
const SpeechRequest = require("./Request");

class Room {
  static PENDING_EXIT_TIMEOUT = 10000
  constructor(name) {
    this.name = name
    this.users = {}
    this.speechs = []
    this.pendingExits = {}
    this.indexSpeechs = 0
  }
  state(){
    return {
      roomName: this.name,
      users: Object.values(this.users).map(u => u.name),
      speechs: this.speechs
    }
  }
  pushNewSpeechRequest(userPrivateId){
    const user = this.findUserBy(userPrivateId)
    if(user === undefined){
      return -1
    }
    const request = new SpeechRequest(user.name, ++this.indexSpeechs);
    const newIndex = this.speechs.push(request)
    if(newIndex > -1) {
      this.publishEvent(new NewSpeechRequestEvent(request))
    }
    return newIndex
  }
  pollFirstRequest(){
    if(this.speechs.length > 0){
      const request = this.speechs.shift();
      this.publishEvent(new CloseCurrentSpeechEvent(request))
    }
    return this.speechs.length
  }
  createUser = (username, admin = false) => {
    if(this.users[username] === undefined) {
      return this.addUser(new User(username, admin))
    }
    return undefined
  }

  addUser(user) {
    if(this.users[user.name] === undefined) {
      this.users[user.name] = user
      this.publishEvent(new NewUserEvent(user.name))
      return user
    }
    return undefined
  }
  pendingExit(user){
    this.clearTimeoutIfExists(user)
    this.pendingExits[user.name] = setTimeout(() => this.removeUser(user), Room.PENDING_EXIT_TIMEOUT)
  }
  clearTimeoutIfExists(user){
    const timeOut = this.pendingExits[user.name];
    if(timeOut !== undefined){
      clearTimeout(timeOut)
    }
  }
  removeUser(user){
    if(user !== undefined){
      user.sendEvent = null
      delete this.users[user.name]
      if(user.admin){
        this.setNextUserAdmin()
      }
      this.publishEvent(new UserQuitEvent(user.name))
    }
    return this.users[user.name]
  }
  setNextUserAdmin(){
    let newAdmin = Object.values(this.users)[0];
    if(newAdmin !== undefined){
      newAdmin.admin = true
      this.users[newAdmin.name] = newAdmin
      this.publishEventFor(newAdmin.name, new UpdateUserEvent())
    }
  }
  updateUser(user){
    this.users[user.name] = user
    this.publishEvent(new UpdateUserEvent())
  }
  changeUserAdmin(user){
    const currentAdmin = Object.values(this.users).find(u => u.admin)
    this.users[currentAdmin.name].admin = false
    this.users[user.name].admin = true

    this.publishEventFor(currentAdmin.name, new UpdateUserEvent())
    this.publishEventFor(user.name, new UpdateUserEvent())
  }
  findUserBy(privateId){
    return Object.values(this.users).find(u => u.privateId === privateId)
  }
  publishEvent(event){
    if(event === undefined || !event) return
    Object.values(this.users)
      .forEach(user => {
        user.sendEvent(event)
      })
  }
  publishEventFor(username, event){
    if(username === undefined || !username) return
    if(event === undefined || !event) return
    const user = this.users[username];
    if(user !== undefined){
      user.sendEvent(event)
    }
  }
}

module.exports = Room
