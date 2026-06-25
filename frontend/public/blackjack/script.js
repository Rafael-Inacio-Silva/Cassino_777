// ============================================================
//  BLACKJACK — Inacios777
// ============================================================

// ── Idiomas / Language ─────────────────────────────────────────
const LANG = {
  PT: {
    balance: 'Saldo: ', bet: 'Aposta: ', lastWin: 'Último: ',
    hit: 'PEDIR', stand: 'PARAR', double: 'DOBRAR', split: 'DIVIDIR',
    newGame: 'NOVA PARTIDA',
    win: 'VITÓRIA!', loss: 'DERROTA', tie: 'EMPATE',
    blackjack: 'BLACKJACK!', bjTie: 'EMPATE\nBLACKJACK', bjLoss: 'DERROTA\nBLACKJACK',
    splitSuffix: '\nSPLIT',
    noBet: '⚠️ Faça uma aposta!',
    noFunds: '⚠️ Saldo insuficiente!',
    handRestored: '⚠️ Mão anterior restaurada — continue jogando!',
    insuranceLost: n => `Seguro perdido: -$${n}`,
    insuranceWon:  n => `Seguro ganhou! +$${n}`,
    aceSplit: '♠♠ Split de Ases: 1 carta por mão',
    insuranceHtml: n => `Dealer mostra um <b style="color:#c9952a">Ás</b><br>Fazer seguro?<br><small style="font-size:1.7vh;color:#aaa">Custa: $${n} — Paga 2:1 se dealer tiver Blackjack</small>`,
    insuranceYes: 'SIM', insuranceNo: 'NÃO',
    lobby: '← Lobby',
  },
  EN: {
    balance: 'Balance: ', bet: 'Bet: ', lastWin: 'Last Win: ',
    hit: 'HIT', stand: 'STAND', double: 'DOUBLE', split: 'SPLIT',
    newGame: 'NEW GAME',
    win: 'WIN!', loss: 'LOSS', tie: 'TIE',
    blackjack: 'BLACKJACK!', bjTie: 'TIE\nBLACKJACK', bjLoss: 'LOSS\nBLACKJACK',
    splitSuffix: '\nSPLIT',
    noBet: '⚠️ Place a bet!',
    noFunds: '⚠️ Insufficient funds!',
    handRestored: '⚠️ Previous hand restored — continue playing!',
    insuranceLost: n => `Insurance lost: -$${n}`,
    insuranceWon:  n => `Insurance won! +$${n}`,
    aceSplit: '♠♠ Ace Split: 1 card per hand',
    insuranceHtml: n => `Dealer shows an <b style="color:#c9952a">Ace</b><br>Buy Insurance?<br><small style="font-size:1.7vh;color:#aaa">Costs: $${n} — Pays 2:1 if dealer has Blackjack</small>`,
    insuranceYes: 'YES', insuranceNo: 'NO',
    lobby: '← Lobby',
  },
  RU: {
    balance: 'Баланс: ', bet: 'Ставка: ', lastWin: 'Выигрыш: ',
    hit: 'ЕЩЁ', stand: 'ХВАТИТ', double: 'УДВОИТЬ', split: 'РАЗДЕЛИТЬ',
    newGame: 'НОВАЯ ИГРА',
    win: 'ПОБЕДА!', loss: 'ПОРАЖЕНИЕ', tie: 'НИЧЬЯ',
    blackjack: 'БЛЭКДЖЕК!', bjTie: 'НИЧЬЯ\nБЛЭКДЖЕК', bjLoss: 'ПОРАЖЕНИЕ\nБЛЭКДЖЕК',
    splitSuffix: '\nСПЛИТ',
    noBet: '⚠️ Сделайте ставку!',
    noFunds: '⚠️ Недостаточно средств!',
    handRestored: '⚠️ Предыдущая рука восстановлена — продолжайте!',
    insuranceLost: n => `Страховка потеряна: -$${n}`,
    insuranceWon:  n => `Страховка выиграна! +$${n}`,
    aceSplit: '♠♠ Сплит тузов: 1 карта на руку',
    insuranceHtml: n => `Дилер показывает <b style="color:#c9952a">Туза</b><br>Страховка?<br><small style="font-size:1.7vh;color:#aaa">Стоит: $${n} — Платит 2:1 при Блэкджеке дилера</small>`,
    insuranceYes: 'ДА', insuranceNo: 'НЕТ',
    lobby: '← Лобби',
  },
  FR: {
    balance: 'Solde : ', bet: 'Mise : ', lastWin: 'Dernier gain : ',
    hit: 'CARTE', stand: 'RESTER', double: 'DOUBLER', split: 'SÉPARER',
    newGame: 'NOUVEAU JEU',
    win: 'VICTOIRE !', loss: 'DÉFAITE', tie: 'ÉGALITÉ',
    blackjack: 'BLACKJACK !', bjTie: 'ÉGALITÉ\nBLACKJACK', bjLoss: 'DÉFAITE\nBLACKJACK',
    splitSuffix: '\nSPLIT',
    noBet: '⚠️ Faites une mise !',
    noFunds: '⚠️ Solde insuffisant !',
    handRestored: '⚠️ Main précédente restaurée — continuez à jouer !',
    insuranceLost: n => `Assurance perdue : -$${n}`,
    insuranceWon:  n => `Assurance gagnée ! +$${n}`,
    aceSplit: "♠♠ Split d'As : 1 carte par main",
    insuranceHtml: n => `Le dealer montre un <b style="color:#c9952a">As</b><br>Assurance ?<br><small style="font-size:1.7vh;color:#aaa">Coût : $${n} — Paie 2:1 si le dealer a un Blackjack</small>`,
    insuranceYes: 'OUI', insuranceNo: 'NON',
    lobby: '← Lobby',
  },
};
let lang = LANG.EN; // padrão: Inglês (mesmo que a roleta)

// Aplica idioma na UI (chamado após DOM pronto)
function changeLang(key) {
  lang = LANG[key] || LANG.EN;

  // Botões de ação
  const ids = { hitBtn:'hit', standBtn:'stand', doubleBtn:'double', splitBtn:'split', newGameBtn:'newGame' };
  Object.entries(ids).forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = lang[k];
  });

  // Botão de seguro (caso esteja visível)
  const iy = document.getElementById('insuranceYes');
  const ino = document.getElementById('insuranceNo');
  if (iy)  iy.textContent  = lang.insuranceYes;
  if (ino) ino.textContent = lang.insuranceNo;

  // Botão Lobby
  const lobbyEl = document.getElementById('backToLobby');
  if (lobbyEl) lobbyEl.textContent = lang.lobby;

  // HUD — try/catch protege contra TDZ quando chamado durante o loading screen
  // (balance/currentBet/lastWin ainda não foram inicializados nesse ponto)
  try {
    const md = document.getElementById('moneyDisplay');
    const td = document.getElementById('totalBetDisplay');
    const wd = document.getElementById('totalWinDisplay');
    if (md) md.textContent = `${lang.balance}${balance.toLocaleString('en-US')} $`;
    if (td) td.textContent = `${lang.bet}${currentBet.toLocaleString('en-US')} $`;
    if (wd) wd.textContent = `${lang.lastWin}${lastWin.toLocaleString('en-US')} $`;
  } catch (_) { /* variáveis ainda não inicializadas — updateHUD() será chamado após init */ }

  // Oculta seletor (igual à roleta: apenas scale)
  const lc = document.getElementById('langChoose');
  if (lc) lc.style.transform = 'scale(0)';
}

