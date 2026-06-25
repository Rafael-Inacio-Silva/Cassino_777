const crypto = require('crypto');

// ─── Tabelas autoritativas da mesa (roleta francesa, zero único) ─────────────
// Mesmas chaves usadas pelo cliente (frontend/public/roulette-fr/modules/constants.js).
// O cliente apenas exibe a mesa; validação e pagamento acontecem somente aqui.

const NUMBERS = {
  number0: [0], number1: [3], number2: [6], number3: [9], number4: [12],
  number5: [15], number6: [18], number7: [21], number8: [24], number9: [27],
  number10: [30], number11: [33], number12: [36], number13: [2], number14: [5],
  number15: [8], number16: [11], number17: [14], number18: [17], number19: [20],
  number20: [23], number21: [26], number22: [29], number23: [32], number24: [35],
  number25: [1], number26: [4], number27: [7], number28: [10], number29: [13],
  number30: [16], number31: [19], number32: [22], number33: [25], number34: [28],
  number35: [31], number36: [34],
};

const SPLITS_X = {
  split0: [0, 3], split1: [3, 6], split2: [6, 9], split3: [9, 12],
  split4: [12, 15], split5: [15, 18], split6: [18, 21], split7: [21, 24],
  split8: [24, 27], split9: [27, 30], split10: [30, 33], split11: [33, 36],
  split12: [0, 2], split13: [2, 5], split14: [5, 8], split15: [8, 11],
  split16: [11, 14], split17: [14, 17], split18: [17, 20], split19: [20, 23],
  split20: [23, 26], split21: [26, 29], split22: [29, 32], split23: [32, 35],
  split24: [0, 1], split25: [1, 4], split26: [4, 7], split27: [7, 10],
  split28: [10, 13], split29: [13, 16], split30: [16, 19], split31: [19, 22],
  split32: [22, 25], split33: [25, 28], split34: [28, 31], split35: [31, 34],
};

const SPLITS_Y = {
  splitY0: [2, 3], splitY1: [5, 6], splitY2: [8, 9], splitY3: [11, 12],
  splitY4: [14, 15], splitY5: [17, 18], splitY6: [20, 21], splitY7: [23, 24],
  splitY8: [26, 27], splitY9: [29, 30], splitY10: [32, 33], splitY11: [35, 36],
  splitY12: [1, 2], splitY13: [4, 5], splitY14: [7, 8], splitY15: [10, 11],
  splitY16: [13, 14], splitY17: [16, 17], splitY18: [19, 20], splitY19: [22, 23],
  splitY20: [25, 26], splitY21: [28, 29], splitY22: [31, 32], splitY23: [34, 35],
};

const CORNERS = {
  corner0: [2, 3, 5, 6], corner1: [5, 6, 8, 9], corner2: [8, 9, 11, 12],
  corner3: [11, 12, 14, 15], corner4: [14, 15, 17, 18], corner5: [17, 18, 20, 21],
  corner6: [20, 21, 23, 24], corner7: [23, 24, 26, 27], corner8: [26, 27, 29, 30],
  corner9: [29, 30, 32, 33], corner10: [32, 33, 35, 36], corner11: [1, 2, 4, 5],
  corner12: [4, 5, 7, 8], corner13: [7, 8, 10, 11], corner14: [10, 11, 13, 14],
  corner15: [13, 14, 16, 17], corner16: [16, 17, 19, 20], corner17: [19, 20, 22, 23],
  corner18: [22, 23, 25, 26], corner19: [25, 26, 28, 29], corner20: [28, 29, 31, 32],
  corner21: [31, 32, 34, 35], corner22: [0, 1, 2, 3],
};

const STREETS = {
  street0: [1, 2, 3], street1: [4, 5, 6], street2: [7, 8, 9],
  street3: [10, 11, 12], street4: [13, 14, 15], street5: [16, 17, 18],
  street6: [19, 20, 21], street7: [22, 23, 24], street8: [25, 26, 27],
  street9: [28, 29, 30], street10: [31, 32, 33], street11: [34, 35, 36],
  street12: [0, 2, 3], street13: [0, 1, 2],
};

