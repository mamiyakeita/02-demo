"use strict";
const tiles = [];
const STs = [];
const sk8 = [26, 27, 28, 29, 30, 31, 32, 33, 34];
const three = [17, 18, 19];
function createTileContent(value) {
  const container = document.createElement("div");
  container.className = "tile-content";
  if (sk8.includes(value)) {
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
    circle2.style.backgroundColor = backgroundColor;
    container.appendChild(circle2);
  }
  if (three.includes(value)) {
    const circle = document.createElement("div");
    const triangle = document.createElement("div");
    let backgroundColor;
    if (value === 17) backgroundColor = "red";
    else if (value === 18) backgroundColor = "blue";
    else if (value === 19) backgroundColor = "green";
    circle.className = "circle";
    triangle.className = "triangle";
    circle.style.backgroundColor = backgroundColor;
    triangle.style.borderBottomColor = backgroundColor;
    container.appendChild(circle);
    container.appendChild(triangle);
  }
  return container;
}
const STMap = {};
function init() {
  const sakusen = document.getElementById("sakusen");
  for (let i = 0; i < 3; i++) {
    const tr2 = document.createElement("tr");
    for (let j = 0; j < 3; j++) {
      const td2 = document.createElement("td");
      const index = i * 3 + j;
      const dataIndex = index + 25;
      td2.className = "ST";
      td2.index = dataIndex;//不要？
      td2.value = index + 26;
      td2.onclick = click2;
      td2.setAttribute("data-index", index + 25);
      td2.appendChild(createTileContent(td2.value));
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
      td.appendChild(createTileContent(td.value));
      tr.appendChild(td);
      tiles.push(td);
    }
    table.appendChild(tr);
  }
}
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
    return;
  }
  if (src.className !== "circle" && fastTd !== null && neighbors.includes(index)) {
    swap(fastTd, index);
    fastTd = null;
    return;
  }
}
function click2(e) {
  let src = e.target;
  const td2 = src.closest("td");//
  //if (!td2) return;//エラーが出たら追加を検討
  const index = parseInt(td2.dataset.index)//index, 10も検討
  //if (Number.isNaN(index)) return;
  const row = Math.floor((fastTd2 - 25) / 3);//ここから下の計算を消す
  const col = (fastTd2 - 25) % 3;
  const neighbors2 = [];
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
  if (src.className == "circle2" && fastTd2 == null) {
    fastTd2 = index;
    return;
  }
  if (src.className == "circle2" && fastTd2 !== null && neighbors2.includes(index)) {
    swap2(fastTd2, index);
    fastTd2 = null;
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
function swap2(a, b) {
  const A = STMap[a];
  const B = STMap[b];
  if (!A || !B) return;
  const tmpValue2 = A.value;
  A.value = B.value;
  B.value = tmpValue2;
  A.innerHTML = "";
  B.innerHTML = "";
  A.appendChild(createTileContent(A.value));
  B.appendChild(createTileContent(B.value));//注意: マップを初期化で必ず埋める
}
let startTime = null;
let fastTd = null;
let fastTd2 = null;
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
    document.getElementById("mytime").textContent = "00.00";
    running = false;
  }
}
window.onload = () => {
  requestAnimationFrame(count);
  init();
};
