import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGp9lweDMFJfzK9fk2atWyyYrR_YloeEM",
  authDomain: "collect-stars-d06bc.firebaseapp.com",
  projectId: "collect-stars-d06bc",
  storageBucket: "collect-stars-d06bc.firebasestorage.app",
  messagingSenderId: "584449062456",
  appId: "1:584449062456:web:391778c5a62537bd9bd8cd",
  measurementId: "G-L8C53QKJ6Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 9 x 6 = 54조각 설정
const COLS = 9;
const ROWS = 6;
const TOTAL_PIECES = COLS * ROWS;

let revealedPieces = new Set();
const puzzleGrid = document.getElementById("puzzle-grid");
document.getElementById("total-count").textContent = TOTAL_PIECES;

function createPuzzleBoard() {
  puzzleGrid.innerHTML = "";
  
  for (let i = 0; i < TOTAL_PIECES; i++) {
    const piece = document.createElement("button");
    piece.className = "puzzle-piece";
    piece.textContent = i + 1; // 1부터 50까지 번호 표시!
    
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    
    const posX = (col / (COLS - 1)) * 100;
    const posY = (row / (ROWS - 1)) * 100;
    
    piece.style.backgroundPosition = `${posX}% ${posY}%`;
    piece.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
    
    piece.addEventListener("click", () => togglePiece(i));
    puzzleGrid.appendChild(piece);
  }
}

function setupRealtimeSync() {
  const docRef = doc(db, "puzzle", "progressData");

  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data().revealed;
      if (Array.isArray(data)) {
        revealedPieces = new Set(data);
        updateUI();
      }
    } else {
      saveProgress();
    }
  });
}

async function saveProgress() {
  if (!db) return;
  try {
    const docRef = doc(db, "puzzle", "progressData");
    await setDoc(docRef, { revealed: [...revealedPieces] });
  } catch (e) {
    console.error("저장 실패:", e);
  }
}

function updateUI() {
  const pieces = document.querySelectorAll(".puzzle-piece");
  pieces.forEach((piece, index) => {
    const isRevealed = revealedPieces.has(index);
    piece.classList.toggle("revealed", isRevealed);
  });

  document.getElementById("count").textContent = revealedPieces.size;
  document.getElementById("fill").style.width = 
    (revealedPieces.size / TOTAL_PIECES * 100) + "%";
}

function togglePiece(index) {
  if (revealedPieces.has(index)) {
    revealedPieces.delete(index);
  } else {
    revealedPieces.add(index);
  }
  saveProgress();
  updateUI();
}

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("모든 퍼즐 조각을 다시 어둡게 초기화할까요?")) return;
  revealedPieces.clear();
  await saveProgress();
  updateUI();
});

createPuzzleBoard();
setupRealtimeSync();