// ── Music ─────────────────────────────────────────────────────
const SONG_NAMES = ['Night Skies','Lucky 8','Velvet Groove','Elegance in Blue','Forgiveness','Your Beauty','Moonlight','Midnight Mirage'];
let musicNumber = 0;
let music = new Audio('sfx/music/music0.mp3');
let musicStatus = false;
music.volume = 0.3;

function updateMusicTimer() {
  const el = document.getElementById('musicTimer');
  if (!el) return;
  const t = music.currentTime;
  const m = String(Math.floor(t / 60)).padStart(2,'0');
  const s = String(Math.floor(t % 60)).padStart(2,'0');
  el.textContent = `${m}:${s}`;
}
music.addEventListener('timeupdate', updateMusicTimer);
music.addEventListener('ended', () => changeMusic(1));

function changeMusic(dir) {
  music.pause();
  musicNumber = (musicNumber + dir + 8) % 8;
  music = new Audio(`sfx/music/music${musicNumber}.mp3`);
  music.volume = 0.3;
  music.addEventListener('timeupdate', updateMusicTimer);
  music.addEventListener('ended', () => changeMusic(1));
  const np = document.getElementById('nowPlaying');
  if (np) np.textContent = SONG_NAMES[musicNumber];
  const vinyl = document.getElementById('vinyl');
  if (vinyl) vinyl.style.animationPlayState = 'running';
  music.play().catch(() => {});
  musicStatus = true;
  updatePauseBtn();
}

function toggleMusic() {
  musicStatus = !musicStatus;
  musicStatus ? music.play().catch(() => {}) : music.pause();
  const vinyl = document.getElementById('vinyl');
  if (vinyl) vinyl.style.animationPlayState = musicStatus ? 'running' : 'paused';
  updatePauseBtn();
}

function updatePauseBtn() {
  const btn = document.getElementById('musicPause');
  if (!btn) return;
  btn.className = musicStatus ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  btn.style.fontSize = musicStatus ? '2vh' : '1.8vh';
  btn.style.color = musicStatus ? 'red' : '#08ff21';
}

function tryAutoplayMusic() {
  music.play().then(() => {
    musicStatus = true;
    const vinyl = document.getElementById('vinyl');
    if (vinyl) vinyl.style.animationPlayState = 'running';
    updatePauseBtn();
  }).catch(() => {
    const play = () => {
      if (!musicStatus) {
        music.play().then(() => {
          musicStatus = true;
          const vinyl = document.getElementById('vinyl');
          if (vinyl) vinyl.style.animationPlayState = 'running';
          updatePauseBtn();
        }).catch(() => {});
      }
    };
    document.addEventListener('click', play, { once: true });
    document.addEventListener('touchstart', play, { once: true });
  });
}

// ── Loading screen ─────────────────────────────────────────────
(function startLoading() {
  const screen    = document.getElementById('loadingScreen');
  const bar       = document.getElementById('loadingBar');
  const pct       = document.getElementById('loadingPercent');
  const langChooseEl = document.getElementById('langChoose');
  if (!screen) return;

  function startBar() {
    if (bar?.parentElement) bar.parentElement.style.display = 'block';
    if (pct) pct.style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 4 + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (bar) bar.style.width = '100%';
        if (pct) pct.textContent = '100%';
        setTimeout(() => {
          screen.style.transition = 'opacity 0.5s';
          screen.style.opacity = '0';
          setTimeout(() => {
            screen.style.display = 'none';
            tryAutoplayMusic();
          }, 500);
        }, 400);
      } else {
        if (bar) bar.style.width = progress + '%';
        if (pct) pct.textContent = Math.floor(progress) + '%';
      }
    }, 50);
  }

  // Sempre mostra o seletor de idioma (igual à roleta — sem pulo por localStorage)
  if (langChooseEl) {
    setTimeout(() => {
      langChooseEl.style.transform = 'scale(1)';
    }, 200);

    ['enLang', 'ruLang', 'frLang'].forEach((id, i) => {
      const key = ['EN', 'RU', 'FR'][i];
      document.getElementById(id)?.addEventListener('click', () => {
        changeLang(key);
        startBar();
      });
    });
  } else {
    // Fallback: carrega em EN se não há elemento no DOM
    changeLang('EN');
    startBar();
  }
})();

// ── Music button listeners ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prevMusic')?.addEventListener('click', () => changeMusic(-1));
  document.getElementById('nextMusic')?.addEventListener('click', () => changeMusic(1));
  document.getElementById('pausePlay')?.addEventListener('click', toggleMusic);
});

// ── Pré-carregar todas as imagens das cartas (força decodificação via DOM) ──
(function preloadCards() {
  const suitMap = { clubs:'paus', spades:'espada', hearts:'copa', diamonds:'ouro' };
  const suits   = ['clubs','spades','hearts','diamonds'];
  const values  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const srcs    = ['cards/verso.PNG'];
  for (const s of suits)
    for (const v of values)
      srcs.push(`cards/${v}_${suitMap[s]}.PNG`);

  // Container off-screen que força o browser a renderizar as cartas no tamanho real
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:8vh;height:12vh;overflow:hidden;pointer-events:none;';
  srcs.forEach(src => {
    const el = document.createElement('div');
    el.style.cssText = `width:8vh;height:12vh;background-image:url('${src}');background-size:cover;background-position:center;`;
    wrap.appendChild(el);
  });
  document.body.appendChild(wrap);
})();

// ── Chip sounds ────────────────────────────────────────────────
const chipSound1 = new Audio('sfx/sfx/chipPut.mp3');
const chipSound2 = new Audio('sfx/sfx/chipPut2.mp3');
let lastChipToggle = false;

// cloneNode garante instância independente a cada play — resolve bug de
// repetição no Safari/Mac onde currentTime=0 + play() para de funcionar
function playAudio(audio) {
  const clone = audio.cloneNode();
  clone.volume = audio.volume;
  clone.play().catch(() => {});
}

function playChipSound() {
  playAudio(lastChipToggle ? chipSound2 : chipSound1);
  lastChipToggle = !lastChipToggle;
}

// ── Card data ──────────────────────────────────────────────────
const SUITS  = ['clubs','spades','hearts','diamonds'];
const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// ── State ─────────────────────────────────────────────────────
let shoe        = [];
let playerHand  = [];
let dealerHand  = [];
let splitHand   = [];
let balance     = 1000;
let currentBet  = 0;
let lastBetSize = 0;
let lastWin     = 0;
let phase       = 'BETTING';
let holeCardEl  = null;
let activeHandIdx = 0;      // 0 = main hand, 1 = split hand
let splitActive   = false;  // split in progress
let splitCardEl   = null;   // container for split hand cards
let splitScoreEl  = null;   // score badge for split hand
let insuranceBet  = 0;      // montante apostado no seguro (0 = não tomou)

