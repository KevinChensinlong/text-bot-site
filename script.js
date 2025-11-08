// 變數與清單（對應 Scratch 變數 / 清單）
const state = {
  // 對應積木：變數 字串, n1, n 等
  字串: '',
  n1: '',
  n: 1,
  儲存碼_顯示: [],   // list: 儲存碼-顯示
  儲存碼_匯出: []    // list: 儲存碼-匯出
};

// DOM
const el = {
  input: document.getElementById('inputText'),
  output: document.getElementById('output'),
  saveList: document.getElementById('saveList'),
  runEncrypt: document.getElementById('runEncrypt'),
  runDecode: document.getElementById('runDecode'),
  runConvertTextToString: document.getElementById('runConvertTextToString'),
  runConvertStringToText: document.getElementById('runConvertStringToText'),
  clearBtn: document.getElementById('clearBtn'),
  showListBtn: document.getElementById('showListBtn'),
  hideListBtn: document.getElementById('hideListBtn'),
  addErrorBtn: document.getElementById('addErrorBtn'),
  saveCurrentBtn: document.getElementById('saveCurrentBtn')
};

// 基本工具函式（不對積木做語意改變）
function setVar(name, value){ state[name] = value; }
function addToList(listName, item){ state[listName].push(item); renderList(); }
function hideList(){ el.saveList.classList.add('hidden'); }
function showList(){ el.saveList.classList.remove('hidden'); }
function renderList(){
  el.saveList.innerHTML = state['儲存碼_顯示'].map((v,i)=>`<li>${i+1}. ${escapeHtml(String(v))}</li>`).join('') || '<li class="muted">（空）</li>';
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// 轉換積木 1: 定義 字串轉文字條件確認
// 依你積木：把 輸入答案 存到 變數 字串，n1=0, n=1, 重複 9 次： n1 = 組合 n1 字串 第 n 字
function 字串轉文字條件確認(){
  // 對應積木： 變數 字串 設為 詢問的答案
  const ans = el.input.value || '';
  setVar('字串', String(ans));
  // 變數 n1 設為 0  -> 保持字串型態
  setVar('n1', '');
  // 變數 n 設為 1
  setVar('n', 1);

  // 重複 9 次
  for(let i=0;i<9;i++){
    const s = state['字串'];
    const idx = state['n'];
    // 取第 n 字（如果超出，取空字）
    const ch = (idx >= 1 && idx <= s.length) ? s.charAt(idx-1) : '';
    // 變數 n1 設為 組合 n1 字串 第 n 字
    setVar('n1', state['n1'] + s + ch);
    // 變數 n 改變 1
    setVar('n', state['n'] + 1);
  }
  // 把結果放到輸出（對應 say new text）
  el.output.textContent = state['n1'];
}

// 轉換積木 2: 轉換(字串轉文字)（單一動作）
function 轉換_字串轉文字(){
  // 直接呼叫 字串轉文字條件確認
  字串轉文字條件確認();
  // 根據你積木可能會有顯示動作，這裡把 n1 加到 儲存碼_顯示 清單
  addToList('儲存碼_顯示', state['n1']);
}

// 轉換積木 3: 轉換(文字轉字串)
// 模擬「將輸入文字轉成字串格式」：此處實作為把輸入每字用逗號分隔並組合 9 次（直接對應「重複 9 次 組合」）
function 轉換_文字轉字串(){
  const s = el.input.value || '';
  setVar('字串', String(s));
  setVar('n1', '');
  setVar('n', 1);
  for(let i=0;i<9;i++){
    const idx = state['n'];
    const ch = (idx >=1 && idx <= state['字串'].length) ? state['字串'].charAt(idx-1) : '';
    // 把 n1 設為 組合 n1,字串,第 n 字 -> 以明確可視的分隔符組合
    setVar('n1', state['n1'] + '[' + state['字串'] + ']' + ch);
    setVar('n', state['n'] + 1);
  }
  el.output.textContent = state['n1'];
  addToList('儲存碼_匯出', state['n1']);
}

// 當收到 訊息 加密 / 解碼 的對應（按鈕觸發）
// 這裡不嘗試解讀你原演算法，只把呼叫序列照積木邏輯執行

function whenReceive_加密(){
  // 對應積木: 當收到訊息 加密 -> 觸發 轉換(文字轉字串)（或你提供的順序）
  轉換_文字轉字串();
}

function whenReceive_解碼(){
  // 對應積木: 當收到訊息 解碼 -> 觸發 字串轉文字條件確認（或你提供的順序）
  轉換_字串轉文字();
}

// 其他積木對應：添加(系統：錯誤) 到 [儲存碼-顯示]
function 添加系統錯誤(){
  addToList('儲存碼_顯示', '系統：錯誤');
}

// init event binding
el.runEncrypt.addEventListener('click', whenReceive_加密);
el.runDecode.addEventListener('click', whenReceive_解碼);
el.runConvertTextToString.addEventListener('click', 轉換_文字轉字串);
el.runConvertStringToText.addEventListener('click', 轉換_字串轉文字);
el.clearBtn.addEventListener('click', ()=>{ el.input.value=''; el.output.textContent='已清除'; });
el.showListBtn.addEventListener('click', showList);
el.hideListBtn.addEventListener('click', hideList);
el.addErrorBtn.addEventListener('click', 添加系統錯誤);
el.saveCurrentBtn.addEventListener('click', ()=>{
  const v = el.output.textContent || el.input.value || '';
  if(v) addToList('儲存碼_匯出', v);
});
renderList();

