import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

export const player_state = (() => {
  class State {
    _parent;

    constructor(parent) {
      this._parent = parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
  }

  class WalkState extends State {
    constructor(parent) {
      super(parent);
    }

    get Name() {
      return "walk";
    }

    Enter(prevState) {
      const curAction = this._parent._animations["walk"].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;

        curAction.enabled = true;

        if (prevState.Name == "run") {
          const ratio =
            curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }

        curAction.crossFadeFrom(prevAction, 0.1, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }

    Exit() {}

    Update(timeElapsed, input) {
      if (input._keys.forward || input._keys.backward) {
        if (input._keys.shift) {
          this._parent.SetState("run");
        }
        return;
      }

      this._parent.SetState("idle");
    }
  }

  class RunState extends State {
    constructor(parent) {
      super(parent);
    }

    get Name() {
      return "run";
    }

    Enter(prevState) {
      const curAction = this._parent._animations["run"].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;

        curAction.enabled = true;

        if (prevState.Name == "walk") {
          const ratio =
            curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }

        curAction.crossFadeFrom(prevAction, 0.1, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }

    Exit() {}

    Update(timeElapsed, input) {
      if (input._keys.forward || input._keys.backward) {
        if (!input._keys.shift) {
          this._parent.SetState("walk");
        }
        return;
      }

      this._parent.SetState("idle");
    }
  }

  class IdleState extends State {
    constructor(parent) {
      super(parent);
    }

    get Name() {
      return "idle";
    }

    Enter(prevState) {
      const idleAction = this._parent._animations["idle"].action;
      if (prevState) {
        const prevAction = this._parent._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.25, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }

    Exit() {}

    Update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState("walk");
      }
    }
  }

  return {
    State: State,
    IdleState: IdleState,
    WalkState: WalkState,
    RunState: RunState,
  };
})();
