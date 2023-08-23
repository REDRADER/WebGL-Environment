import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(10, 4, 10);


const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const container = document.getElementById('container');
let selectedMesh;
let meshGroups = [];

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const textureloader = new THREE.TextureLoader();


const avocadoBaseColor = textureloader.load("./Avocado/glTF/Avocado_baseColor.png")
const avocadoNormalColor = textureloader.load("./Avocado/glTF/Avocado_normal.png")
const avocadoRoughness = textureloader.load("./Avocado/glTF/Avocado_roughnessMetallic.png")
const tilebase = textureloader.load("./tile/tiletexture.png")


const SheenChairColor = textureloader.load('./SheenChair/glTF/chair_wood_albedo.png')

tilebase.encoding = THREE.sRGBEncoding;
avocadoBaseColor.encoding = THREE.sRGBEncoding;

const material2 = new THREE.MeshStandardMaterial({
  map: avocadoBaseColor,
  normalMap: avocadoNormalColor
})

const matt = new THREE.MeshStandardMaterial({ map: tilebase, roughness: 1 })


// platform geometry
let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), matt);
blockPlane.position.set(0, -2, 3);
blockPlane.scale.set(80, 2, 80);

blockPlane.castShadow = true;
blockPlane.receiveShadow = true;
scene.add(blockPlane);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xe0ff00 });
const cube = new THREE.Mesh(geometry, material2);
const cubeGroup = new THREE.Group();
cubeGroup.add(cube);
meshGroups.push(cubeGroup);
scene.add(cubeGroup);



// transformcontroll

const tControls = new TransformControls(camera, renderer.domElement)
// tControls.attach(cube)
// show y axis controlls
// tControls.showY=false;
tControls.setMode("translate");
tControls.setSize(1)
// can span to the specific units
tControls.setTranslationSnap(0);
scene.add(tControls)


var mode = "translate"; // initialize mode to translate

// change the mode of transform controlls with the keyboard
document.addEventListener("keydown", function (event) {
  if (event.key === "t") {
    mode = "translate";
    tControls.setMode(mode);
  } else if (event.key === "r") {
    mode = "rotate";
    tControls.setMode(mode);
  } else if (event.key === "s") {
    mode = "scale";
    tControls.setMode(mode);
  }
});

tControls.addEventListener('dragging-changed', function (event) {
  controls.enabled = !event.value; // disable OrbitControls when TransformControls are active
});





const stats = new Stats();
container.appendChild(stats.dom);




// orbital controls to control the camera moments like pan,zoom,drag;
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = true;
controls.enableDamping = true;




// light to light the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);



// change the size of renderer size on changing the windows size
window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

};



// method to load gltf files with GLTFLoader
const loadGLTF = () => {
  const loader = new GLTFLoader();

  loader.load("./shiba/scene.gltf", (gltf) => {
    const meshGroup = gltf.scene;

    // console.log(meshGroup);
    // gltf.scene.traverse((node) => {
    //     if (node.isMesh) {
    //       // Create a new material
    //       const material = new THREE.MeshStandardMaterial({
    //         // map: textureloader.load('./SheenChair/glTF/chair_occulusion.png'),



    //       });

    //       // Set the material on the mesh
    //       node.material = material;
    //     }
    //   });
    scene.add(meshGroup);
    meshGroup.position.set(-5, 0, 0);

    // add mesh group to array
    meshGroups.push(meshGroup);
  })

  loader.load("./bed/scene.gltf", (gltf) => {
    const meshGroup = gltf.scene;

    scene.add(meshGroup);
    meshGroup.position.set(-5, -1, -3);
    meshGroup.scale.set(0.02, 0.02, 0.02)
    // add mesh group to array
    meshGroups.push(meshGroup);
  })




  loader.load("./sofa/scene.gltf", (gltf) => {
    const meshGroup = gltf.scene;

    // gltf.scene.traverse((node) => {
    //   if (node.isMesh) {

    //     const material = new THREE.MeshStandardMaterial({
    //       map: avocadoBaseColor,
    //       normalMap:avocadoNormalColor,
    //       roughnessMap:avocadoRoughness,

    //     });

    //     // Set the material on the mesh
    //     node.material = material;
    //   }
    // });
    scene.add(meshGroup);
    meshGroup.scale.set(2, 2, 2)
    meshGroup.position.set(-5, -0.5, 3);

    // add mesh group to array
    meshGroups.push(meshGroup);
  })
}



// listen to the click event and attach the transform controls to the clicked object
renderer.domElement.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {



  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // loop over each mesh group

  for (let i = 0; i < meshGroups.length; i++) {
    const meshGroup = meshGroups[i];

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(meshGroup.children, true);

    if (intersects.length > 0) {
      const selectedMesh = meshGroup;

      // detach transform controls from current mesh
      if (tControls.object) {
        tControls.detach();
      }

      // attach transform controls to selected mesh
      tControls.attach(selectedMesh);


      break; // exit loop if a mesh is found
    }
    else {
      if (tControls.object) {
        tControls.detach();
      }
    }
  }
}



function animate() {
  requestAnimationFrame(animate);
  // tControls.update();
  controls.update();
  stats.update();

  renderer.render(scene, camera);
}
animate();
loadGLTF();