const Util = require("../utils/Util");
class User {
  constructor(name, admin = false) {
    this.privateId = Util.randomId()
    this.name = name
    this.admin = admin
    this.httpConnection = null
  }
  privateInfo = () => ({privateId: this.privateId, name: this.name})
  sendEvent(event) {
    if(this.httpConnection !== null){
      this.httpConnection.write(event.format())
    }
  }
}
module.exports = User
