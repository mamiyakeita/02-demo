"use strict";
const tiles = [];
const three = [22, 23, 24]; // ← 関数の外に出すことで一度だけ定義される
function createTileContent(value) {
  const container = document.createElement("div");
  container.className = "tile-content";
  if (three.includes(value)) {
    const circle = document.createElement("div");
    let backgroundColor;
    if (value === 22) backgroundColor = "red";
    else if (value === 23) backgroundColor = "blue";
    else if (value === 24) backgroundColor = "green";
    circle.className = "circle";
    circle.style.backgroundColor = backgroundColor; // ← これが必要！
    container.appendChild(circle);
  }
  return container;
}
function init() {
  const sakusen = document.getElementById("sakusen");
  const sakusenTiles = [];
  for (let i = 0; i < 3; i++) {
    const tr2 = document.createElement("tr");
    for (let j = 0; j < 3; j++) {
      const td2 = document.createElement("td");
      const index = i * 3 + j;
      td2.className = "sakusen-tile";
      td2.index = index + 25;
      td2.value = index + 25;
      td2.onclick = click;
      td2.textContent = "●";
      let textColor;
      if (td2.value === 25) textColor = "red";
      else if (td2.value === 26) textColor = "blue";
      else if (td2.value === 27) textColor = "green";
      else if (td2.value === 28) textColor = "yellow";
      else if (td2.value === 29) textColor = "purple";
      else if (td2.value === 30) textColor = "orange";
      else if (td2.value === 31) textColor = "black";
      else if (td2.value === 32) textColor = "white";
      else if (td2.value === 33) textColor = "brown";
      td2.style.color = textColor;
      td2.setAttribute("data-index", index + 25);
      td2.appendChild(createTileContent(td2.value));
      tr2.appendChild(td2);
      sakusenTiles.push(td2);
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
      td.appendChild(createTileContent(td.value));
      tr.appendChild(td);
      tiles.push(td);
    }
    table.appendChild(tr);
  }
}
let startTime = null;
let fastTd = null;
let flipTimer = NaN;
let remainingTime = 5.00;
let running = true;
function count(now) {
  if (!startTime) startTime = now;
  const elapsed = (now - startTime) / 1000; // 秒に変換
  const timeLeft = Math.max(0, remainingTime - elapsed);
  document.getElementById("mytime").textContent = timeLeft.toFixed(2); // 小数点2桁表示
  if (timeLeft > 0 && running) {
    requestAnimationFrame(count); // 次のフレームで再実行
  } else {
    document.getElementById("mytime").textContent = "00:00";
    running = false;
  }
}
window.onload = () => {
  requestAnimationFrame(count);
  init();
};
function click(e) {
  let src = e.target;
  const td = src.closest("td");
  const index = parseInt(td.dataset.index)
  const row = Math.floor(fastTd / 5);
  const col = fastTd % 5;
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
  if (src.className == "circle" && fastTd == null) {
    fastTd = index;
    console.log(fastTd);
    return;
  }
  if (src.className !== "circle" && fastTd !== null && neighbors.includes(index)) {
    swap(fastTd, index);
    fastTd = null;
    console.log(swapcircle);
    return;
  }
}
function swap(i, j) {
  const tmpValue = tiles[i].value;
  tiles[i].value = tiles[j].value;
  tiles[j].value = tmpValue;
  tiles[i].innerHTML = "";
  tiles[j].innerHTML = "";
  tiles[i].appendChild(createTileContent(tiles[i].value));
  tiles[j].appendChild(createTileContent(tiles[j].value));
}