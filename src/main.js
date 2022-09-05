import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js";
import { entity_manager } from "./entity-manager.js";

import { entity } from "./entity.js";
import { math } from "./math.js";
import { network_controller } from "./network-controller.js";
import { object3d_component } from "./object3d-component.js";
import { player_entity } from "./player-entity.js";
import { player_input } from "./player-input.js";
import { spatial_grid_controller } from "./spatial-grid-controller.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";
import { third_person_camera } from "./third-person-camera.js";
import { threejs_component } from "./threejs-component.js";
import { ui_controller } from "./ui-controller.js";

let _APP = null;

class CrappyMMOAttempt {
  _entityManager;
  _grid;

  _previousRAF;

  constructor() {
    this._Initailize();
  }

  _Initailize() {
    this._entityManager = new entity_manager.EntityManager();

    document.getElementById("login-ui").style.visibility = "visible";
    document.getElementById("login-button").onclick = () => {
      this.OnGameStarted_();
    };
  }

  OnGameStarted_() {
    this._grid = new spatial_hash_grid.SpatialHashGrid(
      [
        [-1000, -1000],
        [1000, 1000],
      ],
      [100, 100]
    );

    this._LoadControllers();
    //this._LoadPlayer();
    this._LoadFoliage();

    this._previousRAF = null;
    this._RAF();

    this._entityManager.Get("ui").GetComponent("UIController").FadeoutLogin();
  }

  _LoadControllers() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this._entityManager.Add(threejs);

    // Hack
    this._scene = threejs.GetComponent("ThreeJSController")._scene;
    this._camera = threejs.GetComponent("ThreeJSController")._camera;
    this._threejs = threejs.GetComponent("ThreeJSController")._threejs;

    const network = new entity.Entity();
    network.AddComponent(new network_controller.NetworkController());
    this._entityManager.Add(network, "network");

    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, "ui");
  }

  _LoadFoliage() {
    // plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x1e601c,
      })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    for (let i = 0; i < 100; ++i) {
      const names = [
        "CommonTree_Dead",
        "CommonTree",
        "BirchTree",
        "BirchTree_Dead",
        "Willow",
        "Willow_Dead",
        "PineTree",
      ];
      const name = names[math.rand_int(0, names.length - 1)];
      const index = math.rand_int(1, 5);

      const pos = new THREE.Vector3(
        (Math.random() * 2.0 - 1.0) * 500,
        0,
        (Math.random() * 2.0 - 1.0) * 500
      );

      const e = new entity.Entity();
      e.AddComponent(
        new object3d_component.StaticModelComponent({
          scene: this._scene,
          resourcePath: "./resources/nature/FBX/",
          resourceName: name + "_" + index + ".fbx",
          scale: 0.25,
          emissive: new THREE.Color(0x000000),
          specular: new THREE.Color(0x000000),
          receiveShadow: true,
          castShadow: true,
        })
      );
      e.AddComponent(
        new spatial_grid_controller.SpatialGridController({ grid: this._grid })
      );
      e.SetPosition(pos);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  _LoadPlayer() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };

    const player = new entity.Entity();
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    player.AddComponent(new player_entity.BasicCharacterController(params));
    player.AddComponent(
      new spatial_grid_controller.SpatialGridController({ grid: this._grid })
    );
    this._entityManager.Add(player, "player");

    const camera = new entity.Entity();
    camera.AddComponent(
      new third_person_camera.ThirdPersonCamera({
        camera: this._camera,
        target: this._entityManager.Get("player"),
      })
    );
    this._entityManager.Add(camera, "player-camera");
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();
      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);
    this._entityManager.Update(timeElapsedS);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  _APP = new CrappyMMOAttempt();
});
