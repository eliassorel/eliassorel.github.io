/* 📮 Abonnement : un seul mail quand un nouveau travail sort.
   Les adresses partent dans un formulaire Google privé (jamais affiché ni partagé). */
(function () {
  var FORM = '1bNLAvKbIzuFaqGj_FpbkoOCEqBGiJXRmlZ9qGTyP6lQ';
  var ENTRY = ''; // ex. 'entry.123456789' : tant que c'est vide, le bloc ne s'affiche pas
  if (!ENTRY) return;

  var pied = document.querySelector('footer .inner') || document.querySelector('footer');
  if (!pied || document.getElementById('abonnement')) return;

  var st = document.createElement('style');
  st.textContent =
    '#abonnement{margin:22px auto 6px;max-width:460px;text-align:center;display:flex;flex-direction:column;gap:8px}' +
    '#abonnement h3{margin:0;font-family:var(--serif,Georgia,serif);font-weight:500;font-size:1.15rem;letter-spacing:.01em;color:inherit}' +
    '#abonnement p{margin:0;font-size:.92rem;opacity:.8}' +
    '#abonnement form{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:4px}' +
    '#abonnement input[type=email]{flex:1 1 220px;min-width:0;font:inherit;padding:9px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;opacity:.9}' +
    '#abonnement input[type=email]::placeholder{color:inherit;opacity:.55}' +
    '#abonnement button{font:inherit;padding:9px 18px;border-radius:999px;border:1px solid var(--or-vif,#d4a82f);background:var(--or-vif,#d4a82f);color:#111a27;cursor:pointer;font-weight:600}' +
    '#abonnement button:disabled{opacity:.6;cursor:default}' +
    '#abonnement .piege{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '#abonnement small{display:block;font-size:.78rem;opacity:.6;line-height:1.45}' +
    '#abonnement .etat{min-height:1.2em;font-size:.9rem}';
  document.head.appendChild(st);

  var en = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var T = en ? {
    h: '📮 Get word of new work',
    p: 'One email when a new paper is out. Nothing else.',
    ph: 'your email address', b: 'Subscribe',
    rgpd: 'Your address is used for this only and never shared. To unsubscribe, reply “stop” to any email.',
    ok: 'Noted. Until the next release.', ko: 'That did not go through. Please try again in a moment.', bad: 'This address does not look right.'
  } : {
    h: '📮 Être prévenu d’un nouveau travail',
    p: 'Un seul mail quand un papier sort. Rien d’autre.',
    ph: 'votre adresse mail', b: 'M’abonner',
    rgpd: 'Votre adresse ne sert qu’à ça et n’est jamais partagée. Pour vous désabonner, répondez « stop » à n’importe quel mail.',
    ok: 'C’est noté. À la prochaine sortie.', ko: 'L’envoi n’est pas passé. Réessayez dans un instant.', bad: 'Cette adresse ne semble pas valide.'
  };

  var bloc = document.createElement('section');
  bloc.id = 'abonnement';
  bloc.setAttribute('aria-label', T.h);
  bloc.innerHTML =
    '<h3></h3><p class="sous"></p>' +
    '<form novalidate><label class="piege" aria-hidden="true">Ne pas remplir <input type="text" name="site" tabindex="-1" autocomplete="off"></label>' +
    '<input type="email" name="mail" required autocomplete="email" inputmode="email"><button type="submit"></button></form>' +
    '<div class="etat" aria-live="polite"></div><small></small>';
  bloc.querySelector('h3').textContent = T.h;
  bloc.querySelector('.sous').textContent = T.p;
  var champ = bloc.querySelector('input[type=email]');
  champ.placeholder = T.ph; champ.setAttribute('aria-label', T.ph);
  var bouton = bloc.querySelector('button');
  bouton.textContent = T.b;
  bloc.querySelector('small').textContent = T.rgpd;
  var etat = bloc.querySelector('.etat');

  var avant = pied.querySelector('.liens');
  if (avant) pied.insertBefore(bloc, avant); else pied.appendChild(bloc);

  bloc.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (bloc.querySelector('[name=site]').value) return; // robot
    var v = champ.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { etat.textContent = T.bad; champ.focus(); return; }
    bouton.disabled = true; etat.textContent = '…';
    var data = new URLSearchParams();
    data.append(ENTRY, v);
    fetch('https://docs.google.com/forms/d/' + FORM + '/formResponse', { method: 'POST', mode: 'no-cors', body: data })
      .then(function () { etat.textContent = T.ok; champ.value = ''; champ.disabled = true; })
      .catch(function () { etat.textContent = T.ko; bouton.disabled = false; });
  });
})();