// ── Chip denomination system (igual à roleta) ─────────────────
const DENOMS_DESC   = [1000, 500, 100, 50, 25, 10, 5, 2, 1];
const CHIP_VALUES   = [1, 2, 5, 10, 25, 50, 100, 500, 1000];
const TABLE_CHIP_IMG = {
  1:'tableChips1.png', 2:'tableChips2.png', 5:'tableChips3.png',
  10:'tableChips4.png', 25:'tableChips5.png', 50:'tableChips6.png',
  100:'tableChips7.png', 500:'tableChips8.png', 1000:'tableChips9.png'
};

function decomposeToDenoms(amount) {
  const res = [];
  let left = Math.floor(amount);
  for (const d of DENOMS_DESC) {
    while (left >= d) { res.push(d); left -= d; }
  }
  return res;
}

function updateBetChips() {
  const container = document.getElementById('betChips');
  const display   = document.getElementById('betDisplay');
  if (!container) return;
  container.innerHTML = '';
  if (currentBet <= 0) { if (display) display.textContent = ''; return; }
  const denoms = decomposeToDenoms(currentBet);
  denoms.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'bet-chip-stack';
    el.style.backgroundImage = `url('${TABLE_CHIP_IMG[d]}')`;
    el.style.bottom = `${i * 4}px`;
    el.style.zIndex = i + 1;
    container.appendChild(el);
  });
  if (display) display.textContent = `$${currentBet.toLocaleString('en-US')}`;
}

// ── DOM ───────────────────────────────────────────────────────
const $            = id => document.getElementById(id);
const playerCardsEl  = $('playerCards');
const dealerCardsEl  = $('dealerCards');
const playerScoreEl  = $('playerScore');
const dealerScoreEl  = $('dealerScore');
const moneyDisplay   = $('moneyDisplay');
const betDisplay     = $('totalBetDisplay');
const winDisplay     = $('totalWinDisplay');
const resultWindowEl = $('resultWindow');
const resultTextEl   = $('resultWindowText');
const resultMoneyEl  = $('resultMoneyInfo');
const dealBtn        = $('dealBtn');
const hitBtn         = $('hitBtn');
const standBtn       = $('standBtn');
const doubleBtn      = $('doubleBtn');
const splitBtn       = $('splitBtn');
const newGameBtn     = $('newGameBtn');
const allChipBtns    = document.querySelectorAll('.chipsBtn');
const gameEl         = $('game');

// ── Helpers ───────────────────────────────────────────────────
const sleep     = ms => new Promise(r => setTimeout(r, ms));
const nextFrame = ()  => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

