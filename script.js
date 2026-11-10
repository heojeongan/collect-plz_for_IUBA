import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 기존에 검증된 파이어베이스 설정 정보 그대로 사용!
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

// 퍼즐 가로/세로 조각 수 설정 (가로 8 x 세로 5 = 총 40조각)
const COLS = 8;
const ROWS = 5;
const TOTAL_PIECES = COLS * ROWS;

let revealedPieces = new Set();
const puzzleGrid = document.getElementById("puzzle-grid");
document.getElementById("total-count").textContent = TOTAL_PIECES;

// 퍼즐 그리드 및 위치 생성
function createPuzzleBoard() {
  puzzleGrid.innerHTML = "";
  
  for (let i = 0; i < TOTAL_PIECES; i++) {
    const piece = document.createElement("button");
    piece.className = "puzzle-piece";
    
    // 조각의 행(row), 열(col) 계산
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    
    // 배경 이미지 위치를 퍼즐 비율에 맞춰 자르기 (CSS background-position)
    const posX = (col / (COLS - 1)) * 100;
    const posY = (row / (ROWS - 1)) * 100;
    
    piece.style.backgroundPosition = `${posX}% ${posY}%`;
    piece.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
    
    piece.addEventListener("click", () => togglePiece(i));
    puzzleGrid.appendChild(piece);
  }
}

// 실시간 파이어베이스 동기화
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

// 저장 함수
async function saveProgress() {
  if (!db) return;
  try {
    const docRef = doc(db, "puzzle", "progressData");
    await setDoc(docRef, { revealed: [...revealedPieces] });
  } catch (e) {
    console.error("저장 실패:", e);
  }
}

// 화면 업데이트
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

// 퍼즐 조각 토글 (클릭 시 켜짐/꺼짐)
function togglePiece(index) {
  if (revealedPieces.has(index)) {
    revealedPieces.delete(index);
  } else {
    revealedPieces.add(index);
  }
  saveProgress();
  updateUI();
}

// 초기화 버튼
document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("모든 퍼즐 조각을 다시 어둡게 초기화할까요?")) return;
  revealedPieces.clear();
  await saveProgress();
  updateUI();
});

// 실행
createPuzzleBoard();
setupRealtimeSync();