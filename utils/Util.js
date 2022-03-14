
module.exports = class Util {
  static randomId = () => Math.random().toString(36).substring(2, 9)
  static randomElem = (list = []) => {
    const random = Math.floor(Math.random() * list.length);
    return list[random]
  }
}
