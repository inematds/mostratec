/**
 * EAI Economy System v2.0
 * Sistema completo de economia para jogos EAI
 * Documentação: /docs/EAI-ECONOMY.md
 */

const EAI = (function() {
  // === STORAGE KEYS ===
  const KEYS = {
    wallet: 'eai_wallet',
    progress: 'eai_progress',
    inventory: 'eai_inventory',
    stats: 'eai_stats'
  };

  // === CONFIGURAÇÃO ===
  const CONFIG = {
    currency: {
      coin: { value: 1, icon: '🪙', name: 'Moedas', color: '#CD7F32' },
      diamond: { value: 100, icon: '💎', name: 'Diamantes', color: '#00D4FF' },
      gold: { value: 1000, icon: '🥇', name: 'Ouro', color: '#FFD700' }
    },
    multipliers: {
      perfect: { min: 100, mult: 3, label: 'PERFEITO!' },
      excellent: { min: 90, mult: 2, label: 'Excelente!' },
      normal: { min: 0, mult: 1, label: '' }
    },
    gameTypes: {
      quiz: { baseReward: 2, completionBonus: 10 },
      arcade: { baseReward: 1, completionBonus: 5 },
      puzzle: { baseReward: 3, completionBonus: 15 },
      memory: { baseReward: 2, completionBonus: 10 }
    },
    penalties: {
      simple: 1,
      grave: 2,
      gameOver: 5
    },
    timeBonus: {
      playMinutes: 5,      // A cada 5 min
      playReward: 1,       // +1 moeda
      sessionMinutes: 30,  // A cada 30 min
      sessionReward: 1     // +1 diamante
    }
  };

  // === WALLET ===
  function getWallet() {
    try {
      const data = localStorage.getItem(KEYS.wallet);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          coins: parsed.coins || 0,
          diamonds: parsed.diamonds || 0,
          gold: parsed.gold || 0,
          totalEarned: parsed.totalEarned || { coins: 0, diamonds: 0, gold: 0 }
        };
      }
    } catch (e) {}
    return { coins: 0, diamonds: 0, gold: 0, totalEarned: { coins: 0, diamonds: 0, gold: 0 } };
  }

  function saveWallet(wallet) {
    wallet.lastUpdated = new Date().toISOString();
    localStorage.setItem(KEYS.wallet, JSON.stringify(wallet));
  }

  function addCoins(amount) {
    const wallet = getWallet();
    wallet.coins += amount;
    wallet.totalEarned.coins += amount;
    saveWallet(wallet);
    return wallet;
  }

  function removeCoins(amount) {
    const wallet = getWallet();
    if (wallet.coins < amount) return false;
    wallet.coins -= amount;
    saveWallet(wallet);
    return true;
  }

  function addDiamonds(amount) {
    const wallet = getWallet();
    wallet.diamonds += amount;
    wallet.totalEarned.diamonds += amount;
    saveWallet(wallet);
    return wallet;
  }

  function addGold(amount) {
    const wallet = getWallet();
    wallet.gold += amount;
    wallet.totalEarned.gold += amount;
    saveWallet(wallet);
    return wallet;
  }

  function canAfford(type, amount) {
    const wallet = getWallet();
    return wallet[type + 's'] >= amount;
  }

  function getTotalInCoins() {
    const wallet = getWallet();
    return wallet.coins +
           (wallet.diamonds * CONFIG.currency.diamond.value) +
           (wallet.gold * CONFIG.currency.gold.value);
  }

  // === SISTEMA DE PONTUAÇÃO ===
  function calculateReward(options) {
    const {
      correct = 0,
      total = 1,
      gameType = 'quiz',
      includeCompletion = true
    } = options;

    const gameConfig = CONFIG.gameTypes[gameType] || CONFIG.gameTypes.quiz;
    const percentage = (correct / total) * 100;
    const errors = total - correct;

    // Determinar multiplicador
    let multiplier = 1;
    let label = '';

    if (percentage === 100) {
      multiplier = CONFIG.multipliers.perfect.mult;
      label = CONFIG.multipliers.perfect.label;
    } else if (percentage >= 90) {
      multiplier = CONFIG.multipliers.excellent.mult;
      label = CONFIG.multipliers.excellent.label;
    }

    // Calcular ganhos
    const baseGain = correct * gameConfig.baseReward;
    const completionBonus = includeCompletion ? gameConfig.completionBonus : 0;
    const subtotal = (baseGain + completionBonus) * multiplier;

    // Penalidades
    const penalty = errors * CONFIG.penalties.simple;

    // Total (nunca negativo)
    const total_reward = Math.max(0, subtotal - penalty);

    return {
      correct,
      total,
      percentage: Math.round(percentage),
      multiplier,
      label,
      baseGain,
      completionBonus,
      penalty,
      total: total_reward
    };
  }

  function applyPenalty(amount) {
    const wallet = getWallet();
    wallet.coins = Math.max(0, wallet.coins - amount);
    saveWallet(wallet);
    showToast(`-${amount}`, 'coins', 'penalty');
    return wallet;
  }

  // === UI - TOASTS ===
  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.id = 'eai-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(amount, type = 'coins', variant = 'reward') {
    ensureToastContainer();

    const currencyConfig = CONFIG.currency[type === 'coins' ? 'coin' : type] || CONFIG.currency.coin;
    const isPositive = variant !== 'penalty';

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${isPositive ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)'};
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: eaiToastIn 0.3s ease, eaiToastOut 0.3s ease 1.2s forwards;
      font-family: system-ui, sans-serif;
    `;

    const sign = isPositive ? '+' : '';
    toast.innerHTML = `${currencyConfig.icon} ${sign}${amount}`;

    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 1500);
  }

  function showRewardWithMultiplier(amount, multiplier = 1, type = 'coins') {
    ensureToastContainer();

    const currencyConfig = CONFIG.currency[type === 'coins' ? 'coin' : type] || CONFIG.currency.coin;

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      padding: 10px 18px;
      border-radius: 14px;
      font-size: 1.1rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      animation: eaiToastIn 0.3s ease, eaiToastOut 0.3s ease 1.7s forwards;
      font-family: system-ui, sans-serif;
    `;

    let html = `${currencyConfig.icon} +${amount}`;
    if (multiplier > 1) {
      html += ` <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 6px; font-size: 0.85rem;">${multiplier}x</span>`;
    }
    toast.innerHTML = html;

    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  }

  // Injetar estilos de animação
  function injectStyles() {
    if (document.getElementById('eai-economy-styles')) return;

    const style = document.createElement('style');
    style.id = 'eai-economy-styles';
    style.textContent = `
      @keyframes eaiToastIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes eaiToastOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // === RECOMPENSA COMPLETA ===
  function giveReward(type, amount, showAnimation = true) {
    if (type === 'coins') addCoins(amount);
    else if (type === 'diamonds') addDiamonds(amount);
    else if (type === 'gold') addGold(amount);

    if (showAnimation) {
      showToast(amount, type, 'reward');
    }

    updateWalletDisplay();
  }

  function giveGameReward(options) {
    const result = calculateReward(options);

    if (result.total > 0) {
      addCoins(result.total);
      showRewardWithMultiplier(result.total, result.multiplier, 'coins');
    }

    updateWalletDisplay();
    return result;
  }

  // === BAÚ DO TESOURO ===
  function createTreasureChest() {
    injectStyles();

    const styles = `
      .eai-chest-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #F59E0B, #D97706);
        border: 3px solid #92400E;
        border-radius: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        z-index: 9998;
        animation: chestPulse 3s ease-in-out infinite;
      }
      .eai-chest-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
      }
      @keyframes chestPulse {
        0%, 100% { box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 4px 25px rgba(245, 158, 11, 0.5); }
      }

      .eai-chest-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(8px);
      }
      .eai-chest-modal.show { display: flex; }

      .eai-chest-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #F59E0B;
        border-radius: 20px;
        padding: 1.5rem;
        min-width: 300px;
        max-width: 90%;
        text-align: center;
        animation: modalIn 0.3s ease;
      }
      @keyframes modalIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .eai-chest-title {
        font-size: 1.5rem;
        color: #F59E0B;
        margin-bottom: 1.25rem;
        font-family: system-ui, sans-serif;
        font-weight: bold;
      }

      .eai-currency-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .eai-currency-item {
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 0.75rem 0.5rem;
        border: 2px solid transparent;
      }
      .eai-currency-icon { font-size: 1.75rem; display: block; margin-bottom: 0.25rem; }
      .eai-currency-value { font-size: 1.25rem; font-weight: bold; color: white; display: block; }
      .eai-currency-label { font-size: 0.7rem; color: #888; text-transform: uppercase; }

      .eai-currency-item.coins { border-color: #CD7F32; }
      .eai-currency-item.coins .eai-currency-value { color: #CD7F32; }
      .eai-currency-item.diamonds { border-color: #00D4FF; }
      .eai-currency-item.diamonds .eai-currency-value { color: #00D4FF; }
      .eai-currency-item.gold { border-color: #FFD700; }
      .eai-currency-item.gold .eai-currency-value { color: #FFD700; }

      .eai-total-section {
        background: linear-gradient(135deg, #F59E0B, #D97706);
        border-radius: 12px;
        padding: 0.75rem;
        margin-bottom: 1rem;
      }
      .eai-total-label { font-size: 0.8rem; color: rgba(255,255,255,0.8); }
      .eai-total-value { font-size: 1.5rem; font-weight: bold; color: white; }

      .eai-chest-close {
        background: rgba(255,255,255,0.15);
        border: none;
        color: white;
        padding: 0.6rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s;
        font-family: system-ui, sans-serif;
      }
      .eai-chest-close:hover { background: rgba(255,255,255,0.25); }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Botão do baú
    const chestBtn = document.createElement('button');
    chestBtn.className = 'eai-chest-btn';
    chestBtn.innerHTML = '🎁';
    chestBtn.title = 'Baú do Tesouro';
    document.body.appendChild(chestBtn);

    // Modal
    const modal = document.createElement('div');
    modal.className = 'eai-chest-modal';
    modal.innerHTML = `
      <div class="eai-chest-content">
        <div class="eai-chest-title">🏆 Baú do Tesouro</div>
        <div class="eai-currency-grid">
          <div class="eai-currency-item coins">
            <span class="eai-currency-icon">🪙</span>
            <span class="eai-currency-value" id="wallet-coins">0</span>
            <span class="eai-currency-label">Moedas</span>
          </div>
          <div class="eai-currency-item diamonds">
            <span class="eai-currency-icon">💎</span>
            <span class="eai-currency-value" id="wallet-diamonds">0</span>
            <span class="eai-currency-label">Diamantes</span>
          </div>
          <div class="eai-currency-item gold">
            <span class="eai-currency-icon">🥇</span>
            <span class="eai-currency-value" id="wallet-gold">0</span>
            <span class="eai-currency-label">Ouro</span>
          </div>
        </div>
        <div class="eai-total-section">
          <div class="eai-total-label">Valor Total</div>
          <div class="eai-total-value" id="wallet-total">0</div>
        </div>
        <button class="eai-chest-close">Fechar</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Events
    chestBtn.addEventListener('click', () => {
      updateWalletDisplay();
      modal.classList.add('show');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('eai-chest-close')) {
        modal.classList.remove('show');
      }
    });
  }

  function updateWalletDisplay() {
    const wallet = getWallet();
    const coinsEl = document.getElementById('wallet-coins');
    const diamondsEl = document.getElementById('wallet-diamonds');
    const goldEl = document.getElementById('wallet-gold');
    const totalEl = document.getElementById('wallet-total');

    if (coinsEl) coinsEl.textContent = wallet.coins.toLocaleString('pt-BR');
    if (diamondsEl) diamondsEl.textContent = wallet.diamonds.toLocaleString('pt-BR');
    if (goldEl) goldEl.textContent = wallet.gold.toLocaleString('pt-BR');
    if (totalEl) totalEl.textContent = getTotalInCoins().toLocaleString('pt-BR');
  }

  // === TEMPO DE JOGO ===
  let playTimeInterval = null;
  let sessionStartTime = null;
  let totalPlayMinutes = 0;

  function startPlayTimer() {
    if (playTimeInterval) return;

    sessionStartTime = Date.now();
    let lastRewardMinute = 0;
    let lastDiamondMinute = 0;

    playTimeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 60000);

      // Bônus a cada 5 minutos
      if (elapsed > 0 && elapsed % CONFIG.timeBonus.playMinutes === 0 && elapsed !== lastRewardMinute) {
        lastRewardMinute = elapsed;
        giveReward('coins', CONFIG.timeBonus.playReward);
      }

      // Diamante a cada 30 minutos
      if (elapsed > 0 && elapsed % CONFIG.timeBonus.sessionMinutes === 0 && elapsed !== lastDiamondMinute) {
        lastDiamondMinute = elapsed;
        giveReward('diamonds', CONFIG.timeBonus.sessionReward);
      }
    }, 60000); // Check every minute
  }

  function stopPlayTimer() {
    if (playTimeInterval) {
      clearInterval(playTimeInterval);
      playTimeInterval = null;
    }
  }

  // === INICIALIZAÇÃO ===
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createTreasureChest();
        startPlayTimer();
      });
    } else {
      createTreasureChest();
      startPlayTimer();
    }
  }

  init();

  // === API PÚBLICA ===
  return {
    // Wallet
    getWallet,
    addCoins,
    removeCoins,
    addDiamonds,
    addGold,
    canAfford,
    getTotalInCoins,

    // Pontuação
    calculateReward,
    giveReward,
    giveGameReward,
    applyPenalty,

    // UI
    showToast,
    showRewardWithMultiplier,
    updateWalletDisplay,

    // Config
    CONFIG
  };
})();

// Manter compatibilidade com código antigo
const getWallet = EAI.getWallet;
const addCoins = EAI.addCoins;
const addDiamonds = EAI.addDiamonds;
const addGold = EAI.addGold;
const giveReward = EAI.giveReward;
const getTotalInCoins = EAI.getTotalInCoins;
