document.addEventListener('DOMContentLoaded', () => {
  const PREFIX = 'SaveCode2';

  const el = {
    input: document.getElementById('inputText'),
    output: document.getElementById('output'),
    encryptBtn: document.getElementById('encryptBtn'),
    decodeBtn: document.getElementById('decodeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    copyFeedback: document.getElementById('copyFeedback')
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

  // 輸入安全化：去除零寬字元與 CR/LF，但保留內部符號（輸入欄為 single-line）
  function normalizeInput(raw){
    if(typeof raw !== 'string') return '';
    return raw.replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\r/g,'').replace(/\n/g,'').trim();
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

  // 寬鬆容錯版 decodeText：只使用第一個冒號；若排列比 cipher 長，會截短並回傳 warning
  function decodeText(input){
    input = normalizeInput(String(input || ''));
    if(!startsWithSaveCode2Strict(input)) return { error: '系統：錯誤（前九字非 SaveCode2）' };

    const rest = input.slice(9);
    const colonIndex = rest.indexOf(':');
    if(colonIndex === -1) return { error: '系統：錯誤（缺少 ":"）' };

    const permPart = rest.slice(0, colonIndex).trim();
    const cipher = rest.slice(colonIndex + 1);
    if(!permPart) return { error: '系統：錯誤（排列為空）' };

    const rawTokens = permPart.split('-').filter(t => t.length>0);
    const perm = rawTokens.map(t => {
      const v = parseInt(t, 10);
      return Number.isFinite(v) ? v : NaN;
    });
    if(perm.some(isNaN)) return { error: '系統：錯誤（排列含非數字）' };

    const cipherLen = Array.from(cipher).length;

    // 如果排列比 cipher 長，截短排列到 cipher 長（寬鬆容錯）
    if(perm.length > cipherLen){
      const wanted = cipherLen;
      const shortPerm = perm.slice(0, wanted);
      // 驗證 shortPerm 是否為 1..wanted 且無重複
      const n = shortPerm.length;
      const seen = new Array(n+1).fill(false);
      for(let i=0;i<n;i++){
        const v = shortPerm[i];
        if(v < 1 || v > n) return { error: '系統：錯誤（截短後排列值超出範圍）' };
        if(seen[v]) return { error: '系統：錯誤（截短後排列含重複）' };
        seen[v] = true;
      }
      const out = new Array(n).fill('');
      for(let i=0;i<n;i++){
        out[shortPerm[i]-1] = cipher.charAt(i) || '';
      }
      return { result: out.join(''), warning: '排列比密文長，已截短排列到密文長度進行還原（可能遺失尾端資料）' };
    }

    // 若排列短於 cipher，無法還原
    if(perm.length < cipherLen){
      return { error: '系統：錯誤（排列長度小於密文長度，無法還原）' };
    }

    // 兩者相等，正常驗證 1..n 與無重複
    const n = perm.length;
    const seen = new Array(n+1).fill(false);
    for(let i=0;i<n;i++){
      const v = perm[i];
      if(v < 1 || v > n) return { error: '系統：錯誤（排列值超出範圍）' };
      if(seen[v]) return { error: '系統：錯誤（排列含重複）' };
      seen[v] = true;
    }

    // 還原全文
    const out = new Array(n).fill('');
    for(let i=0;i<n;i++){
      out[perm[i]-1] = cipher.charAt(i) || '';
    }
    return { result: out.join('') };
  }

  // 顯示結果（若有 warning 會附加並以橙色顯示）
  function show(obj){
    if(!el.output) return;
    if(obj.error){
      el.output.textContent = obj.error;
      el.output.style.color = 'crimson';
    } else {
      let text = obj.result;
      if(obj.warning){
        text += '\n\n警告：' + obj.warning;
        el.output.style.color = '#b35f00';
      } else {
        el.output.style.color = '#111';
      }
      el.output.textContent = text;
    }
  }

  // 複製到剪貼簿（若有 warning 只複製純結果，不包含警告）
  async function copyOutputToClipboard(){
    if(!el.output) return;
    const text = el.output.textContent || '';
    // 若包含警告行，取第一段（結果本體）再複製
    const parts = text.split(/\n\n警告：/);
    const toCopy = parts[0];
    try{
      await navigator.clipboard.writeText(toCopy);
      if(el.copyFeedback){
        el.copyFeedback.classList.remove('hidden');
        el.copyFeedback.textContent = '已複製';
        setTimeout(()=>{ el.copyFeedback.classList.add('hidden'); }, 1600);
      }
    }catch(e){
      // fallback: try execCommand (older browsers)
      const ta = document.createElement('textarea');
      ta.value = toCopy;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand('copy'); if(el.copyFeedback){ el.copyFeedback.classList.remove('hidden'); el.copyFeedback.textContent='已複製'; setTimeout(()=>{ el.copyFeedback.classList.add('hidden'); },1600); } }
      catch(err){ console.error('copy failed', err); }
      document.body.removeChild(ta);
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

  if(el.copyBtn) el.copyBtn.addEventListener('click', copyOutputToClipboard);

  log('initialized');
});
