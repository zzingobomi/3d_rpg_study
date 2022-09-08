import { entity } from "./entity.js";

export const ui_controller = (() => {
  class UIController extends entity.Component {
    _params;
    _chatElement;

    constructor(params) {
      super();
      this._params = params;
    }

    InitComponent() {
      this._chatElement = document.getElementById("chat-input");
      this._chatElement.addEventListener(
        "keydown",
        (e) => this._OnChatKeyDown(e),
        false
      );
    }

    FadeoutLogin() {
      const loginElement = document.getElementById("login-ui");
      if (loginElement.classList.contains("fadeOut")) {
        return;
      }

      loginElement.classList.toggle("fadeOut");
      document.getElementById("game-ui").style.visibility = "visible";
    }

    _OnChatKeyDown(evt) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        const msg = this._chatElement.value;
        if (msg !== "") {
          const net =
            this.FindEntity("network").GetComponent("NetworkController");
          net.SendChat(msg);
        }
        this._chatElement.value = "";
      }
      evt.stopPropagation();
    }

    AddChatMessage(msg) {
      const e = document.createElement("div");
      e.className = "chat-text";
      if (msg.server) {
        e.className += " chat-text-server";
      } else if (msg.action) {
        e.className += " chat-text-action";
      } else {
        e.innerText = "[" + msg.name + "]: ";
      }
      e.innerText += msg.text;
      const chatElement = document.getElementById("chat-ui-text-area");
      chatElement.insertBefore(e, document.getElementById("chat-input"));
    }
  }

  return {
    UIController: UIController,
  };
})();
