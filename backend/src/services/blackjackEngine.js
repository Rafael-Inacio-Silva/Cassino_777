const crypto = require('crypto');

// ─── Motor de Blackjack server-authoritative ─────────────────────────────────
// Funções puras (sem I/O). Regras espelham o cliente em
// frontend/public/blackjack/script.js:
//   - sapato (shoe) de 6 baralhos, embaralhado com RNG criptográfico
//   - Ás vale 11, reduz para 1 enquanto a mão estourar (soft/hard)
//   - blackjack natural paga 3:2; vitória normal 1:1; empate (push) devolve
//   - dealer compra enquanto total < 17 (para em qualquer 17)
//   - insurance (seguro) paga 2:1; split em duas mãos; double down
// Valores monetários em CENTAVOS (inteiros) para evitar erro de ponto flutuante.

const SUITS  = ['clubs', 'spades', 'hearts', 'diamonds'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const NUM_DECKS = 6;

function buildShoe(n = NUM_DECKS) {
  const shoe = [];
  for (let d = 0; d < n; d++)
    for (const suit of SUITS)
      for (const value of VALUES)
        shoe.push({ suit, value });
  return shoe;
}

// Fisher-Yates com crypto.randomInt (uniforme, imparcial)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function freshShoe() {
  return shuffle(buildShoe());
}

function cardPoints(card) {
  if (card.value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  return parseInt(card.value, 10);
}

function handTotal(cards) {
  let sum = 0, aces = 0;
  for (const c of cards) {
    if (c.value === 'A') { aces++; sum += 11; }
    else sum += cardPoints(c);
  }
  while (sum > 21 && aces) { sum -= 10; aces--; }
  return sum;
}

const isBust       = (cards) => handTotal(cards) > 21;
const isBlackjack  = (cards) => cards.length === 2 && handTotal(cards) === 21;
const canSplitPair = (cards) =>
  cards.length === 2 && cardPoints(cards[0]) === cardPoints(cards[1]);

// Recompõe o sapato se estiver acabando (igual ao cliente: < 20 cartas)
function drawCard(shoe) {
  if (shoe.length < 20) {
    const fresh = freshShoe();
    shoe.push(...fresh);
  }
  return shoe.pop();
}

// Dealer compra até atingir 17 (para em qualquer 17, inclusive soft)
function playDealer(dealerCards, shoe) {
  while (handTotal(dealerCards) < 17) {
    dealerCards.push(drawCard(shoe));
  }
  return dealerCards;
}

/**
 * Liquida uma mão do jogador contra o dealer. Retorna o RETORNO em centavos
 * (inclui a aposta de volta em caso de vitória/empate):
 *   bust .............. 0
 *   dealer estoura .... 2× aposta
 *   jogador > dealer .. 2× aposta
 *   empate ............ 1× aposta (devolve)
 *   jogador < dealer .. 0
 * `naturalBlackjack` (mão inicial de 21, fora de split) paga 3:2 → 2.5× aposta.
 */
function settleHand(playerCards, dealerCards, betCents, naturalBlackjack = false) {
  const p = handTotal(playerCards);
  const d = handTotal(dealerCards);

  if (p > 21) return 0;
  if (naturalBlackjack) {
    // empate de blackjacks é tratado fora (push); aqui só o pagamento 3:2
    return betCents + Math.floor(betCents * 1.5);
  }
  if (d > 21) return betCents * 2;
  if (p > d)  return betCents * 2;
  if (p === d) return betCents;
  return 0;
}

module.exports = {
  SUITS,
  VALUES,
  NUM_DECKS,
  freshShoe,
  drawCard,
  cardPoints,
  handTotal,
  isBust,
  isBlackjack,
  canSplitPair,
  playDealer,
  settleHand,
};
