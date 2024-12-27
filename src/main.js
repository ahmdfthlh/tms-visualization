import * as THREE from '../node_modules/three/build/three.module.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// buat alas container truk
const containerLength = 30; 
const containerWidth = 10; 

const floorGeometry = new THREE.PlaneGeometry(containerLength, containerWidth);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Memutar untuk membuatnya horizontal
scene.add(floor);

// grid
const gridHelper = new THREE.GridHelper(containerLength, containerWidth); 
scene.add(gridHelper);

const boxes = [];
const boxData = [
    { width: 1.5, height: 1.0, depth: 1.0, color: 0xff0000 },
    { width: 1.0, height: 0.5, depth: 1.5, color: 0x00ff00 },
    { width: 0.7, height: 1.2, depth: 0.7, color: 0x0000ff },
    { width: 1.0, height: 1.0, depth: 1.0, color: 0xffff00 },
    { width: 1.2, height: 0.8, depth: 1.5, color: 0xff00ff },
];

// masukin box do ke container
boxData.forEach((data, index) => {
    const boxGeometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: data.color });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    // Posisi awal kotak di grid
    box.position.set(index - 2, data.height / 2, 0);
    scene.add(box);
    boxes.push(box);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedBox = null;
let clickStartTime = null; // Waktu mulai klik untuk mendeteksi hold
let clickTimeout = null; // Untuk menghentikan timeout saat klik + hold

// cek box DO beririsan
function checkCollision(selectedBox) {
    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        if (box === selectedBox) continue;

        const box1 = selectedBox;  // Kotak yang sedang dipindahkan
        const box2 = box;  // kotak yang nabrak

        // cek nabrak apa ga antara 2 kotak (beririsan)
        if (box1.position.x < box2.position.x + box2.geometry.parameters.width &&
            box1.position.x + box1.geometry.parameters.width > box2.position.x &&
            box1.position.z < box2.position.z + box2.geometry.parameters.depth &&
            box1.position.z + box1.geometry.parameters.depth > box2.position.z) {

            // jika beririsan, kotak tetap di posisi semula
            return true;
        }
    }
    return false;
}

// click listener
window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // raycaster untuk mendeteksi klik pada kotak
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(boxes);

    if (intersects.length > 0) {
        selectedBox = intersects[0].object; // pilih box
        clickStartTime = Date.now(); 
        clearTimeout(clickTimeout); 
    }
});

// drag listener
window.addEventListener('mousemove', (event) => {
    if (selectedBox) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Hit posisi mouse dalam 3D pada grid
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(floor);

        if (intersects.length > 0) {
            const point = intersects[0].point;

            // Batas gerakan kotak agar tidak keluar dari grid
            const minX = -containerLength / 2;
            const maxX = containerLength / 2;
            const minZ = -containerWidth / 2;
            const maxZ = containerWidth / 2;

            // Pastikan posisi kotak tetap dalam batas grid
            const clampedX = Math.max(minX + selectedBox.geometry.parameters.width / 2, Math.min(maxX - selectedBox.geometry.parameters.width / 2, Math.round(point.x)));
            const clampedZ = Math.max(minZ + selectedBox.geometry.parameters.depth / 2, Math.min(maxZ - selectedBox.geometry.parameters.depth / 2, Math.round(point.z)));

            selectedBox.position.set(clampedX, selectedBox.position.y, clampedZ); // Snap ke grid

            // Periksa tabrakan setelah posisi kotak diperbarui
            checkCollision(selectedBox);
        }
    }
});

// finish click box listener
window.addEventListener('mouseup', () => {
    if (selectedBox && clickStartTime) {
        const clickDuration = Date.now() - clickStartTime;

        if (clickDuration < 500) {
            // Double click: Naikkan kotak 1 level
            selectedBox.position.y += 1;
        } else if (clickDuration >= 3000) {
            // Click + hold 3 detik: Turunkan kotak 1 level, dengan batas bawah
            const minY = selectedBox.geometry.parameters.height / 2;
            selectedBox.position.y = Math.max(minY, selectedBox.position.y - 1);
        }
    }
    selectedBox = null; // Hentikan drag
});

camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
