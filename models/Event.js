class SSEEvent {
  static NEW_USER = "new-user"
  static USER_QUIT = "user-quit"
  static NEW_SPEECH_REQUEST = "new-speech-request"
  static SELECT_REQUEST = "select-request"
  static CLOSE_CURRENT_SPEECH = "close-current-speech";
  static NEW_ADMIN = "new-admin";
  static UPDATE_USER = "update-user"
  constructor(type, data) {
    this.type = type
    this.data = data
  }
  format = () => `\nevent: ${this.type}\ndata:${JSON.stringify(this.data)}\n\n`
}

exports.NewUserEvent = class extends SSEEvent {
  constructor(data) {
    super(SSEEvent.NEW_USER, data);
  }
}

exports.NewSpeechRequestEvent = class extends SSEEvent {
  constructor(data) {
    super(SSEEvent.NEW_SPEECH_REQUEST, data);
  }
}
exports.UserQuitEvent = class extends SSEEvent {
  constructor(data) {
    super(SSEEvent.USER_QUIT, data);
  }
}

exports.CloseCurrentSpeechEvent = class extends SSEEvent {
  constructor(data) {
    super(SSEEvent.CLOSE_CURRENT_SPEECH, data);
  }
}
exports.UpdateUserEvent = class extends SSEEvent {
  constructor() {
    super(SSEEvent.UPDATE_USER, '');
  }
}
