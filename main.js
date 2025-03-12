// Import the Firebase modules you need from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

/* =======================
   Firebase Configuration
   ======================= */
// Replace these placeholder values with your actual Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase and Firestore
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

/* =======================
   Three.js Scene Setup
   ======================= */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Create a rotating cube for a dynamic background
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// Adjust camera and renderer when the window resizes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =======================
   Audio Player & Firebase Sync
   ======================= */
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('track-title');

// Define your track list (for demonstration, we use one track)
// Replace the "url" value with the raw URL to your file on GitHub.
const tracks = [
  {
    id: "track1",
    title: "Sample Track",
    url: "https://raw.githubusercontent.com/yourusername/yourrepo/main/path/to/your-audio-file.mp3"
  }
];

// Load the first track (extendable for multiple tracks)
let currentTrack = tracks[0];
trackTitle.textContent = currentTrack.title;
audio.src = currentTrack.url;

// Define a Firestore document reference for saving progress
const progressDocRef = doc(db, "audioProgress", currentTrack.id);

// When the audio metadata is loaded, retrieve saved progress from Firebase
audio.addEventListener('loadedmetadata', async () => {
  try {
    const docSnap = await getDoc(progressDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.currentTime && data.currentTime < audio.duration) {
        audio.currentTime = data.currentTime;
      }
    }
  } catch (error) {
    console.error("Error fetching progress from Firebase:", error);
  }
});

// Throttle updates to Firebase to roughly once per second
let updateTimeout;
audio.addEventListener('timeupdate', () => {
  if (updateTimeout) return;
  updateTimeout = setTimeout(async () => {
    try {
      await setDoc(progressDocRef, { currentTime: audio.currentTime });
    } catch (error) {
      console.error("Error updating progress in Firebase:", error);
    }
    updateTimeout = null;
  }, 1000);
});

/* =======================
   Fullscreen Mode Toggle
   ======================= */
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
});