const SIXAINS = {
  sixain0: [1, 2, 3, 4, 5, 6], sixain1: [4, 5, 6, 7, 8, 9],
  sixain2: [7, 8, 9, 10, 11, 12], sixain3: [10, 11, 12, 13, 14, 15],
  sixain4: [13, 14, 15, 16, 17, 18], sixain5: [16, 17, 18, 19, 20, 21],
  sixain6: [19, 20, 21, 22, 23, 24], sixain7: [22, 23, 24, 25, 26, 27],
  sixain8: [25, 26, 27, 28, 29, 30], sixain9: [28, 29, 30, 31, 32, 33],
  sixain10: [31, 32, 33, 34, 35, 36],
};

const SECTIONS = {
  section0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  section1: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
  section2: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  section3: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  section4: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  section5: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  section6: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  section7: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
  section8: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
  section9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  section10: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  section11: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
};

const BET_GROUPS = {
  number:  NUMBERS,
  split:   SPLITS_X,
  splitY:  SPLITS_Y,
  corner:  CORNERS,
  street:  STREETS,
  sixain:  SIXAINS,
  section: SECTIONS,
};

// Chances simples (18 números) — regra "la partage": no zero, devolvem metade
const EVEN_CHANCE_SECTIONS = new Set([
  'section0', 'section1', 'section2', 'section6', 'section7', 'section8',
]);

const MIN_TOTAL_BET = parseFloat(process.env.ROULETTE_MIN_BET || '1');
const MAX_TOTAL_BET = parseFloat(process.env.ROULETTE_MAX_BET || '10000');

const toCents = (v) => Math.round(v * 100);

/**
 * Valida o objeto de apostas vindo do cliente.
 * Formato: { number: {number5: 10}, split: {...}, ..., section: {...} }
 * Retorna { bets, totalBetCents } normalizado ou lança Error com mensagem amigável.
 */
function validateBets(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Apostas inválidas.');
  }

  const bets = {};
  let totalBetCents = 0;

  for (const [group, table] of Object.entries(BET_GROUPS)) {
    const groupBets = input[group];
    if (groupBets == null) continue;
    if (typeof groupBets !== 'object' || Array.isArray(groupBets)) {
      throw new Error('Apostas inválidas.');
    }

    for (const [spot, rawAmount] of Object.entries(groupBets)) {
      if (!Object.prototype.hasOwnProperty.call(table, spot)) {
        throw new Error(`Posição de aposta desconhecida: ${spot}`);
      }
      const amount = Number(rawAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Valor de aposta inválido.');
      }
      const cents = toCents(amount);
      if (cents <= 0 || Math.abs(amount * 100 - cents) > 1e-6) {
        throw new Error('Valor de aposta inválido (use no máximo 2 casas decimais).');
      }
      if (!bets[group]) bets[group] = {};
      bets[group][spot] = (bets[group][spot] || 0) + cents;
      totalBetCents += cents;
    }
  }

  if (totalBetCents < toCents(MIN_TOTAL_BET)) {
    throw new Error(`Aposta mínima: R$${MIN_TOTAL_BET.toFixed(2)}.`);
  }
  if (totalBetCents > toCents(MAX_TOTAL_BET)) {
    throw new Error(`Aposta máxima por rodada: R$${MAX_TOTAL_BET.toFixed(2)}.`);
  }

  return { bets, totalBetCents };
}

// RNG criptográfico — uniforme em [0, 36]
function drawNumber() {
  return crypto.randomInt(0, 37);
}

/**
 * Calcula o retorno total (em centavos) das apostas para um resultado.
 * Pagamento clássico 36/n (retorno inclui a própria aposta):
 *   pleno 36x, cavalo 18x, trio/transversal 12x, canto 9x, sixain 6x,
 *   dúzia/coluna 3x, chances simples 2x.
 * La partage: se sair 0, chances simples recebem metade da aposta de volta.
 */
function settle(bets, result) {
  let winCents = 0;

  for (const [group, groupBets] of Object.entries(bets)) {
    const table = BET_GROUPS[group];
    for (const [spot, cents] of Object.entries(groupBets)) {
      const numbers = table[spot];
      if (numbers.includes(result)) {
        winCents += cents * (36 / numbers.length); // 36/n é sempre inteiro
      } else if (result === 0 && group === 'section' && EVEN_CHANCE_SECTIONS.has(spot)) {
        winCents += Math.floor(cents / 2);
      }
    }
  }

  return winCents;
}

module.exports = {
  validateBets,
  drawNumber,
  settle,
  MIN_TOTAL_BET,
  MAX_TOTAL_BET,
  BET_GROUPS,
};