// ── Shoe / Deck ───────────────────────────────────────────────
function buildShoe(n = 6) {
  const s = [];
  for (let i = 0; i < n; i++)
    for (const suit of SUITS)
      for (const val of VALUES)
        s.push({ suit, value: val });
  return s;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function ensureShoe() { if (shoe.length < 20) shoe = shuffle(buildShoe(6)); }
function draw()        { ensureShoe(); return shoe.pop(); }

// ── Hand value ─────────────────────────────────────────────────
function total(hand) {
  let sum = 0, aces = 0;
  for (const c of hand) {
    if      (c.value === 'A')                 { aces++; sum += 11; }
    else if (['J','Q','K'].includes(c.value)) sum += 10;
    else                                       sum += +c.value;
  }
  while (sum > 21 && aces) { sum -= 10; aces--; }
  return sum;
}
function isBlackjack(hand) { return hand.length === 2 && total(hand) === 21; }
function cardPoints(c) {
  if (c.value === 'A') return 11;
  if (['J','Q','K'].includes(c.value)) return 10;
  return +c.value;
}
function canSplit() {
  return playerHand.length === 2 && cardPoints(playerHand[0]) === cardPoints(playerHand[1]);
}

// ── Card face styles ───────────────────────────────────────────
function applyFace(el, card) {
  const suitMap = { clubs:'paus', spades:'espada', hearts:'copa', diamonds:'ouro' };
  el.style.backgroundImage    = `url('cards/${card.value}_${suitMap[card.suit]}.PNG')`;
  el.style.backgroundSize     = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat   = 'no-repeat';
  el.style.backgroundColor    = '';
  el.classList.remove('card-back');
}

function applyBack(el) {
  el.style.backgroundImage    = "url('cards/verso.PNG')";
  el.style.backgroundSize     = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat   = 'no-repeat';
  el.classList.add('card-back');
}

// ── Shoe position ──────────────────────────────────────────────
function getShoePos() {
  const rect = gameEl.getBoundingClientRect();
  return { x: rect.left + rect.width * 0.80, y: rect.top + rect.height * 0.07 };
}

// ── Card flip: instant reveal (sem animação = sem transparência) ─
async function flipReveal(el, card) {
  applyFace(el, card);
}

// ── Main deal animation ────────────────────────────────────────
// Usa slot pré-alocado (se disponível) para evitar deslocamento de layout
async function dealCardAnimated(container, card, faceUp = true) {
  // Tenta reutilizar um slot pré-alocado não reclamado
  let slot = Array.from(container.children).find(
    el => el.classList.contains('card-slot') && !el._claimed
  );
  if (slot) {
    slot._claimed = true;
  } else {
    // Fallback: cria novo slot (pode causar reflow para hit/split extra)
    slot = document.createElement('div');
    slot.className = 'card-slot';
    slot._claimed  = true;
    container.appendChild(slot);
    // Espera 2 frames para o layout estabilizar antes de capturar posição
    await nextFrame();
    await nextFrame();
  }

  // Captura posição destino sincronamente (força reflow)
  const destRect = slot.getBoundingClientRect();

  const shoePos = getShoePos();
  const flier   = document.createElement('div');
  flier.className = 'card card-back card-flier';
  flier.style.cssText = `
    position:fixed; z-index:1000; pointer-events:none; margin:0;
    width:${destRect.width}px; height:${destRect.height}px;
    left:${shoePos.x}px; top:${shoePos.y}px;
    transform: rotate(${(Math.random() - 0.5) * 14}deg) scale(0.9);
    transition: none; animation: none;
  `;
  applyBack(flier);
  document.body.appendChild(flier);

  await nextFrame();
  const FLIGHT = 380;
  flier.style.transition = `left ${FLIGHT}ms cubic-bezier(.25,.1,.25,1), top ${FLIGHT}ms cubic-bezier(.25,.1,.25,1), transform ${FLIGHT}ms ease`;
  flier.style.left      = `${destRect.left}px`;
  flier.style.top       = `${destRect.top}px`;
  flier.style.transform = 'rotate(0deg) scale(1)';
  await sleep(FLIGHT + 20);

  flier.remove();
  slot.className = 'card card-back';
  slot.removeAttribute('style');
  slot.style.opacity   = '1';
  slot.style.animation = 'none';
  applyBack(slot);

  if (faceUp) await flipReveal(slot, card);

  return slot;
}

// ── Reveal dealer hole card ────────────────────────────────────
async function revealHoleCard() {
  if (!holeCardEl) return;
  await flipReveal(holeCardEl, dealerHand[1]);
}

// ── Score badges ───────────────────────────────────────────────
function updateScoreBadge(el, hand, hideSecond = false) {
  if (!hand || hand.length === 0) {
    el.textContent = ''; el.className = 'score-badge'; return;
  }
  const t = hideSecond ? total([hand[0]]) : total(hand);
  el.textContent = t;
  el.classList.add('visible');
  el.classList.toggle('bust',    !hideSecond && t > 21);
  el.classList.toggle('perfect', !hideSecond && isBlackjack(hand));
}

// ── HUD update ─────────────────────────────────────────────────
function updateHUD() {
  if (moneyDisplay) moneyDisplay.textContent = `${lang.balance}${balance.toLocaleString('en-US')} $`;
  if (betDisplay)   betDisplay.textContent   = `${lang.bet}${currentBet.toLocaleString('en-US')} $`;
  if (winDisplay)   winDisplay.textContent   = `${lang.lastWin}${lastWin.toLocaleString('en-US')} $`;
  updateBetChips();
  checkChipAffordability();
}

function checkChipAffordability() {
  allChipBtns.forEach((btn, i) => {
    const val = CHIP_VALUES[i];
    const ok  = balance >= val;
    btn.classList.toggle('disabledChips', !ok);
    btn.style.pointerEvents = ok ? 'all' : 'none';
  });
}

// ── Split helpers ──────────────────────────────────────────────
function getActiveHand()      { return activeHandIdx === 0 ? playerHand : splitHand; }
function getActiveContainer() { return activeHandIdx === 0 ? playerCardsEl : $('splitCards'); }
function getActiveScore()     { return activeHandIdx === 0 ? playerScoreEl : $('splitScore'); }

function updateSplitHighlight() {
  $('hand1Wrap')?.classList.toggle('active-hand',   splitActive && activeHandIdx === 0);
  $('hand1Wrap')?.classList.toggle('inactive-hand', splitActive && activeHandIdx !== 0);
  $('hand2Wrap')?.classList.toggle('active-hand',   splitActive && activeHandIdx === 1);
  $('hand2Wrap')?.classList.toggle('inactive-hand', splitActive && activeHandIdx !== 1);
}

// ── Phase control ──────────────────────────────────────────────
function setPhase(p) {
  const prevPhase = phase;
  phase = p;
  const betting = p === 'BETTING';
  const playing = p === 'PLAYER';
  const over    = p === 'OVER';
  const dealing = p === 'DEALING' || p === 'DEALER';

  dealBtn.style.display = betting ? 'flex' : 'none';

  $('chipsSelectorDisabled').style.display = (!betting) ? 'block' : 'none';
  allChipBtns.forEach(c => { c.style.pointerEvents = betting ? 'all' : 'none'; });

  // Controles sempre visíveis; apenas habilitados/desabilitados por fase
  const activeHand = getActiveHand();
  hitBtn.disabled    = !playing;
  standBtn.disabled  = !playing;
  doubleBtn.disabled = !playing || activeHand.length !== 2 || balance < currentBet || splitActive;
  splitBtn.disabled  = !playing || splitActive || !canSplit() || balance < currentBet;
  newGameBtn.style.display = over ? 'inline-block' : 'none';

  const hasBet  = currentBet > 0;
  const canX2   = hasBet && balance >= currentBet;
  const canRep  = lastBetSize > 0 && (balance + currentBet) >= lastBetSize;
  $('x2BetBtn')?.classList.toggle('disabledCircleBtns',    !betting || !canX2);
  $('cancelLastBtn')?.classList.toggle('disabledCircleBtns', !betting || !hasBet);
  $('cancelAllBtn')?.classList.toggle('disabledCircleBtns',  !betting || !hasBet);
  $('repeatBetBtn')?.classList.toggle('disabledCircleBtns',  !betting || !canRep);

  // Persistência: salva mão ativa quando jogador precisa agir
  // Só limpa se não for a chamada inicial (prevPhase !== 'BETTING' evita limpar no boot)
  if (p === 'PLAYER' || p === 'DEALER') saveHandState();
  else if ((p === 'OVER' || p === 'BETTING') && prevPhase !== 'BETTING') clearHandState();
}

// ── Toast para mensagens rápidas de aviso ─────────────────────
function showToast(msg) {
  let toast = $('bjToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'bjToast';
    toast.style.cssText = `position:fixed;top:12vh;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.85);color:#fff;padding:1vh 3vh;border-radius:2vh;
      font-size:2vh;font-family:Georgia,serif;z-index:9000;pointer-events:none;
      border:1px solid rgba(255,255,255,0.2);transition:opacity 0.3s;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

// ── Janela de resultado estilo roleta ─────────────────────────
// resultKey: 'win' | 'loss' | 'tie' | 'blackjack' | 'bjTie' | 'bjLoss'
// isSplit: true → acrescenta splitSuffix ao texto
function showResult(resultKey, profit = null, isSplit = false) {
  if (!resultWindowEl) return;

  const isWin  = resultKey === 'win' || resultKey === 'blackjack';
  const isDraw = resultKey === 'tie' || resultKey === 'bjTie';
  const msg    = (lang[resultKey] ?? resultKey) + (isSplit ? (lang.splitSuffix ?? '\nSPLIT') : '');

  resultTextEl.textContent = msg;

  if (isWin) {
    // VITÓRIA — dourado + estrelas pulsando
    resultWindowEl.style.backgroundColor = '#000000bd';
    resultWindowEl.style.boxShadow = '#9a801c 0 0 4vh 1vh';
    resultMoneyEl.style.borderColor = '#cd953b';
    resultMoneyEl.style.color = '#cd953b';
    resultTextEl.style.animation = 'blink2 0.5s infinite';   // pulso dourado
    startStarAnim();
  } else if (isDraw) {
    // EMPATE — azul, sem estrelas
    resultWindowEl.style.backgroundColor = '#00102ede';
    resultWindowEl.style.boxShadow = '#1a5276 0 0 3vh 0.5vh';
    resultMoneyEl.style.borderColor = '#3b82cd';
    resultMoneyEl.style.color = '#3b82cd';
    resultTextEl.style.animation = 'blinkBlue 0.5s infinite'; // pulso azul
    stopStarAnim();
  } else {
    // DERROTA (comum ou bjLoss) — vermelho, sem estrelas, sem dourado
    resultWindowEl.style.backgroundColor = '#2a0000de';
    resultWindowEl.style.boxShadow = '#7b0000 0 0 3vh 0.5vh';
    resultMoneyEl.style.borderColor = '#cd3b3b';
    resultMoneyEl.style.color = '#cd3b3b';
    resultTextEl.style.animation = 'blinkRed 0.5s infinite';  // pulso VERMELHO
    stopStarAnim();
  }

  // Sempre exibe o valor (positivo, negativo ou zero)
  resultMoneyEl.style.display = 'block';
  if (profit === null || profit === 0) {
    resultMoneyEl.textContent = '0 $';
  } else if (profit > 0) {
    resultMoneyEl.textContent = `+${profit.toLocaleString('en-US')} $`;
  } else {
    resultMoneyEl.textContent = `${profit.toLocaleString('en-US')} $`;
  }

  resultWindowEl.style.transform = 'translate(-50%, -50%) scale(1)';
}

function hideResult() {
  if (!resultWindowEl) return;
  stopStarAnim();
  resultWindowEl.style.transform = 'translate(-50%, -50%) scale(0)';
  resultWindowEl.style.boxShadow = 'none';
  resultMoneyEl.style.display    = 'none';
}

// ── Star animation (JS interval — CSS background-image não é animável) ──
let _starInterval = null;
const _starImages  = ['star.png','star1.png','star2.png','star3.png'];

function startStarAnim() {
  stopStarAnim();
  let i = 0;
  if (resultWindowEl) resultWindowEl.style.backgroundImage = `url('${_starImages[0]}')`;
  _starInterval = setInterval(() => {
    i = (i + 1) % _starImages.length;
    if (resultWindowEl) resultWindowEl.style.backgroundImage = `url('${_starImages[i]}')`;
  }, 250);
}

function stopStarAnim() {
  if (_starInterval) { clearInterval(_starInterval); _starInterval = null; }
  if (resultWindowEl) resultWindowEl.style.backgroundImage = `url('star.png')`;
}

// ── Hand state persistence (anti-cheat: impede abandono de mão ruim) ─────
function saveHandState() {
  if (phase === 'BETTING' || phase === 'OVER') return;
  try {
    localStorage.setItem('bj_activeHand', JSON.stringify({
      playerHand, dealerHand, splitHand,
      currentBet, activeHandIdx, splitActive, insuranceBet,
      phase, ts: Date.now()
    }));
  } catch {}
}

function clearHandState() {
  localStorage.removeItem('bj_activeHand');
}

function renderCardDirect(container, card, faceUp) {
  const el = document.createElement('div');
  el.className = 'card';
  if (faceUp) applyFace(el, card);
  else        applyBack(el);
  container.appendChild(el);
  return el;
}

async function restoreHandState() {
  const raw = localStorage.getItem('bj_activeHand');
  if (!raw) return false;
  let s;
  try { s = JSON.parse(raw); } catch { clearHandState(); return false; }
  if (!s.playerHand?.length || !s.dealerHand?.length) { clearHandState(); return false; }

  // Restaura variáveis (balance já foi carregado do servidor via loadBalance)
  playerHand    = s.playerHand;
  dealerHand    = s.dealerHand;
  splitHand     = s.splitHand    || [];
  currentBet    = s.currentBet   || 0;
  activeHandIdx = s.activeHandIdx || 0;
  splitActive   = s.splitActive   || false;
  insuranceBet  = s.insuranceBet  || 0;
  holeCardEl    = null;

  // Renderiza mão do jogador
  playerCardsEl.innerHTML = '';
  for (const card of playerHand) renderCardDirect(playerCardsEl, card, true);

  // Renderiza split se ativo
  if (splitActive && splitHand.length) {
    const h2 = $('hand2Wrap');
    if (h2) h2.style.display = 'flex';
    const splitCardsEl = $('splitCards');
    if (splitCardsEl) {
      splitCardsEl.innerHTML = '';
      for (const card of splitHand) renderCardDirect(splitCardsEl, card, true);
    }
    updateScoreBadge($('splitScore'), splitHand);
    updateSplitHighlight();
  }

  // Renderiza cartas do dealer (2ª carta oculta)
  dealerCardsEl.innerHTML = '';
  for (let i = 0; i < dealerHand.length; i++) {
    const el = renderCardDirect(dealerCardsEl, dealerHand[i], i === 0);
    if (i === 1) holeCardEl = el;
  }

  updateScoreBadge(playerScoreEl, playerHand);
  updateScoreBadge(dealerScoreEl, dealerHand, true); // oculta 2ª carta do dealer
  updateHUD();

  showToast(lang.handRestored);

  // Retoma da fase salva: PLAYER → jogador decide | outro → dealer joga
  if (s.phase === 'PLAYER') {
    setPhase('PLAYER');
  } else {
    setPhase('DEALER');
    await dealerTurn();
  }

  return true;
}

// ── Insurance prompt ──────────────────────────────────────────
function showInsurancePrompt(betAmount) {
  return new Promise(resolve => {
    const halfBet = Math.floor(betAmount / 2);
    const prompt  = $('insurancePrompt');
    $('insuranceText').innerHTML = lang.insuranceHtml(halfBet);
    prompt.style.display = 'block';

    const onYes = () => { cleanup(); resolve(true);  };
    const onNo  = () => { cleanup(); resolve(false); };
    function cleanup() {
      prompt.style.display = 'none';
      $('insuranceYes').removeEventListener('click', onYes);
      $('insuranceNo').removeEventListener('click', onNo);
    }
    // Atualiza textos dos botões com idioma atual
    const iy = $('insuranceYes'); if (iy) iy.textContent = lang.insuranceYes;
    const ino = $('insuranceNo'); if (ino) ino.textContent = lang.insuranceNo;
    $('insuranceYes').addEventListener('click', onYes);
    $('insuranceNo').addEventListener('click', onNo);
  });
}

// ══════════════════════════════════════════════════════════════
// MOTOR SERVER-AUTHORITATIVE — cartas, sorteio e pagamento vêm do
// servidor (/api/blackjack). O cliente apenas anima o que recebe.
// ══════════════════════════════════════════════════════════════
const bjToken = () => localStorage.getItem('token');
let bjBusy = false; // trava ações concorrentes durante rede/animação

async function bjApi(path, body) {
  const r = await fetch('/api/blackjack' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bjToken()}` },
    body: JSON.stringify(body || {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Erro na jogada.');
  return data;
}

// Anima as cartas ainda não renderizadas de uma mão (diff pelo dataset)
async function bjSyncHand(container, cards, scoreEl, animate) {
  let n = parseInt(container.dataset.rendered || '0', 10);
  for (let i = n; i < cards.length; i++) {
    if (animate) await dealCardAnimated(container, cards[i], true);
    else          renderCardDirect(container, cards[i], true);
  }
  container.dataset.rendered = String(cards.length);
  if (scoreEl) updateScoreBadge(scoreEl, cards);
}

// Dealer: durante o jogo mostra 1 carta + carta de costas; no fim revela tudo
async function bjSyncDealer(view, animate) {
  const cards = view.dealer.cards;
  if (view.dealer.hole) {
    if (dealerCardsEl.dataset.rendered !== 'play') {
      dealerCardsEl.innerHTML = '';
      if (animate) await dealCardAnimated(dealerCardsEl, cards[0], true);
      else          renderCardDirect(dealerCardsEl, cards[0], true);
      renderCardDirect(dealerCardsEl, {}, false); // hole (de costas)
      dealerCardsEl.dataset.rendered = 'play';
    }
    dealerHand = [cards[0]];
    updateScoreBadge(dealerScoreEl, [cards[0]], true);
  } else {
    // Revela a mão completa do dealer
    dealerCardsEl.innerHTML = '';
    for (const c of cards) renderCardDirect(dealerCardsEl, c, true);
    dealerCardsEl.dataset.rendered = 'done';
    dealerHand = cards;
    updateScoreBadge(dealerScoreEl, cards);
  }
}

// Aplica o estado retornado pelo servidor à mesa
async function bjApplyView(view, animate = true) {
  balance = view.balance ?? balance;

  await bjSyncHand(playerCardsEl, view.hands[0].cards, playerScoreEl, animate);
  playerHand = view.hands[0].cards;

  splitActive = view.hands.length > 1;
  if (splitActive) {
    const h2 = $('hand2Wrap'); if (h2) h2.style.display = 'flex';
    await bjSyncHand($('splitCards'), view.hands[1].cards, $('splitScore'), animate);
    splitHand = view.hands[1].cards;
    updateSplitHighlight();
  }
  activeHandIdx = view.activeHand || 0;

  await bjSyncDealer(view, animate);

  if (view.phase === 'over') { bjFinish(view); return; }
  currentBet = view.baseBet;
  updateHUD();
  setPhase(view.phase === 'insurance' ? 'DEALING' : 'PLAYER');
}

// Mostra o resultado da rodada (servidor já creditou o saldo)
function bjFinish(view) {
  const wagered = view.hands.reduce((s, h) => s + h.bet, 0)
    + (view.insurance.taken ? Math.floor(view.baseBet / 2) : 0);
  const ret    = view.result.totalReturnCents / 100;
  const profit = ret - wagered;
  const isSplit = view.hands.length > 1;
  const oc = view.result.outcome;
  let key;
  if      (oc === 'blackjack')        key = 'blackjack';
  else if (oc === 'push')             key = 'bjTie';
  else if (oc === 'dealer_blackjack') key = 'bjLoss';
  else if (isSplit)                   key = profit > 0 ? 'win' : profit < 0 ? 'loss' : 'tie';
  else { const r = view.result.hands[0].result; key = r === 'win' ? 'win' : r === 'push' ? 'tie' : 'loss'; }

  balance     = view.balance;
  lastWin     = Math.max(0, profit);
  lastBetSize = view.baseBet;
  currentBet  = 0;
  updateHUD();
  showResult(key, profit, isSplit);
  setPhase('OVER');
  clearHandState();
}

function bjResetTable() {
  hideResult();
  playerCardsEl.innerHTML = ''; playerCardsEl.dataset.rendered = '0';
  dealerCardsEl.innerHTML = ''; dealerCardsEl.dataset.rendered = '0';
  const sc = $('splitCards'); if (sc) { sc.innerHTML = ''; sc.dataset.rendered = '0'; }
  const h2 = $('hand2Wrap'); if (h2) h2.style.display = 'none';
  $('hand1Wrap')?.classList.remove('active-hand', 'inactive-hand');
  splitActive = false; activeHandIdx = 0; splitHand = [];
  updateScoreBadge(playerScoreEl, []);
  updateScoreBadge(dealerScoreEl, []);
}

// ── Ações (cada uma é uma chamada autoritativa ao servidor) ──
async function srvDeal() {
  if (bjBusy) return;
  if (currentBet === 0) { showToast(lang.noBet); return; }
  bjBusy = true;
  const bet = currentBet;
  bjResetTable();
  setPhase('DEALING');
  try {
    let view = await bjApi('/deal', { amount: bet });
    await bjApplyView(view, true);
    while (view.phase === 'insurance') {
      const wants = await showInsurancePrompt(view.baseBet);
      view = await bjApi('/insurance', { accept: wants });
      await bjApplyView(view, true);
    }
  } catch (e) {
    showToast(e.message);
    await loadBalance();
    setPhase('BETTING');
  } finally { bjBusy = false; }
}

function srvAction(path) {
  return async () => {
    if (bjBusy || phase !== 'PLAYER') return;
    bjBusy = true;
    try { await bjApplyView(await bjApi(path), true); }
    catch (e) { showToast(e.message); }
    finally { bjBusy = false; }
  };
}
const srvHit    = srvAction('/hit');
const srvStand  = srvAction('/stand');
const srvDouble = srvAction('/double');
const srvSplit  = srvAction('/split');

// Retoma rodada em andamento ao carregar (estado vive no servidor)
async function srvResume() {
  try {
    const r = await fetch('/api/blackjack/active', { headers: { Authorization: `Bearer ${bjToken()}` } });
    if (!r.ok) return false;
    const { round } = await r.json();
    if (!round || round.phase === 'over') return false;
    bjResetTable();
    currentBet = round.baseBet;
    await bjApplyView(round, false); // sem animação ao restaurar
    while (round.phase === 'insurance') {
      const wants = await showInsurancePrompt(round.baseBet);
      const v = await bjApi('/insurance', { accept: wants });
      await bjApplyView(v, true);
      if (v.phase !== 'insurance') break;
    }
    return true;
  } catch { return false; }
}

// ── DEAL (legado — substituído pelo motor server-side acima) ──
async function startDeal() {
  if (currentBet === 0) { showToast(lang.noBet); return; }

  // Salva saldo pós-aposta no servidor imediatamente (antes das cartas aparecerem)
  // Garante que sair agora não devolve o dinheiro apostado
  saveBalance(balance);

  ensureShoe();
  playerHand = [draw(), draw()];
  dealerHand = [draw(), draw()];
  splitHand  = [];
  holeCardEl  = null;
  splitActive  = false;
  activeHandIdx = 0;
  hideResult();

  playerCardsEl.innerHTML = '';
  dealerCardsEl.innerHTML = '';
  updateScoreBadge(playerScoreEl, []);
  updateScoreBadge(dealerScoreEl, []);

  // Pré-aloca 2 slots invisíveis em cada mão para estabilizar o layout
  // antes de qualquer animação começar — impede deslocamento de fichas/cartas
  for (let i = 0; i < 2; i++) {
    const ps = document.createElement('div');
    ps.className = 'card-slot';
    playerCardsEl.appendChild(ps);
    const ds = document.createElement('div');
    ds.className = 'card-slot';
    dealerCardsEl.appendChild(ds);
  }
  // Aguarda 2 frames para o layout se estabilizar com os slots visualmente
  await nextFrame();
  await nextFrame();

  setPhase('DEALING');

  await dealCardAnimated(playerCardsEl, playerHand[0], true);
  await dealCardAnimated(dealerCardsEl, dealerHand[0], true);
  await dealCardAnimated(playerCardsEl, playerHand[1], true);
  holeCardEl = await dealCardAnimated(dealerCardsEl, dealerHand[1], false);

  updateScoreBadge(playerScoreEl, playerHand);
  updateScoreBadge(dealerScoreEl, dealerHand, true);

  const pBJ = isBlackjack(playerHand);
  const dBJ = isBlackjack(dealerHand);

  // Seguro: oferecido quando dealer mostra Ás e player não tem blackjack
  if (dealerHand[0].value === 'A' && !pBJ) {
    const halfBet = Math.floor(currentBet / 2);
    if (halfBet > 0 && balance >= halfBet) {
      const wants = await showInsurancePrompt(currentBet);
      if (wants) {
        insuranceBet = halfBet;
        balance -= halfBet;
        updateHUD();
      }
    }
  }

  if (pBJ || dBJ) {
    setPhase('OVER');
    await sleep(300);
    await resolveBlackjack(pBJ, dBJ);
    return;
  }

  // Dealer mostra Ás mas não tem blackjack → seguro perdido imediatamente
  if (dealerHand[0].value === 'A' && insuranceBet > 0) {
    showToast(lang.insuranceLost(insuranceBet));
    insuranceBet = 0;
  }

  setPhase('PLAYER');
}

async function resolveBlackjack(pBJ, dBJ) {
  await revealHoleCard();
  updateScoreBadge(dealerScoreEl, dealerHand, false);

  // Seguro: resolve se dealer tem blackjack
  let insGain = 0;
  if (dBJ && insuranceBet > 0) {
    insGain = insuranceBet * 2;          // lucro 2:1
    balance += insuranceBet * 3;         // devolve stake + 2:1
    showToast(lang.insuranceWon(insGain));
  }
  insuranceBet = 0;

  let winnings = 0, profit = 0;
  if (pBJ && dBJ) {
    winnings = currentBet;               // push: devolve aposta
    profit   = insGain;
    showResult('bjTie', profit);
  } else if (pBJ) {
    const prize = Math.floor(currentBet * 1.5);
    winnings = currentBet + prize;
    profit   = prize;
    lastWin  = prize;
    showResult('blackjack', profit);
  } else {
    profit = -currentBet + insGain;      // perde aposta, mas seguro pode compensar
    lastWin = Math.max(0, profit);
    showResult('bjLoss', profit);
  }

  balance += winnings;
  lastBetSize = currentBet;
  currentBet  = 0;
  saveBalance(balance);
  updateHUD();
  setPhase('OVER');
}

// ── HIT ──────────────────────────────────────────────────────
async function playerHit() {
  if (phase !== 'PLAYER') return;
  setPhase('DEALING');

  const hand      = getActiveHand();
  const container = getActiveContainer();
  const score     = getActiveScore();
  const card = draw();
  hand.push(card);
  await dealCardAnimated(container, card, true);
  updateScoreBadge(score, hand);

  const t = total(hand);
  if      (t > 21)  { await sleep(200); await handleBust(); }
  else if (t === 21) { await sleep(200); await handleStand(); }
  else setPhase('PLAYER');
}

// ── STAND ─────────────────────────────────────────────────────
async function playerStand() {
  if (phase !== 'PLAYER' && phase !== 'DEALING') return;
  await handleStand();
}

async function handleStand() {
  if (splitActive && activeHandIdx === 0) {
    // Finished hand 1 → switch to hand 2
    activeHandIdx = 1;
    updateSplitHighlight();
    const t2 = total(splitHand);
    if (t2 >= 21) { await handleStand(); return; }  // auto-stand on 21
    setPhase('PLAYER');
  } else {
    setPhase('DEALER');
    dealerTurn();
  }
}

async function handleBust() {
  const hand = getActiveHand();
  const t    = total(hand);

  if (splitActive && activeHandIdx === 0) {
    // MÃO 1 estourou → muda para mão 2 silenciosamente
    await sleep(800);
    activeHandIdx = 1;
    updateSplitHighlight();
    const t2 = total(splitHand);
    if (t2 >= 21) { await handleStand(); return; }
    setPhase('PLAYER');
    return;
  }

  setPhase('DEALER');

  // Regra: se AMBAS as mãos do split estouraram, dealer ganha sem pedir carta
  if (splitActive && total(playerHand) > 21 && total(splitHand) > 21) {
    await revealHoleCard();
    updateScoreBadge(dealerScoreEl, dealerHand, false);
    await sleep(500);
    resolveSplitGame();
    return;
  }

  // Regra: se mão simples estourou, dealer apenas revela hole card — sem pedir carta
  if (!splitActive) {
    await revealHoleCard();
    updateScoreBadge(dealerScoreEl, dealerHand, false);
    await sleep(500);
    resolveGame();
    return;
  }

  // Split com apenas uma mão estourada: dealer precisa jogar
  dealerTurn();
}

// ── DOUBLE DOWN ───────────────────────────────────────────────
async function playerDouble() {
  if (phase !== 'PLAYER' || playerHand.length !== 2 || splitActive) return;
  if (balance < currentBet) { showToast(lang.noFunds); return; }

  balance    -= currentBet;
  currentBet *= 2;
  saveBalance(balance); // Salva saldo pós-double no servidor
  updateHUD();
  setPhase('DEALING');

  const card = draw();
  playerHand.push(card);
  await dealCardAnimated(playerCardsEl, card, true);
  updateScoreBadge(playerScoreEl, playerHand);

  await sleep(200);
  if (total(playerHand) > 21) { await handleBust(); }
  else                          { await handleStand(); }
}

// ── SPLIT ─────────────────────────────────────────────────────
async function playerSplit() {
  if (phase !== 'PLAYER' || splitActive || !canSplit() || balance < currentBet) return;

  balance -= currentBet;
  saveBalance(balance); // Salva saldo pós-split no servidor
  updateHUD();
  splitActive   = true;
  activeHandIdx = 0;
  setPhase('DEALING');

  // Remove second card from main hand
  const splitCard = playerHand.pop();
  splitHand = [splitCard];

  // Show hand2 wrapper
  const h2 = $('hand2Wrap');
  if (h2) h2.style.display = 'flex';

  // Move second card's DOM element to splitCards
  const splitCardsEl = $('splitCards');
  if (splitCardsEl) splitCardsEl.innerHTML = '';
  const cards = Array.from(playerCardsEl.children);
  if (cards.length > 0) {
    const lastCard = cards[cards.length - 1];
    playerCardsEl.removeChild(lastCard);
    if (splitCardsEl) splitCardsEl.appendChild(lastCard);
  }

  // Detecta se foram ases — nesse caso cada mão recebe 1 carta e auto-stand (regra oficial)
  const isAceSplit = splitCard.value === 'A';

  // Deal one extra card to each hand
  const c1 = draw(); playerHand.push(c1);
  const c2 = draw(); splitHand.push(c2);
  await dealCardAnimated(playerCardsEl, c1, true);
  if (splitCardsEl) await dealCardAnimated(splitCardsEl, c2, true);

  updateScoreBadge(playerScoreEl, playerHand);
  updateScoreBadge($('splitScore'), splitHand);
  updateSplitHighlight();

  if (isAceSplit) {
    // Regra: split de Ases — 1 carta por mão, sem mais ações possíveis
    showToast(lang.aceSplit);
    await sleep(800);
    setPhase('DEALER');
    dealerTurn();
    return;
  }

  // Mão 1 pode já ter 21: auto-stand
  if (total(playerHand) >= 21) {
    await sleep(300);
    await handleStand();
    return;
  }

  setPhase('PLAYER');
}

// ── DEALER TURN ───────────────────────────────────────────────
async function dealerTurn() {
  await revealHoleCard();
  updateScoreBadge(dealerScoreEl, dealerHand, false);
  await sleep(400);

  const step = async () => {
    if (total(dealerHand) < 17) {
      const card = draw();
      dealerHand.push(card);
      await dealCardAnimated(dealerCardsEl, card, true);
      updateScoreBadge(dealerScoreEl, dealerHand, false);
      await sleep(200);
      await step();
    } else {
      await sleep(300);
      if (splitActive) resolveSplitGame();
      else             resolveGame();
    }
  };
  await step();
}

// ── RESOLVE (mão simples) ─────────────────────────────────────
function resolveGame() {
  const p = total(playerHand);
  const d = total(dealerHand);
  let winnings = 0, msg = '';

  let profit = 0;
  // Player bust SEMPRE perde — verificado antes de qualquer outra condição
  if      (p > 21)  { winnings = 0;              profit = -currentBet; msg = 'loss'; }
  else if (d > 21)  { winnings = currentBet * 2; profit = currentBet;  msg = 'win'; }
  else if (p > d)   { winnings = currentBet * 2; profit = currentBet;  msg = 'win'; }
  else if (p === d) { winnings = currentBet;     profit = 0;           msg = 'tie'; }
  else              { winnings = 0;              profit = -currentBet; msg = 'loss'; }

  lastWin = Math.max(0, profit);
  balance += winnings;
  lastBetSize = currentBet;
  currentBet = 0;
  saveBalance(balance);
  updateHUD();
  showResult(msg, profit);
  setPhase('OVER');
}

// ── RESOLVE SPLIT (duas mãos independentes) ───────────────────
function resolveSplitGame() {
  const d   = total(dealerHand);
  // currentBet = aposta individual por mão (igual à aposta original)
  // total wagered = currentBet × 2 (mão 1 + mão 2)
  const bet = currentBet;
  const p1  = total(playerHand);
  const p2  = total(splitHand);

  const resolve1 = (p) => {
    if (p > 21) return 0;              // estouro perde tudo
    if (d > 21 || p > d) return bet * 2; // ganha: recupera aposta + lucro
    if (p === d) return bet;           // empate: devolve aposta
    return 0;                          // perde
  };

  const w1 = resolve1(p1);
  const w2 = resolve1(p2);
  const totalWin    = w1 + w2;
  const totalWagered = currentBet * 2;  // total apostado nas duas mãos
  const profit       = totalWin - totalWagered;

  const resultKey = profit > 0 ? 'win' : profit === 0 ? 'tie' : 'loss';

  lastWin = Math.max(0, profit);
  balance += totalWin;
  lastBetSize = currentBet;
  currentBet  = 0;
  saveBalance(balance);
  updateHUD();
  showResult(resultKey, profit, true); // true = isSplit → adiciona sufixo "SPLIT"
  setPhase('OVER');
}

// ── NEW GAME ──────────────────────────────────────────────────
function newGame() {
  playerHand = []; dealerHand = []; splitHand = [];
  holeCardEl  = null; splitActive = false; activeHandIdx = 0;
  currentBet  = 0; insuranceBet = 0;
  playerCardsEl.innerHTML = '';
  dealerCardsEl.innerHTML = '';
  const h2 = $('hand2Wrap');
  if (h2) h2.style.display = 'none';
  const sc = $('splitCards');
  if (sc) sc.innerHTML = '';
  const ss = $('splitScore');
  if (ss) { ss.textContent = ''; ss.className = 'score-badge'; }
  $('hand1Wrap')?.classList.remove('active-hand','inactive-hand');
  $('hand2Wrap')?.classList.remove('active-hand','inactive-hand');
  updateScoreBadge(playerScoreEl, []);
  updateScoreBadge(dealerScoreEl, []);
  hideResult();
  updateHUD();
  setPhase('BETTING');
}

// ── CHIP SELECTOR CLICKS ──────────────────────────────────────
let selectedChipBtn = null;

allChipBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    if (phase !== 'BETTING') return;
    const val = CHIP_VALUES[i];
    if (val > balance) return;
    currentBet += val;
    balance    -= val;
    playChipSound();
    // Visual: highlight selected chip
    allChipBtns.forEach(c => c.classList.remove('biggerBtn'));
    btn.classList.add('biggerBtn');
    selectedChipBtn = btn;
    updateHUD();
    setPhase('BETTING'); // refresh button states
  });
});

