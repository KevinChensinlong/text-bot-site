document.addEventListener('DOMContentLoaded', () => {
  // 變數與清單（對應 Scratch 變數 / 清單）
  const state = {
    字串: '',
    n1: '',
    n: 1,
    儲存碼_顯示: [],
    儲存碼_匯出: []
  };

  // 安全取得 DOM 元素（若找不到則記錄錯誤）
  const getEl = id => {
    const e = document.getElementById(id);
    if (!e) console.error(`Missing element with id="${id}" — please check index.html contains this id.`);
    return e;
  };

  const el = {
    input: getEl('inputText'),
    output: getEl('output'),
    saveList: getEl('saveList'),
    runEncrypt: getEl('runEncrypt'),
    runDecode: getEl('runDecode'),
    runConvertTextToString: getEl('runConvertTextToString'),
    runConvertStringToText: getEl('runConvertStringToText'),
    clearBtn: getEl('clearBtn'),
    showListBtn: getEl('showListBtn'),
    hideListBtn: getEl('hideListBtn'),
    addErrorBtn: getEl('addErrorBtn'),
    saveCurrentBtn: getEl('saveCurrentBtn')
  };

  function setVar(name, value){ state[name] = value; }
  function addToList(listName, item){ state[listName].push(item); renderList(); }
  function hideList(){ if(el.saveList) el.saveList.classList.add('hidden'); }
  function showList(){ if(el.saveList) el.saveList.classList.remove('hidden'); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function renderList(){
    if(!el.saveList) return;
    el.saveList.innerHTML = state['儲存碼_顯示'].map((v,i)=>`<li>${i+1}. ${escapeHtml(String(v))}</li>`).join('') || '<li class="muted">（空）</li>';
  }

  // 轉換積木 1
  function 字串轉文字條件確認(){
    if(!el.input || !el.output){ console.warn('Input or output element missing'); return; }
    const ans = el.input.value || '';
    setVar('字串', String(ans));
    setVar('n1', '');
    setVar('n', 1);

    for(let i=0;i<9;i++){
      const s = state['字串'];
      const idx = state['n'];
      const ch = (idx >= 1 && idx <= s.length) ? s.charAt(idx-1) : '';
      setVar('n1', state['n1'] + s + ch);
      setVar('n', state['n'] + 1);
    }
    el.output.textContent = state['n1'];
  }

  // 轉換積木 2
  function 轉換_字串轉文字(){
    字串轉文字條件確認();
    addToList('儲存碼_顯示', state['n1']);
  }

  // 轉換積木 3
  function 轉換_文字轉字串(){
    if(!el.input || !el.output){ console.warn('Input or output element missing'); return; }
    const s = el.input.value || '';
    setVar('字串', String(s));
    setVar('n1', '');
    setVar('n', 1);
    for(let i=0;i<9;i++){
      const idx = state['n'];
      const ch = (idx >=1 && idx <= state['字串'].length) ? state['字串'].charAt(idx-1) : '';
      setVar('n1', state['n1'] + '[' + state['字串'] + ']' + ch);
      setVar('n', state['n'] + 1);
    }
    el.output.textContent = state['n1'];
    addToList('儲存碼_匯出', state['n1']);
  }

  function whenReceive_加密(){ 轉換_文字轉字串(); }
  function whenReceive_解碼(){ 轉換_字串轉文字(); }
  function 添加系統錯誤(){ addToList('儲存碼_顯示', '系統：錯誤'); }

  // 安全綁定事件（只有在元素存在時才綁定）
  function safeBind(elRef, ev, fn){
    if(!elRef) return;
    try { elRef.addEventListener(ev, fn); }
    catch(e){ console.error('Failed to bind event', e); }
  }

  safeBind(el.runEncrypt, 'click', whenReceive_加密);
  safeBind(el.runDecode, 'click', whenReceive_解碼);
  safeBind(el.runConvertTextToString, 'click', 轉換_文字轉字串);
  safeBind(el.runConvertStringToText, 'click', 轉換_字串轉文字);
  safeBind(el.clearBtn, 'click', ()=>{ if(el.input) el.input.value=''; if(el.output) el.output.textContent='已清除'; });
  safeBind(el.showListBtn, 'click', showList);
  safeBind(el.hideListBtn, 'click', hideList);
  safeBind(el.addErrorBtn, 'click', 添加系統錯誤);
  safeBind(el.saveCurrentBtn, 'click', ()=>{
    const v = (el.output && el.output.textContent) || (el.input && el.input.value) || '';
    if(v) addToList('儲存碼_匯出', v);
  });

  renderList();

  // 如果有 Console 錯誤仍然發生，引導輸出當前元素狀況
  console.log('script initialized. DOM elements presence:', {
    input: !!el.input, output: !!el.output, runEncrypt: !!el.runEncrypt, runDecode: !!el.runDecode
  });
});
