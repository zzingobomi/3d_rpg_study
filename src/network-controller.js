import "https://cdn.jsdelivr.net/npm/socket.io-client@3.1.0/dist/socket.io.js";

import { entity } from "./entity.js";

export const network_controller = (() => {
  class NetworkController extends entity.Component {
    _playerID;
    _socket;

    constructor(params) {
      super();

      this._playerID = null;
      this._SetupSocket();
    }

    _SetupSocket() {
      this._socket = io("ws://localhost:11000", {
        reconnection: false,
        transports: ["websocket"],
        timeout: 10000,
      });

      this._socket.on("connect", () => {
        console.log(this._socket.id);
        this._socket.emit(
          "login.commit",
          document.getElementById("login-input").value
        );
      });

      this._socket.on("disconnect", () => {
        console.log("DISCONNECTED: " + this._socket.id); // undefined
      });

      this._socket.onAny((e, d) => {
        this._OnMessage(e, d);
      });
    }

    SendChat(txt) {
      this._socket.emit("chat.msg", txt);
    }

    _OnMessage(e, d) {}
  }

  return {
    NetworkController: NetworkController,
  };
})();