// ── BET CONTROLS ──────────────────────────────────────────────
$('x2BetBtn')?.addEventListener('click', () => {
  if (phase !== 'BETTING' || currentBet === 0 || balance < currentBet) return;
  balance    -= currentBet;
  currentBet *= 2;
  playChipSound();
  updateHUD();
  setPhase('BETTING');
});

$('cancelLastBtn')?.addEventListener('click', () => {
  if (phase !== 'BETTING' || currentBet === 0) return;
  // Remove last chip denomination
  const denoms = decomposeToDenoms(currentBet);
  if (denoms.length === 0) return;
  const removed = denoms[denoms.length - 1];
  currentBet -= removed;
  balance    += removed;
  updateHUD();
  setPhase('BETTING');
});

$('cancelAllBtn')?.addEventListener('click', () => {
  if (phase !== 'BETTING' || currentBet === 0) return;
  balance    += currentBet;
  currentBet  = 0;
  updateHUD();
  setPhase('BETTING');
});

$('repeatBetBtn')?.addEventListener('click', () => {
  if (phase !== 'BETTING' || lastBetSize === 0) return;
  const needed = lastBetSize - currentBet;  // quanto ainda falta no balance
  if (needed > balance) return;             // saldo insuficiente
  // Devolver aposta atual e substituir pelo lastBetSize
  balance    += currentBet;   // devolve o que já tinha apostado
  balance    -= lastBetSize;  // cobra o repeat completo
  currentBet  = lastBetSize;
  playChipSound();
  updateHUD();
  // Desabilita o repeat para não repetir de novo (igual à roleta)
  $('repeatBetBtn')?.classList.add('disabledCircleBtns');
  setPhase('BETTING');
});

