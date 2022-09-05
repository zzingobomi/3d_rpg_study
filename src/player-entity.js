import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js";

import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js";

import { entity } from "./entity.js";

export const player_entity = (() => {
  class BasicCharacterController extends entity.Component {
    _target;
    _params;
    _decceleration;
    _acceleration;
    _velocity;
    _position;

    _animations;

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

      this._LoadModels();
    }

    _LoadModels() {
      const loader = new FBXLoader();
      loader.setPath("./resources/guard/");
      loader.load("castle_guard_01.fbx", (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.035);
        this._params.scene.add(this._target);
      });
    }

    Update(timeInSeconds) {
      const input = this.GetComponent("BasicCharacterControllerInput");

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
