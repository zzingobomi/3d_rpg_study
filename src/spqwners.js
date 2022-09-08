import { entity } from "./entity.js";
import { player_entity } from "./player-entity.js";
import { player_input } from "./player-input.js";
import { spatial_grid_controller } from "./spatial-grid-controller.js";
import { third_person_camera } from "./third-person-camera.js";

export const spawners = (() => {
  class PlayerSpawner extends entity.Component {
    _params;

    constructor(params) {
      super();
      this._params = params;
    }

    Spawn(playerParams) {
      const params = {
        camera: this._params.camera,
        scene: this._params.scene,
        desc: playerParams,
      };

      const player = new entity.Entity();
      player.Account = playerParams.account;
      player.AddComponent(
        new player_input.BasicCharacterControllerInput(params)
      );
      player.AddComponent(new player_entity.BasicCharacterController(params));
      player.AddComponent(
        new spatial_grid_controller.SpatialGridController({
          grid: this._params.grid,
        })
      );
      player.AddComponent(
        new third_person_camera.ThirdPersonCamera({
          camera: this._params.camera,
          target: player,
        })
      );
      this.Manager.Add(player, "player");

      return player;
    }
  }

  class NetworkEntitySpawner extends entity.Component {
    _params;

    constructor(params) {
      super();
      this._params = params;
    }

    Spawn(name, desc) {}
  }

  return {
    PlayerSpawner: PlayerSpawner,
    NetworkEntitySpawner: NetworkEntitySpawner,
  };
})();
