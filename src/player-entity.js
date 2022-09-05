import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js";

import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js";

import { entity } from "./entity.js";
import { finite_state_machine } from "./finite-state-machine.js";
import { player_state } from "./player-state.js";

export const player_entity = (() => {
  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    _animations;

    constructor(animations) {
      super();
      this._animations = animations;
      this._Init();
    }

    _Init() {
      this._AddState("idle", player_state.IdleState);
      this._AddState("walk", player_state.WalkState);
      this._AddState("run", player_state.RunState);
    }
  }

  class BasicCharacterController extends entity.Component {
    _target;
    _params;
    _decceleration;
    _acceleration;
    _velocity;
    _position;

    _animations;
    _mixer;

    _stateMachine;

    _loadingManager;

    constructor(params) {
      super();
      this._Init(params);
    }

    _Init(params) {
      this._params = params;
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.125, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();

      this._animations = {};
      this._stateMachine = new CharacterFSM(this._animations);

      this._LoadModels();
    }

    _LoadModels() {
      const loader = new FBXLoader();
      loader.setPath("./resources/guard/");
      loader.load("castle_guard_01.fbx", (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.035);
        this._params.scene.add(this._target);

        this._target.traverse((c) => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);

          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState("idle");
        };

        const loader = new FBXLoader(this._manager);
        loader.setPath("./resources/guard/");
        loader.load("Sword And Shield Idle.fbx", (a) => {
          _OnLoad("idle", a);
        });
        loader.load("Sword And Shield Run.fbx", (a) => {
          _OnLoad("run", a);
        });
        loader.load("Sword And Shield Walk.fbx", (a) => {
          _OnLoad("walk", a);
        });
      });
    }

    // spatial-hash-grid 를 이용하여 근처 cell 에 있는 entity를 구하고 그 entity 들만 거리를 구한다.
    // 자세한 로직은 tutorial을 분석해보자
    // 여기에 https://www.youtube.com/watch?v=aC7KF90Mots (Octree) 를 이용할 순 없을까?
    _FindIntersections(pos) {
      const grid = this.GetComponent("SpatialGridController");
      //const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e));
      const nearby = grid.FindNearbyEntities(5);
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d =
          ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 4) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    Update(timeInSeconds) {
      const input = this.GetComponent("BasicCharacterControllerInput");
      this._stateMachine.Update(timeInSeconds, input);

      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }

      const currentState = this._stateMachine._currentState;
      if (
        currentState.Name != "walk" &&
        currentState.Name != "run" &&
        currentState.Name != "idle"
      ) {
        return;
      }

      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z =
        Math.sign(frameDecceleration.z) *
        Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

      velocity.add(frameDecceleration);

      const controlObject = this._target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();

      const acc = this._acceleration.clone();
      if (input._keys.shift) {
        acc.multiplyScalar(2.0);
      }

      if (input._keys.forward) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (input._keys.backward) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(
          _A,
          4.0 * Math.PI * timeInSeconds * this._acceleration.y
        );
        _R.multiply(_Q);
      }
      if (input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(
          _A,
          4.0 * -Math.PI * timeInSeconds * this._acceleration.y
        );
        _R.multiply(_Q);
      }

      controlObject.quaternion.copy(_R);

      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();

      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);

      const pos = controlObject.position.clone();
      pos.add(forward);
      pos.add(sideways);

      // spatial-hash-grid 참고 (object3D 가 있다면 움직이지 않는다)
      const collisions = this._FindIntersections(pos);
      if (collisions.length > 0) {
        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);

      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
    }
  }

  return {
    BasicCharacterController: BasicCharacterController,
  };
})();
