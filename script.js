// state and storage
const H_KEY = 'texttool_history_v1';
const MAX_HISTORY = 100;

const el = {
  input: document.getElementById('inputText'),
  encryptBtn: document.getElementById('encryptBtn'),
  decodeBtn: document.getElementById('decodeBtn'),
  clearBtn: document.getElementById('clearBtn'),
  output: document.getElementById('output'),
  saveBtn: document.getElementById('saveBtn'),
  exportBtn: document.getElementById('exportBtn'),
  toggleListBtn: document.getElementById('toggleListBtn'),
  historyList: document.getElementById('historyList')
};

// load history
let history = JSON.parse(localStorage.getItem(H_KEY) || '[]');
renderHistory();

// —— 你在 Scratch 中的邏輯對應說明（簡短） ——
// - 逐字處理 = for 迴圈 遍歷字串的每個字元
// - 判斷 n1 = SaveCode2 = 用變數比較的概念 -> JS 中用 if (n1===saveCode2)
// - 字串轉文字 / 文字轉字串 = 文字處理函式（以下用簡單示範演算法）
// - 加密 / 解碼 按鈕 -> 分別呼叫 encryptText() / decodeText()

// 範例加密/解碼演算法（你可以依需求修改）
// 這裡示範：以簡單「自訂替換與位置組合」為例（模擬 Scratch 的逐字組合邏輯）
// 注意：實務上請換成你原本的演算法邏輯

function sanitizeInput(s){
  return s == null ? '' : String(s);
}

// 範例：簡單的字元映射表（可擴充）
const MAP = {
  'a':'m','b':'n','c':'b','d':'v','e':'c','f':'x','g':'z',
  'h':'l','i':'k','j':'j','k':'h','l':'g','m':'f','n':'d',
  'o':'s','p':'a','q':'p','r':'o','s':'i','t':'u','u':'y',
  'v':'t','w':'r','x':'e','y':'w','z':'q',
  'A':'M','B':'N','C':'B' // 只示範部分，大寫對應可自行擴充
};

// 範例加密：逐字替換，並在每三個字元插入一個標記（模擬組合）
function encryptText(input){
  input = sanitizeInput(input);
  if(input.length === 0) return '⚠️ 請先輸入文字';
  let out = '';
  for(let i = 0; i < input.length; i++){
    const ch = input[i];
    // 如果是空白，保留一個空格（模擬 Scratch 中空白處理）
    if(/\s/.test(ch)){
      out += ' ';
      continue;
    }
    // 用映射表替換，找不到就保留原字元
    out += (MAP[ch] || ch);
    // 每三個非空白字元插入 '|'
    const nonSpaceCount = out.replace(/\s/g,'').length;
    if(nonSpaceCount % 3 === 0 && i !== input.length - 1) out += '|';
  }
  return out;
}

// 範例解碼：逆向處理（先移除分隔符號，然後用反向映射）
function decodeText(input){
  input = sanitizeInput(input);
  if(input.length === 0) return '⚠️ 請先輸入文字';
  // 移除分隔符
  const cleaned = input.replace(/\|/g, '');
  // 建立反向映射
  const rev = {};
  for(const k in MAP) rev[MAP[k]] = k;
  let out = '';
  for(const ch of cleaned){
    if(/\s/.test(ch)){
      out += ' ';
      continue;
    }
    out += (rev[ch] || ch);
  }
  return out;
}

// 顯示結果
function showResult(html){
  el.output.textContent = html;
}

// 事件綁定
el.encryptBtn.addEventListener('click', () => {
  const res = encryptText(el.input.value);
  showResult(res);
});

el.decodeBtn.addEventListener('click', () => {
  const res = decodeText(el.input.value);
  showResult(res);
});

el.clearBtn.addEventListener('click', () => {
  el.input.value = '';
  showResult('已清除');
});

// 儲存 / 匯出 / 顯示清單
el.saveBtn.addEventListener('click', () => {
  const text = el.input.value || el.output.textContent || '';
  if(!text) { alert('沒有內容可儲存'); return; }
  history.unshift({text, time: new Date().toISOString()});
  if(history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(H_KEY, JSON.stringify(history));
  renderHistory();
});

el.exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(history, null, 2);
  // 建立下載檔案
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'history.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

el.toggleListBtn.addEventListener('click', () => {
  el.historyList.classList.toggle('hidden');
});

function renderHistory(){
  if(!history || history.length === 0){
    el.historyList.innerHTML = '<li class="muted">目前沒有紀錄</li>';
    return;
  }
  el.historyList.innerHTML = history.map((h, idx) =>
    `<li><strong>#${history.length - idx}</strong> ${new Date(h.time).toLocaleString()} — <span class="small">${escapeHtml(h.text)}</span></li>`
  ).join('');
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

// 初始化：如果想要自動把 textarea 當作 ask => 可加入鍵盤 Enter 提交
el.input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
    // Ctrl/Cmd+Enter 送出加密
    const res = encryptText(el.input.value);
    showResult(res);
  }
});
