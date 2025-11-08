document.addEventListener('DOMContentLoaded', () => {
  const el = {
    input: document.getElementById('inputText'),
    output: document.getElementById('output'),
    encryptBtn: document.getElementById('encryptBtn'),
    decodeBtn: document.getElementById('decodeBtn'),
    clearBtn: document.getElementById('clearBtn')
  };

  const PREFIX = 'SaveCode2';

  // 工具：產生 1..n 的隨機排列（Fisher-Yates）
  function randomPermutation(n){
    const arr = Array.from({length:n}, (_,i) => i+1);
    for(let i=n-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 加密：輸入 plaintext，回傳格式 SaveCode2 p1-p2-...-pn:cipher
  function encryptText(plaintext){
    plaintext = String(plaintext || '');
    const n = plaintext.length;
    if(n === 0) return { error: '請輸入要加密的文字' };
    const perm = randomPermutation(n);        // perm 的長度為 n
    // cipher[i] = plaintext[perm[i]-1]  (第 i 個 cipher 來自原文第 perm[i]-1)
    const cipherChars = [];
    for(let i=0;i<n;i++){
      const sourceIndex = perm[i]-1;
      cipherChars.push(plaintext.charAt(sourceIndex));
    }
    const cipher = cipherChars.join('');
    const header = PREFIX + perm.join('-') + ':'; // 例如 SaveCode22-1-3:
    return { result: header + cipher };
  }

  // 解碼：輸入密文字串，回傳明文或錯誤
  function decodeText(input){
    input = String(input || '');
    if(!input.startsWith(PREFIX)) return { error: '格式錯誤：缺少 SaveCode2 前綴，無法解碼' };
    const rest = input.slice(PREFIX.length);
    // rest 範例： "2-1-3:cipherText" 或 "2-1-3:cipherText"
    const colonIndex = rest.indexOf(':');
    if(colonIndex === -1) return { error: '格式錯誤：缺少 ":" 分隔排列與密文' };
    const permPart = rest.slice(0, colonIndex).trim();
    const cipher = rest.slice(colonIndex + 1);
    if(!permPart) return { error: '格式錯誤：排列部分為空' };
    const permTokens = permPart.split('-').filter(t => t.length>0);
    const perm = permTokens.map(t => {
      const v = parseInt(t, 10);
      return Number.isFinite(v) ? v : NaN;
    });
    if(perm.some(isNaN)) return { error: '格式錯誤：排列含非數字項' };
    // 長度檢查
    if(perm.length !== cipher.length) return { error: '長度不符：排列長度與密文字數不一致' };

    // 檢查 perm 是否為 1..n 的一個排列（沒重複、範圍正確）
    const n = perm.length;
    const seen = new Array(n+1).fill(false);
    for(let i=0;i<n;i++){
      const v = perm[i];
      if(v < 1 || v > n) return { error: '排列值超出範圍' };
      if(seen[v]) return { error: '排列含重複值，非合法排列' };
      seen[v] = true;
    }

    // 還原：cipher 的第 i 字元放到 plaintext 的 perm[i]-1 位置
    const out = new Array(n).fill('');
    for(let i=0;i<n;i++){
      const targetIndex = perm[i]-1;
      out[targetIndex] = cipher.charAt(i);
    }
    return { result: out.join('') };
  }

  // 顯示結果或錯誤
  function showResult(obj){
    if(obj.error){
      el.output.textContent = '錯誤：' + obj.error;
      el.output.style.color = 'crimson';
    } else {
      el.output.textContent = obj.result;
      el.output.style.color = '#111';
    }
  }

  // 綁定
  el.encryptBtn.addEventListener('click', () => {
    const inText = el.input.value || '';
    const res = encryptText(inText);
    showResult(res);
  });

  el.decodeBtn.addEventListener('click', () => {
    const inText = el.input.value || '';
    const res = decodeText(inText);
    showResult(res);
  });

  el.clearBtn.addEventListener('click', () => {
    el.input.value = '';
    el.output.textContent = '已清除';
    el.output.style.color = '#111';
  });

  console.log('SaveCode2 tool initialized');
});
