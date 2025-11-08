document.addEventListener('DOMContentLoaded', () => {
  // state 對應你的積木變數 / 清單
  const state = {
    字串: '',
    n1: '',
    n: 1,
    儲存碼_顯示: [],
    儲存碼_匯出: []
  };

  // DOM
  const getEl = id => document.getElementById(id);
  const el = {
    input: getEl('inputText'),
    output: getEl('output'),
    saveList: getEl('saveList'),
    exportList: getEl('exportList'),
    runEncrypt: getEl('runEncrypt'),
    runDecode: getEl('runDecode'),
    runConvertTextToString: getEl('runConvertTextToString'),
    runConvertStringToText: getEl('runConvertStringToText'),
    clearBtn: getEl('clearBtn'),
    showListBtn: getEl('showListBtn'),
    hideListBtn: getEl('hideListBtn'),
    addErrorBtn: getEl('addErrorBtn'),
    saveCurrentBtn: getEl('saveCurrentBtn'),
    toggleExportBtn: getEl('toggleExportBtn'),
    saveCode2Input: getEl('saveCode2')
  };

  // 工具
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderLists(){
    if(el.saveList) el.saveList.innerHTML = state.儲存碼_顯示.length ? state.儲存碼_顯示.map((v,i)=>`<li>${i+1}. ${escapeHtml(String(v))}</li>`).join('') : '<li class="muted">（空）</li>';
    if(el.exportList) el.exportList.innerHTML = state.儲存碼_匯出.length ? state.儲存碼_匯出.map((v,i)=>`<li>${i+1}. ${escapeHtml(String(v))}</li>`).join('') : '<li class="muted">（空）</li>';
  }
  function addToList(name, val){
    if(name === '儲存碼_顯示') state.儲存碼_顯示.push(val);
    if(name === '儲存碼_匯出') state.儲存碼_匯出.push(val);
    renderLists();
  }

  // -----------------------------
  // 積木對應函式（保持原順序與動作）
  // -----------------------------

  // 字串轉文字條件確認
  function 字串轉文字條件確認(){
    const ans = (el.input && el.input.value) ? el.input.value : '';
    state.字串 = String(ans);
    state.n1 = '';
    state.n = 1;
    for(let i=0;i<9;i++){
      const s = state.字串;
      const idx = state.n;
      const ch = (idx >=1 && idx <= s.length) ? s.charAt(idx-1) : '';
      // n1 設為 組合 n1 字串 第 n 字
      state.n1 = state.n1 + s + ch;
      state.n = state.n + 1;
    }
    if(el.output) el.output.textContent = state.n1;
  }

  // 轉換(字串轉文字)
  function 轉換_字串轉文字(){
    字串轉文字條件確認();
    addToList('儲存碼_顯示', state.n1);
  }

  // 轉換(文字轉字串)
  function 轉換_文字轉字串(){
    const s = (el.input && el.input.value) ? el.input.value : '';
    state.字串 = String(s);
    state.n1 = '';
    state.n = 1;
    for(let i=0;i<9;i++){
      const idx = state.n;
      const ch = (idx >=1 && idx <= state.字串.length) ? state.字串.charAt(idx-1) : '';
      state.n1 = state.n1 + '[' + state.字串 + ']' + ch;
      state.n = state.n + 1;
    }
    if(el.output) el.output.textContent = state.n1;
    addToList('儲存碼_匯出', state.n1);
  }

  // 當收到 訊息 加密（按鈕）
  function whenReceive_加密(){
    // 對應你的積木：呼叫 轉換(文字轉字串)
    轉換_文字轉字串();
  }

  // 當收到 訊息 解碼（按鈕）
  function whenReceive_解碼(){
    // 對應你的積木：顯示 儲存碼-顯示、隱藏 儲存碼-匯出、執行 字串轉文字條件確認
    if(el.saveList) el.saveList.classList.remove('hidden');
    if(el.exportList) el.exportList.classList.add('hidden');
    字串轉文字條件確認();

    // 之後有條件判斷：如果 n1 = SaveCode2 那麼 轉換(字串轉文字) 否則 添加(系統：錯誤) 到 儲存碼-顯示
    const saveCode2 = (el.saveCode2Input && el.saveCode2Input.value) ? el.saveCode2Input.value : '';
    if(state.n1 === saveCode2){
      轉換_字串轉文字();
    } else {
      addToList('儲存碼_顯示', '系統：錯誤');
    }
  }

  // 添加系統錯誤（直接對應積木）
  function 添加系統錯誤(){
    addToList('儲存碼_顯示', '系統：錯誤');
  }

  // -----------------------------
  // 綁定（安全綁定，若元素缺失則略過）
  // -----------------------------
  function safe(id, ev, fn){ const e = el[id]; if(e) e.addEventListener(ev, fn); }

  safe('runEncrypt','click', whenReceive_加密);
  safe('runDecode','click', whenReceive_解碼);
  safe('runConvertTextToString','click', 轉換_文字轉字串);
  safe('runConvertStringToText','click', 轉換_字串轉文字);
  safe('clearBtn','click', ()=>{ if(el.input) el.input.value=''; if(el.output) el.output.textContent='已清除'; });
  safe('showListBtn','click', ()=>{ if(el.saveList) el.saveList.classList.remove('hidden'); });
  safe('hideListBtn','click', ()=>{ if(el.saveList) el.saveList.classList.add('hidden'); });
  safe('addErrorBtn','click', 添加系統錯誤);
  safe('saveCurrentBtn','click', ()=>{ const v = (el.output && el.output.textContent) || (el.input && el.input.value) || ''; if(v) addToList('儲存碼_匯出', v); });
  safe('toggleExportBtn','click', ()=>{ if(el.exportList) el.exportList.classList.toggle('hidden'); });

  renderLists();
  console.log('積木直譯版 script 初始化完成', {hasInput: !!el.input, hasOutput: !!el.output});
});
