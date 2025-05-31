import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "./assets/target.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 添加光照
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 3, 2);
  scene.add(directionalLight);

  const anchor = mindarThree.addAnchor(0);
  const loader = new GLTFLoader();

  // 用数组存储模型实例，方便统一管理（比如动画）
  const models = [];

  // 通用加载函数：根据路径、位置、缩放添加模型
  const addModel = (path, position, scale = 0.5, rotationY = 0) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.scale.set(scale, scale, scale);
        model.rotation.y = rotationY;
        anchor.group.add(model);
        models.push(model); // 加入管理列表
        console.log(`✅ 模型已添加: ${path}`);
      },
      undefined,
      (error) => {
        console.error(`❌ 加载失败: ${path}`, error);
      }
    );
  };

  // 添加多个模型：可以是同一个模型或不同模型
  addModel('./assets/models/model.glb', [0, 0.2, 0]);        // 正中
  addModel('./assets/models/model.glb', [0.3, 0.2, 0], 0.4); // 右侧略小
  addModel('./assets/models/model.glb', [-0.3, 0.2, 0], 0.6);// 左侧略大
  addModel('./assets/models/model.glb', [0, 0.2, -0.3], 0.5, Math.PI / 4); // 背后稍微转个角度

  // 点击进入全屏（只触发一次）
  document.body.addEventListener('click', async () => {
    if (!document.fullscreenElement && document.body.requestFullscreen) {
      await document.body.requestFullscreen();
      console.log("✅ 已请求全屏");
    }
  }, { once: true });

  // 启动 AR
  await mindarThree.start();

  // 动画循环：让所有模型一起旋转
  renderer.setAnimationLoop(() => {
    models.forEach((m) => {
      m.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
  });
});

