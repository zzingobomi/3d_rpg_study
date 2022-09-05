import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js";

import { entity } from "./entity.js";

export const threejs_component = (() => {
  const _VS = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

  const _FS = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;

  varying vec3 vWorldPosition;

  void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
  }`;

  class ThreeJSController extends entity.Component {
    _threejs;
    _camera;
    _scene;
    _sun;

    constructor() {
      super();
    }

    InitEntity() {
      // wdbgl
      this._threejs = new THREE.WebGLRenderer({
        antialias: true,
      });
      this._threejs.outputEncoding = THREE.sRGBEncoding;
      this._threejs.gammaFactor = 2.2;
      this._threejs.shadowMap.enabled = true;
      this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
      this._threejs.setPixelRatio(window.devicePixelRatio);
      this._threejs.setSize(window.innerWidth, window.innerHeight);
      this._threejs.domElement.id = "threejs";

      document
        .getElementById("container")
        .appendChild(this._threejs.domElement);

      window.addEventListener(
        "resize",
        () => {
          this._OnWindowResize();
        },
        false
      );

      // camera
      const fov = 60;
      const aspect = 1920 / 1080;
      const near = 1.0;
      const far = 10000.0;
      this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this._camera.position.set(25, 10, 25);

      // scene
      this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color(0xffffff);
      this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);

      // light
      let light = new THREE.DirectionalLight(0xffffff, 1.0);
      light.position.set(-10, 500, 10);
      light.target.position.set(0, 0, 0);
      light.castShadow = true;
      light.shadow.bias = -0.001;
      light.shadow.mapSize.width = 4096;
      light.shadow.mapSize.height = 4096;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 1000.0;
      light.shadow.camera.left = 100;
      light.shadow.camera.right = -100;
      light.shadow.camera.top = 100;
      light.shadow.camera.bottom = -100;
      this._scene.add(light);

      this._sun = light;

      this._LoadSky();
    }

    // TODO: 분석 필요
    _LoadSky() {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6);
      hemiLight.color.setHSL(0.6, 1, 0.6);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      this._scene.add(hemiLight);

      const uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 },
      };
      uniforms["topColor"].value.copy(hemiLight.color);

      this._scene.fog.color.copy(uniforms["bottomColor"].value);

      const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
      const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide,
      });

      const sky = new THREE.Mesh(skyGeo, skyMat);
      this._scene.add(sky);
    }

    _Update() {
      const player = this._entityManager.Get("player");
      if (!player) {
        return;
      }
      const pos = player._position;

      this._sun.position.copy(pos);
      this._sun.position.add(new THREE.Vector3(-10, 500, -10));
      this._sun.target.position.copy(pos);
      this._sun.updateMatrixWorld();
      this._sun.target.updateMatrixWorld();
    }
  }

  return {
    ThreeJSController: ThreeJSController,
  };
})();
