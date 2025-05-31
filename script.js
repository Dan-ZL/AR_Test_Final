import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

let model = null; // ✅ 全局变量，便于后续访问模型（如在渲染循环中平滑动画等）

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "./assets/target.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 添加环境光照
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 3, 2);
  scene.add(directionalLight);

  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  loader.load(
    './assets/model.glb',
    (gltf) => {
      model = gltf.scene;
      model.position.set(0, 0.2, 0);
      model.scale.set(0.5, 0.5, 0.5);
      anchor.group.add(model);
      console.log("✅ 模型已添加至 anchor.group");
    },
    undefined,
    (error) => {
      console.error("❌ 模型加载失败：", error);
    }
  );

  // ✅ 点击任意区域触发全屏（仅触发一次）
  document.body.addEventListener('click', async () => {
    if (!document.fullscreenElement && document.body.requestFullscreen) {
      await document.body.requestFullscreen();
      console.log("✅ 已请求全屏模式");
    }
  }, { once: true }); // 只触发一次，避免重复进入

  // 启动 AR
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (model) {
      model.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  });
});

