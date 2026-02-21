"use strict";
const socket = io(); // 同じサーバーに接続
const roomId = "room123"; // 本当はランダムが良い
socket.emit("joinRoom", roomId);
socket.on("joinedRoom", roomId => {
  console.log("部屋に参加:", roomId);
});
socket.on("roomFull", () => {
  alert("この部屋は満員です！");
});
const tiles = [];
const STs = [];
const VSSTs = [];
const CONFIG = {
  ST_INDEX_OFFSET: 25,
  ST_VALUE_OFFSET: 26,
  VSST_INDEX_OFFSET: 34,
  VSST_VALUE_OFFSET: 35,
  sk8: [26, 27, 28, 29, 30, 31, 32, 33, 34],
  VSsk8: [35, 36, 37, 38, 39, 40, 41, 42, 43],
  three: [17, 18, 19],
  three2: [7, 8, 9],
  mikan: [23],
  mikan2: [3],
  OTHER_COLOR: 'brown'
};
const gameState = {
  VSredf: true,
  VSbluef: true,
  VSgreenf: true,
  fishColors: {
    red: "red",
    blue: "blue",
    green: "green",
    VSred: "red",
    VSblue: "blue",
    VSgreen: "green"
  },
  fishAnpi17: true,
  fishAnpi18: true,
  fishAnpi19: true,
  startTime: null,
  fastTd: null,
  fastTd2: null,
  flipTimer: NaN,
  remainingTime: 10.0,
  running: true,
  selecTd: null,
  gamestart: false,
  mytarn: true,
  savedST: null
};
function getDefaultSTColor(value) {
  if (value === 26) return 'red';
  if (value === 27) return 'blue';
  if (value === 28) return 'green';
  if (value === 29) return 'yellow';
  if (value === 30) return 'purple';
  if (value === 31) return 'orange';
  if (value === 32) return 'grey';
  if (value === 33) return 'black';
  if (value === 34) return 'white';
  return '';
}
function createTileContent(value, overrideColor) {
  const container = document.createElement("div");
  container.className = "tile-content";
  if (CONFIG.sk8.includes(value)) {
    const circle2 = document.createElement("div");
    let backgroundColor;
    if (value === 26) backgroundColor = "red";
    else if (value === 27) backgroundColor = "blue";
    else if (value === 28) backgroundColor = "green";
    else if (value === 29) backgroundColor = "yellow";
    else if (value === 30) backgroundColor = "purple";
    else if (value === 31) backgroundColor = "orange";
    else if (value === 32) backgroundColor = "green";
    else if (value === 33) backgroundColor = "black";
    else if (value === 34) backgroundColor = "white";
    circle2.className = "circle2";
    circle2.style.backgroundColor = overrideColor || backgroundColor;
    container.appendChild(circle2);
  }
  if (CONFIG.VSsk8.includes(value)) {
    const VScircle2 = document.createElement("div");
    let backgroundColor;
    if (value === 35) backgroundColor = "white";
    else if (value === 36) backgroundColor = "black";
    else if (value === 37) backgroundColor = "grey";
    else if (value === 38) backgroundColor = "yellow";
    else if (value === 39) backgroundColor = "purple";
    else if (value === 40) backgroundColor = "orange";
    else if (value === 41) backgroundColor = "green";
    else if (value === 42) backgroundColor = "blue";
    else if (value === 43) backgroundColor = "red";
    VScircle2.className = "VScircle2";
    VScircle2.style.backgroundColor = overrideColor || backgroundColor;
    container.appendChild(VScircle2);
  }
  if (CONFIG.three.includes(value)) {
    const circle = document.createElement("div");
    const triangle = document.createElement("div");
    let backgroundColor;
    if (value === 17) backgroundColor = gameState.fishColors.red;
    else if (value === 18) backgroundColor = gameState.fishColors.blue;
    else if (value === 19) backgroundColor = gameState.fishColors.green;
    circle.className = "circle";
    triangle.className = "triangle";
    circle.style.backgroundColor = backgroundColor;
    triangle.style.borderBottomColor = backgroundColor;
    container.appendChild(circle);
    container.appendChild(triangle);
  }
  if (CONFIG.mikan.includes(value)) {
    const circleM = document.createElement("div");
    circleM.className = "circleM";
    container.appendChild(circleM);
  }
  if (CONFIG.three2.includes(value)) {
    const VScircle = document.createElement("div");
    const VStriangle = document.createElement("div");
    let backgroundColor;
    if (value === 7) backgroundColor = gameState.fishColors.VSred;
    else if (value === 8) backgroundColor = gameState.fishColors.VSblue;
    else if (value === 9) backgroundColor = gameState.fishColors.VSgreen;
    VScircle.className = "VScircle";
    VStriangle.className = "VStriangle";
    VScircle.style.backgroundColor = backgroundColor;
    VStriangle.style.borderTopColor = backgroundColor;
    container.appendChild(VStriangle);
    container.appendChild(VScircle);
  }
  if (CONFIG.mikan2.includes(value)) {
    const circleM2 = document.createElement("div");
    circleM2.className = "circleM2";
    container.appendChild(circleM2);
  }
  return container;
}
document.getElementById("startButton").addEventListener("click", () => {
  const button = document.getElementById("startButton");
  button.style.display = "none";
  requestAnimationFrame(count);
  gameState.gamestart = true;
});
const STMap = {};
function init() {
  const VSsakusen = document.getElementById("VSsakusen");
  for (let i = 0; i < 3; i++) {
    const VStr2 = document.createElement("tr");
    for (let j = 0; j < 3; j++) {
      const VStd2 = document.createElement("td");
      const index = i * 3 + j;
      const dataIndex = index + 34;
      VStd2.className = "VSST";
      VStd2.index = dataIndex;
      VStd2.value = index + 35;
      VStd2.setAttribute("data-index", index + 34);
      VStd2.appendChild(createTileContent(VStd2.value, VStd2.dataset.overrideColor));
      VStr2.appendChild(VStd2);
      VSSTs.push(VStd2);
      STMap[dataIndex] = VStd2;
    }
    VSsakusen.appendChild(VStr2);
  }
  const sakusen = document.getElementById("sakusen");
  for (let i = 0; i < 3; i++) {
    const tr2 = document.createElement("tr");
    for (let j = 0; j < 3; j++) {
      const td2 = document.createElement("td");
      const index = i * 3 + j;
      const dataIndex = index + 25;
      td2.className = "ST";
      td2.index = dataIndex;
      td2.value = index + 26;
      td2.onclick = click2;
      td2.setAttribute("data-index", index + 25);
      td2.appendChild(createTileContent(td2.value, td2.dataset.overrideColor));
      tr2.appendChild(td2);
      STs.push(td2);
      STMap[dataIndex] = td2;
    }
    sakusen.appendChild(tr2);
  }
  const table = document.getElementById("table");
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 5; j++) {
      const td = document.createElement("td");
      const index = i * 5 + j;
      td.className = "tile";
      td.index = index;
      td.value = index + 1;
      td.onclick = click;
      td.setAttribute("data-index", index);
      td.appendChild(createTileContent(td.value, td.dataset.overrideColor));
      tr.appendChild(td);
      tiles.push(td);
    }
    table.appendChild(tr);
  }
}
function click(e) {
  let src = e.target;
  const td = src.closest("td");
  if (!td || !td.classList.contains("tile")) return;
    const index = parseInt(td.dataset.index);
    const value = td.value;
  if (gameState.selecTd) {
    gameState.selecTd.classList.remove("selected");
  }
  td.classList.add("selected");
  gameState.selecTd = td;
  if (src.classList && src.classList.contains("circle") && gameState.fastTd === null) {
    gameState.fastTd = index;
    return;
  }
  if (gameState.fastTd !== null && gameState.fastTd2 !== null) {
    const circle = td.querySelector(".circle");
    const triangle = td.querySelector(".triangle");
    const st = STs[gameState.fastTd2 - CONFIG.ST_INDEX_OFFSET];
    const stColor = st.querySelector(".circle2")?.style.backgroundColor;
    if (circle) circle.style.backgroundColor = stColor;//
    if (triangle) triangle.style.borderBottomColor = stColor;//
    if (value === 17) gameState.fishColors.red = stColor;
    else if (value === 18) gameState.fishColors.blue = stColor;
    else if (value === 19) gameState.fishColors.green = stColor;
    redrawTiles();
  }
  const row = Math.floor(gameState.fastTd / 5);
  const col = gameState.fastTd % 5;
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 5 && c >= 0 && c < 5) {
        neighbors.push(r * 5 + c);
      }
    }
  }
  for (let s = 0; s < STs.length; s++) {
    const st = STs[s];
    const stColor = st.querySelector(".circle2")?.style.backgroundColor;
    const currentTile = tiles[gameState.fastTd];
    const tileColor = currentTile.querySelector(".circle")?.style.backgroundColor;
    if (stColor && tileColor && stColor === tileColor) {
      const stRow = Math.floor(s / 3);
      const stCol = s % 3;
      const dRow = stRow - 1;
      const dCol = stCol - 1;
      const r2 = row + dRow * 2;
      const c2 = col + dCol * 2;
      if (r2 >= 0 && r2 < 5 && c2 >= 0 && c2 < 5) {
        neighbors.push(r2 * 5 + c2);
      }
    }
  }
  if (gameState.fastTd !== null && gameState.fastTd !== index && neighbors.includes(index)) {
    swap(gameState.fastTd, index);
    gameState.fastTd = null;
    return;
  }
}
function VSthink() {
  if (!gameState.mytarn) {
    const candidates = tiles.filter(td => td.value ===7 || td.value === 8 || td.value === 9);
    const randomTile = candidates[Math.floor(Math.random() * candidates.length)];
    if (randomTile) {
      const fakeEvent = { target: randomTile };
  VSclick(fakeEvent);
    }
  }
}
function VSclick(e) {
  let src = e.target;
  const td = src.closest("td");
  const index = parseInt(td.dataset.index)
  let next = 2;//
  const VSneighbors = [];
  const row = Math.floor(index / 5);
  const col = index % 5;
  const VScircle = td.querySelector(".VScircle");
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 5 && c >= 0 && c < 5) {
        VSneighbors.push(r * 5 + c);
      }
    }
  }
  for (let s = 0; s < STs.length; s++) {
    const vsst = VSSTs[s];
    const vsstColor = vsst.querySelector(".VScircle2")?.style.backgroundColor;
    const currentTile = tiles[index];
    const tileColor = currentTile.querySelector(".VScircle")?.style.backgroundColor;
    if (vsstColor && tileColor && vsstColor === tileColor) {
      const stRow = Math.floor(s / 3);
      const stCol = s % 3;
      const dRow = stRow - 1;
      const dCol = stCol - 1;
      const r2 = row + dRow * 2;
      const c2 = col + dCol * 2;
      if (r2 >= 0 && r2 < 5 && c2 >= 0 && c2 < 5) {
        VSneighbors.push(r2 * 5 + c2);
      }
    }
    let neighborIndex = VSneighbors[s];
    let neighborTile = tiles[neighborIndex];
    if (neighborTile && CONFIG.three.includes(neighborTile.value)) {
      next = neighborIndex;
    }
  }
  if (VScircle && VScircle.classList && VScircle.classList.contains("VScircle")) {
    VSswap(index, next);
    return;
  }
}
function click2(e) {
  let src = e.target;
  const td2 = src.closest("td");
  if (!td2) return;
    const index = parseInt(td2.dataset.index);
    const neighbors2 = [];
  if (gameState.fastTd2 !== null) {
    const row = Math.floor((gameState.fastTd2 - CONFIG.ST_INDEX_OFFSET) / 3);
    const col = (gameState.fastTd2 - CONFIG.ST_INDEX_OFFSET) % 3;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < 3 && c >= 0 && c < 3) {
          neighbors2.push(r * 3 + c + 25);
        }
      }
    }
  }
  if (src.classList && src.classList.contains("circle2")) {
    const circle = td2.querySelector('.circle2');
    if (!circle) return;
    if (gameState.fastTd2 == null) {
      gameState.fastTd2 = index;
      return;
    }
    if (gameState.fastTd2 !== index && neighbors2.includes(index)) {
      swap2(gameState.fastTd2, index);
      gameState.fastTd2 = null;
      return;
    }
    if (gameState.fastTd2 === index) {
      const circle = td2.querySelector('.circle2');
    if (!circle) return;
      const allSTcells = document.querySelectorAll('td.ST');
      allSTcells.forEach(cell => {
        if (cell.dataset.overrideColor === CONFIG.OTHER_COLOR) {
          const prev = cell.dataset.prevColor || getDefaultSTColor(cell.value);
          const c2 = cell.querySelector('.circle2');
          if (c2) c2.style.backgroundColor = prev;
          delete cell.dataset.overrideColor;
          delete cell.dataset.prevColor;
        }
      });
      const clickedColor =
        circle.style.backgroundColor ||
        getComputedStyle(circle).backgroundColor ||
        getDefaultSTColor(td2.value);//初期値を返すぐらいならエラーにする
      const newOtherColor = clickedColor;
      const newCellColor = CONFIG.OTHER_COLOR;
      CONFIG.OTHER_COLOR = newOtherColor;
      td2.dataset.prevColor = clickedColor;
      td2.dataset.overrideColor = newCellColor;
      circle.style.backgroundColor = newCellColor;
      gameState.savedST = { index: index, prevColor: clickedColor };
      gameState.fastTd2 = null;
      return;
    }
  socket.emit("playerAction", {
    type: "click",
    index: index,
    color: circle.style.backgroundColor
  });
  }
}
function swap(i, j) {
  const aVal = tiles[i].value;
  const bVal = tiles[j].value;
  if (CONFIG.three.includes(aVal) && CONFIG.three2.includes(bVal)) {
    tiles[j].value = aVal;
    tiles[j].classList.remove('empty');
    tiles[j].innerHTML = "";
    if (tiles[i].dataset.overrideColor) {
      tiles[j].dataset.overrideColor = tiles[i].dataset.overrideColor;
    } else {
      delete tiles[j].dataset.overrideColor;
    }
    delete tiles[i].dataset.overrideColor;
    tiles[j].appendChild(createTileContent(tiles[j].value, tiles[j].dataset.overrideColor));
    tiles[i].value = 0;
    tiles[i].classList.add('empty');
    tiles[i].innerHTML = "";
    delete tiles[i].dataset.overrideColor;
    tiles[i].appendChild(createTileContent(tiles[i].value, tiles[i].dataset.overrideColor));
    if (gameState.gamestart) {
      gameState.mytarn = !gameState.mytarn;
      VSthink();
    }
    checkAllFish();
    return;
  }
  const tmpValue = tiles[i].value;
  tiles[i].value = tiles[j].value;
  tiles[j].value = tmpValue;
  const tmpOverride = tiles[i].dataset.overrideColor;
  if (tiles[j].dataset.overrideColor) {
    tiles[i].dataset.overrideColor = tiles[j].dataset.overrideColor;
  } else {
    delete tiles[i].dataset.overrideColor;
  }
  if (tmpOverride) {
    tiles[j].dataset.overrideColor = tmpOverride;
  } else {
    delete tiles[j].dataset.overrideColor;
  }
  tiles[i].innerHTML = "";
  tiles[j].innerHTML = "";
  tiles[i].appendChild(createTileContent(tiles[i].value, tiles[i].dataset.overrideColor));
  tiles[j].appendChild(createTileContent(tiles[j].value, tiles[j].dataset.overrideColor));
  if (gameState.gamestart) {
    gameState.mytarn = !gameState.mytarn;
    VSthink();
  }
  checkAllFish();
}
function swap2(a, b) {
  const A = STMap[a];
  const B = STMap[b];
  if (!A || !B) return;
  const tmpValue2 = A.value;
  A.value = B.value;
  B.value = tmpValue2;
  const tmpOverride2 = A.dataset.overrideColor;
  const tmpPrev2 = A.dataset.prevColor;
  if (B.dataset.overrideColor) A.dataset.overrideColor = B.dataset.overrideColor; else delete A.dataset.overrideColor;
  if (B.dataset.prevColor) A.dataset.prevColor = B.dataset.prevColor; else delete A.dataset.prevColor;
  if (tmpOverride2) B.dataset.overrideColor = tmpOverride2; else delete B.dataset.overrideColor;
  if (tmpPrev2) B.dataset.prevColor = tmpPrev2; else delete B.dataset.prevColor;
  if (gameState.savedST) {
    if (gameState.savedST.index === a) gameState.savedST.index = b;
    else if (gameState.savedST.index === b) gameState.savedST.index = a;
  }
  A.innerHTML = "";
  B.innerHTML = "";
  A.appendChild(createTileContent(A.value, A.dataset.overrideColor));
  B.appendChild(createTileContent(B.value, B.dataset.overrideColor));
  checkAllFish();
}
function VSswap(a, b) {
  const tileA = tiles[a];
  const tileB = tiles[b];
  if (CONFIG.three.includes(tileB.value)) {
    const removedValue = tileB.value;
    tileB.value = tileA.value;
    tileB.classList.remove("empty");
    tileB.innerHTML = "";
    if (tileA.dataset.overrideColor) tileB.dataset.overrideColor = tileA.dataset.overrideColor; else delete tileB.dataset.overrideColor;
    delete tileA.dataset.overrideColor;
    tileB.appendChild(createTileContent(tileB.value, tileB.dataset.overrideColor));
    tileA.value = 0;
    tileA.classList.add("empty");
    tileA.innerHTML = "";
    delete tileA.dataset.overrideColor;
    tileA.appendChild(createTileContent(tileA.value, tileA.dataset.overrideColor));
    if (removedValue === 17) gameState.fishAnpi17 = false;
    else if (removedValue === 18) gameState.fishAnpi18 = false;
    else if (removedValue === 19) gameState.fishAnpi19 = false;
    if (!gameState.fishAnpi17 && !gameState.fishAnpi18 && !gameState.fishAnpi19) {//別処理で書いてほしい
      showGameOver();
    }
    gameState.mytarn = !gameState.mytarn;
    return;
  }
  const tmp = tileA.value;
  tileA.value = tileB.value;
  tileB.value = tmp;
  const tmpOv = tileA.dataset.overrideColor;
  if (tileB.dataset.overrideColor) tileA.dataset.overrideColor = tileB.dataset.overrideColor; else delete tileA.dataset.overrideColor;
  if (tmpOv) tileB.dataset.overrideColor = tmpOv; else delete tileB.dataset.overrideColor;
  tileA.innerHTML = "";
  tileB.innerHTML = "";
  tileA.appendChild(createTileContent(tileA.value, tileA.dataset.overrideColor));
  tileB.appendChild(createTileContent(tileB.value, tileB.dataset.overrideColor));
  gameState.mytarn = !gameState.mytarn;
  checkAllFish();
}
function redrawTiles() {
  for (let i = 0; i < tiles.length; i++) {
    const td = tiles[i];
    td.innerHTML = "";
    td.appendChild(createTileContent(td.value, td.dataset.overrideColor));
  }
}
function showGameOver() {
  gameState.running = false;
  const message = document.getElementById("gameOverMessage");
  if (message) message.textContent = "ゲームオーバー";
  const overlay = document.getElementById("gameOver");
  if (overlay) overlay.classList.remove("hidden");
  document.querySelectorAll('.tile').forEach(td => td.style.pointerEvents = 'none');
}
function checkAllFish() {
  const all = tiles.concat(STs).concat(VSSTs);
  const playerPresent = all.some(td => CONFIG.three.includes(td.value));
  const enemyPresent = all.some(td => CONFIG.three2.includes(td.value));
  if (!playerPresent) {
    showGameOver();
    return;
  }
  if (!enemyPresent) {
    showWin();
    return;
  }
}
function showWin() {
  gameState.running = false;
  const overlay = document.getElementById("winOverlay");
  if (overlay) overlay.classList.remove("hidden");
  const msg = document.getElementById("winMessage");
  if (msg) msg.textContent = "YOU WIN";
  document.querySelectorAll('.tile').forEach(td => td.style.pointerEvents = 'none');
}
function resetGame() {
  const overlay = document.getElementById("gameOver");
  if (overlay) overlay.classList.add("hidden");
  const winO = document.getElementById("winOverlay");
  if (winO) winO.classList.add("hidden");
  document.querySelectorAll('.tile').forEach(td => td.style.pointerEvents = 'auto');
  gameState.fishAnpi17 = true;
  gameState.fishAnpi18 = true;
  gameState.fishAnpi19 = true;
  gameState.startTime = null;
  gameState.remainingTime = 10.0;
  gameState.running = true;
  gameState.gamestart = false;
  gameState.mytarn = true;
  gameState.fastTd = null;
  gameState.fastTd2 = null;
  tiles.forEach((td, i) => {
    td.value = i + 1;
    td.classList.remove('empty');
    td.innerHTML = "";
    // ensure any previous override is cleared on reset
    delete td.dataset.overrideColor;
    td.appendChild(createTileContent(td.value, td.dataset.overrideColor));
  });
  STs.forEach((td, i) => {
    td.value = i + CONFIG.ST_VALUE_OFFSET;
    td.classList.remove('empty');
    td.innerHTML = "";
    delete td.dataset.overrideColor;
    td.appendChild(createTileContent(td.value, td.dataset.overrideColor));
  });
  VSSTs.forEach((td, i) => {
    td.value = i + CONFIG.VSST_VALUE_OFFSET;
    td.classList.remove('empty');
    td.innerHTML = "";
    delete td.dataset.overrideColor;
    td.appendChild(createTileContent(td.value, td.dataset.overrideColor));
  });
  const timer = document.getElementById("mytime");
  if (timer) {
    const secondsPart = Math.floor(gameState.remainingTime);
    const fraction = Math.floor((gameState.remainingTime - secondsPart) * 100);
    timer.textContent = String(secondsPart).padStart(2, '0') + '.' + String(fraction).padStart(2, '0');
  }
  const startBtn = document.getElementById('startButton');
  if (startBtn) startBtn.style.display = '';
}
document.addEventListener('DOMContentLoaded', () => {
  const ok = document.getElementById('gameOverOk');
  if (ok) ok.addEventListener('click', resetGame);
  const wok = document.getElementById('winOk');
  if (wok) wok.addEventListener('click', resetGame);
});
function count(now) {
  if (!gameState.startTime) gameState.startTime = now;
  const elapsed = (now - gameState.startTime) / 1000;
  const timeLeft = Math.max(0, gameState.remainingTime - elapsed);
  const secondsPart = Math.floor(timeLeft);
  const fraction = Math.floor((timeLeft - secondsPart) * 100);
  const display = String(secondsPart).padStart(2, '0') + '.' + String(fraction).padStart(2, '0');
  document.getElementById("mytime").textContent = display;
  if (timeLeft > 0 && gameState.running) {
    requestAnimationFrame(count);
  } else {
    document.getElementById("mytime").textContent = "00.00";
    gameState.running = false;
  }
}
socket.on("playerAction", data => {
  if (data.type === "click") {
    applyOpponentMove(data.index, data.color);
  }
});
function applyOpponentMove(index, color) {
  const cell = STMap[index];
  if (!cell) return;

  const circle = cell.querySelector(".circle2");
  if (!circle) return;

  circle.style.backgroundColor = color;
}
window.onload = () => {
  init();
};
