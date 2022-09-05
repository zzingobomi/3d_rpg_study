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
  }

  return {
    UIController: UIController,
  };
})();
