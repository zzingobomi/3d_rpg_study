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
  }

  return {
    BasicCharacterController: BasicCharacterController,
  };
})();