// Click on bet chips on the table = cancel all (convenience)
$('betArea')?.addEventListener('click', () => {
  if (phase !== 'BETTING' || currentBet === 0) return;
  balance    += currentBet;
  currentBet  = 0;
  updateHUD();
  setPhase('BETTING');
});

// ── DEAL / ACTION BUTTONS ──────────────────────────────────────
dealBtn.addEventListener('click', srvDeal);
hitBtn.addEventListener('click', srvHit);
standBtn.addEventListener('click', srvStand);
doubleBtn.addEventListener('click', srvDouble);
splitBtn.addEventListener('click', srvSplit);
newGameBtn.addEventListener('click', newGame);

// ── SOUND / FULLSCREEN ────────────────────────────────────────
$('soundBtn')?.addEventListener('click', toggleMusic);
$('fullscreenBtn')?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// ── BACKEND ───────────────────────────────────────────────────
async function loadBalance() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const r = await fetch('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) { balance = parseFloat((await r.json()).balance); updateHUD(); }
  } catch {}
}

// No-op: o saldo é autoritativo no servidor (cada ação credita/debita).
// Mantida só para compatibilidade com o código legado não utilizado.
async function saveBalance() {}

// ── INIT ──────────────────────────────────────────────────────
shoe = shuffle(buildShoe(6));
updateHUD();
setPhase('BETTING');

(async () => {
  await loadBalance();              // carrega saldo real do servidor
  const resumed = await srvResume(); // retoma rodada em andamento (estado no servidor)
  if (!resumed) {
    localStorage.removeItem('bj_activeHand'); // limpa resíduo do modelo antigo
    updateHUD();
    setPhase('BETTING');
  }
})();
