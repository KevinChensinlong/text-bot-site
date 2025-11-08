document.addEventListener('DOMContentLoaded', () => {
  const PREFIX = 'SaveCode2';

  const el = {
    input: document.getElementById('inputText'),
    output: document.getElementById('output'),
    encryptBtn: document.getElementById('encryptBtn'),
    decodeBtn: document.getElementById('decodeBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  function log(msg){ console.log('[SaveCode2]', msg); }

  // Fisher-Yates 隨機排列 1..n
  function randomPermutation(n){
    const a = Array.from({length:n}, (_,i)=>i+1);
    for(let i=n-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 輸入安全化：去除常見零寬字元但保留內部符號（不移除冒號）
  function normalizeInput(raw){
    if(typeof raw !== 'string') return '';
    return raw.replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
  }

  // 嚴格檢查：前九個字是否為 "SaveCode2"
  function startsWithSaveCode2Strict(s){
    const n = normalizeInput(s);
    if(n.length < 9) return false;
    return n.slice(0,9) === PREFIX;
  }

  // 加密：回傳 { result } 或 { error }
  function encryptText(plaintext){
    plaintext = String(plaintext || '');
    const n = plaintext.length;
    if(n === 0) return { error: '請輸入要加密的文字' };
    const perm = randomPermutation(n);
    const cipherChars = perm.map(p => plaintext.charAt(p-1));
    const cipher = cipherChars.join('');
    const header = PREFIX + perm.join('-') + ':';
    return { result: header + cipher };
  }

  // 解碼（採用前九字嚴格檢查，且只使用第一個冒號作為分隔）
  function decodeText(input){
    input = normalizeInput(String(input || ''));
    if(!startsWithSaveCode2Strict(input)) return { error: '系統：錯誤（前九字非 SaveCode2）' };

    // 去掉前九字 "SaveCode2"
    const rest = input.slice(9);
    // 使用 indexOf 找第一個冒號，確保即使密文內含其他冒號也不影響
    const colonIndex = rest.indexOf(':');
    if(colonIndex === -1) return { error: '系統：錯誤（缺少 ":"）' };

    // 只以第一個冒號為分隔，之後的冒號視為密文內容的一部分
    const permPart = rest.slice(0, colonIndex).trim();
    const cipher = rest.slice(colonIndex + 1); // 保留冒號之後的所有內容（可能包含其他冒號）
    if(!permPart) return { error: '系統：錯誤（排列為空）' };

    const tokens = permPart.split('-').filter(t => t.length>0);
    const perm = tokens.map(t => {
      const v = parseInt(t, 10);
      return Number.isFinite(v) ? v : NaN;
    });
    if(perm.some(isNaN)) return { error: '系統：錯誤（排列含非數字）' };

    if(perm.length !== cipher.length) return { error: '系統：錯誤（排列長度與密文長度不符）' };

    // 驗證是正確的 1..n 排列
    const n = perm.length;
    const seen = new Array(n+1).fill(false);
    for(let i=0;i<n;i++){
      const v = perm[i];
      if(v < 1 || v > n) return { error: '系統：錯誤（排列值超出範圍）' };
      if(seen[v]) return { error: '系統：錯誤（排列含重複）' };
      seen[v] = true;
    }

    // 還原：cipher 的第 i 字元放到 plaintext 的 perm[i]-1 位置
    const out = new Array(n).fill('');
    for(let i=0;i<n;i++){
      const target = perm[i] - 1;
      out[target] = cipher.charAt(i) || '';
    }
    return { result: out.join('') };
  }

  function show(obj){
    if(!el.output) return;
    if(obj.error){
      el.output.textContent = obj.error;
      el.output.style.color = 'crimson';
    } else {
      el.output.textContent = obj.result;
      el.output.style.color = '#111';
    }
  }

  // 綁定
  if(el.encryptBtn) el.encryptBtn.addEventListener('click', () => {
    const res = encryptText(el.input ? el.input.value : '');
    show(res);
    log(res);
  });

  if(el.decodeBtn) el.decodeBtn.addEventListener('click', () => {
    const res = decodeText(el.input ? el.input.value : '');
    show(res);
    log(res);
  });

  if(el.clearBtn) el.clearBtn.addEventListener('click', () => {
    if(el.input) el.input.value = '';
    if(el.output) { el.output.textContent = '已清除'; el.output.style.color = '#111'; }
  });

  log('initialized');
});
