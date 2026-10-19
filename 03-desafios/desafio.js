/* Desafios para quem é bom (INEMA na MOSTRATEC 2026).
   Confere a resposta no próprio navegador, sem servidor:
   - a resposta digitada é normalizada (minúsculas, sem acento, vírgula vira ponto);
   - o SHA-256 dela é comparado com o hash guardado na página;
   - a explicação está cifrada (AES-GCM) com uma chave tirada da resposta certa,
     então só abre para quem acertou. Nada é enviado para lugar nenhum.
   O mesmo arquivo é usado pelo gera.cjs e pelo testa.cjs (Node). */
(function (raiz) {
  'use strict';

  // Normaliza um valor conforme o tipo do campo: "numero", "letras" ou "texto".
  function normaliza(valor, tipo) {
    var s = String(valor == null ? '' : valor).trim().toLowerCase();
    s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/\s+/g, ' ');
    if (tipo === 'numero') {
      s = s.replace(/\s/g, '').replace(/[%°º]|cm|graus?$/g, '').replace(/^\+/, '');
      if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // 1.500 -> 1500
      s = s.replace(',', '.');
      if (/^-?\d+(\.\d+)?$/.test(s) || /^-?\.\d+$/.test(s)) s = String(Number(s));
      return s;
    }
    if (tipo === 'letras') return s.replace(/[^a-z]/g, '');
    return s.replace(/[^a-z0-9 ]/g, '').trim();
  }

  // Junta os campos de um desafio numa resposta só ("18;11").
  function junta(valores, tipos) {
    return valores.map(function (v, i) { return normaliza(v, tipos[i] || tipos[0]); }).join(';');
  }

  function subtle() {
    var c = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto : null;
    if (!c && typeof require === 'function') c = require('crypto').webcrypto;
    return c && c.subtle ? c.subtle : null;
  }
  function bytes(txt) { return new TextEncoder().encode(txt); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function b64(buf) {
    var u = new Uint8Array(buf), s = '';
    for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return typeof btoa === 'function' ? btoa(s) : Buffer.from(u).toString('base64');
  }
  function deb64(txt) {
    var s = typeof atob === 'function' ? atob(txt) : Buffer.from(txt, 'base64').toString('binary');
    var u = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }

  // Hash que fica na página (o id do desafio entra como "sal").
  function hashResposta(id, resp) {
    return subtle().digest('SHA-256', bytes('mostratec26:' + id + ':' + resp)).then(hex);
  }
  function chave(id, resp, uso) {
    return subtle().digest('SHA-256', bytes('explica:' + id + ':' + resp)).then(function (k) {
      return subtle().importKey('raw', k, 'AES-GCM', false, [uso]);
    });
  }
  function cifra(id, resp, texto, iv) {
    return chave(id, resp, 'encrypt').then(function (k) {
      return subtle().encrypt({ name: 'AES-GCM', iv: iv }, k, bytes(texto));
    }).then(b64);
  }
  function decifra(id, resp, cifrado, ivb64) {
    return chave(id, resp, 'decrypt').then(function (k) {
      return subtle().decrypt({ name: 'AES-GCM', iv: deb64(ivb64) }, k, deb64(cifrado));
    }).then(function (b) { return new TextDecoder().decode(b); });
  }

  // Placar só neste aparelho (localStorage). Pode falhar em aba anônima: tudo em try/catch.
  var CHAVE_PLACAR = 'mostratec26-desafios';
  function lePlacar() {
    try { return JSON.parse(localStorage.getItem(CHAVE_PLACAR) || '{}') || {}; } catch (e) { return {}; }
  }
  function marca(id) {
    try { var p = lePlacar(); if (!p[id]) { p[id] = Date.now(); localStorage.setItem(CHAVE_PLACAR, JSON.stringify(p)); } } catch (e) { /* sem placar, sem problema */ }
  }

  var api = { normaliza: normaliza, junta: junta, hashResposta: hashResposta, cifra: cifra, decifra: decifra, b64: b64, lePlacar: lePlacar };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  raiz.Desafio = api;

  // ---------- página de um desafio ----------
  function iniciaDesafio(form) {
    var id = form.getAttribute('data-id');
    var cofreEl = document.getElementById('cofre');
    var cofre = cofreEl ? JSON.parse(cofreEl.textContent) : null;
    var campos = Array.prototype.slice.call(form.querySelectorAll('input'));
    var tipos = campos.map(function (c) { return c.getAttribute('data-tipo') || 'texto'; });
    var retorno = form.querySelector('.retorno');
    var tentativas = 0;

    function abreExplicacao(resp) {
      return decifra(id, resp, cofre.exp, cofre.iv).then(function (html) {
        var sec = document.getElementById('explicacao');
        sec.querySelector('.exp').innerHTML = html;
        sec.hidden = false;
      });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!cofre || !subtle()) { retorno.textContent = 'Este navegador não confere a resposta. Abra o site com https.'; return; }
      var vazios = campos.filter(function (c) { return !c.value.trim(); });
      if (vazios.length) { retorno.className = 'retorno erro'; retorno.textContent = 'Preencha todos os campos.'; vazios[0].focus(); return; }
      var resp = junta(campos.map(function (c) { return c.value; }), tipos);
      tentativas++;
      hashResposta(id, resp).then(function (h) {
        if (h === cofre.hash) {
          marca(id);
          form.classList.add('acertou');
          retorno.className = 'retorno ok';
          retorno.textContent = 'Certo. ' + (tentativas === 1 ? 'De primeira.' : 'Na tentativa ' + tentativas + '.') + ' A explicação abriu logo abaixo.';
          return abreExplicacao(resp).then(function () { document.getElementById('explicacao').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        }
        form.classList.remove('acertou');
        retorno.className = 'retorno erro';
        retorno.textContent = 'Ainda não. Tentativa ' + tentativas + '. Refaça a conta ou abra uma dica.';
      }).catch(function () { retorno.textContent = 'Não deu para conferir agora. Recarregue a página.'; });
    });

    // Dicas: uma de cada vez.
    var botao = document.querySelector('.mais-dica');
    var dicas = Array.prototype.slice.call(document.querySelectorAll('.dicas li'));
    if (botao && dicas.length) {
      var abertas = 0;
      var rotulo = function () { botao.textContent = abertas < dicas.length ? 'Ver dica ' + (abertas + 1) + ' de ' + dicas.length : 'Sem mais dicas'; botao.disabled = abertas >= dicas.length; };
      rotulo();
      botao.addEventListener('click', function () { if (abertas < dicas.length) { dicas[abertas].hidden = false; abertas++; rotulo(); } });
    }

    // Já resolvido neste aparelho: avisa (a explicação só abre digitando a resposta de novo).
    if (lePlacar()[id]) {
      retorno.className = 'retorno ok';
      retorno.textContent = 'Você já resolveu este neste aparelho. Digite a resposta de novo para rever a explicação.';
    }
  }

  // ---------- página com a lista ----------
  function iniciaLista() {
    var p = lePlacar();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-desafio]'));
    var feitos = 0;
    cards.forEach(function (c) {
      if (p[c.getAttribute('data-desafio')]) { c.classList.add('feito'); feitos++; }
    });
    var el = document.getElementById('placar');
    if (el) {
      el.querySelector('.num').textContent = feitos + ' de ' + cards.length;
      el.querySelector('.barra i').style.width = (cards.length ? Math.round(100 * feitos / cards.length) : 0) + '%';
    }
    var zera = document.getElementById('zerar');
    if (zera) zera.addEventListener('click', function () {
      try { localStorage.removeItem(CHAVE_PLACAR); } catch (e) { /* nada */ }
      location.reload();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form.resolver');
    if (form) iniciaDesafio(form);
    if (document.getElementById('placar')) iniciaLista();
  });
})(this);
