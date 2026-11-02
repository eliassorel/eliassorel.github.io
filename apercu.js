/* Aperçu au survol : quand la souris passe sur le lien d'un papier, sa couverture apparaît.
   Purement décoratif (aria-hidden), seulement sur les écrans avec une souris. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var P = {
    'l-equation-du-soi': ['L\'Équation du soi', 'voyage à travers l\'individu', 'Libre arbitre · Déséquilibre · Soi', '#d8b25a'],
    'le-diamant': ['Le Diamant', 'ce qui vibre, se souvient, éclaire', 'Vibration · Mémoire · Lumière', '#c77dba'],
    'l-icosaedre': ['L\'Icosaèdre', 'ce qui s\'étage, se lit, résonne', 'Échelle · Perception · Résonance', '#9FD8CC'],
    'metaphysical-stones': ['Metaphysical Stones', 'l\'entre-deux', 'Les pierres', '#d8b25a'],
    'le-big-bang': ['Le Big Bang', 'l\'éclat qui aveugle', 'Cosmologie', '#8fb0e0'],
    'le-poulpe': ['Le poulpe', 'le corps distribué', 'Le bestiaire', '#c8963e'],
    'la-crevette-mante': ['La crevette-mante', 'l\'œil qui cherche l\'accord', 'Le bestiaire', '#63dce8'],
    'la-mitochondrie': ['La mitochondrie', 'la complexité comme dette', 'Le bestiaire', '#c0503a'],
    'le-blob': ['Le blob', 'l\'accord sans chef', 'Le bestiaire', '#e0bf2a'],
    'le-tardigrade': ['Le tardigrade', 'la survie par le retrait', 'Le bestiaire', '#9fb3c0']
  };
  function img(slug) {
    return slug === 'la-mitochondrie' ? '/img/apercus/la-mitochondrie.jpg' : '/img/couvertures/' + slug + '.jpg';
  }

  var css = document.createElement('style');
  css.textContent =
    '.es-apercu{position:fixed;z-index:9999;width:212px;pointer-events:none;opacity:0;transform:translateY(6px) scale(.98);' +
    'transition:opacity .18s ease,transform .18s ease;background:#16161b;border:1px solid rgba(216,178,90,.45);border-radius:8px;' +
    'padding:10px;box-shadow:0 18px 40px rgba(0,0,0,.45);color:#efe7d2;font-family:"Cormorant Garamond",Georgia,serif}' +
    '.es-apercu.on{opacity:1;transform:none}' +
    '.es-apercu img{display:block;width:100%;aspect-ratio:320/452;object-fit:cover;border-radius:4px;background:#0d0d10}' +
    '.es-apercu b{display:block;font-weight:600;font-size:19px;line-height:1.15;margin-top:9px}' +
    '.es-apercu i{display:block;font-size:14.5px;color:#d8b25a;margin-top:2px}' +
    '.es-apercu small{display:block;font:600 9.5px/1.4 Inter,"Source Sans 3",system-ui,sans-serif;letter-spacing:.16em;' +
    'text-transform:uppercase;margin-top:7px;opacity:.85}' +
    '@media (prefers-reduced-motion:reduce){.es-apercu{transition:none}}';
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.className = 'es-apercu';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<img alt=""><b></b><i></i><small></small>';
  document.body.appendChild(box);
  var bImg = box.querySelector('img'), bT = box.querySelector('b'), bS = box.querySelector('i'), bM = box.querySelector('small');
  var timer = null, current = null;

  function slugOf(a) {
    var h = a.getAttribute('href') || '';
    var m = h.match(/^(?:https:\/\/eliassorel\.com)?\/papiers\/([a-z0-9-]+)\/?(?:#.*)?$/);
    if (!m || !P[m[1]]) return null;
    if (location.pathname.replace(/\/$/, '') === '/papiers/' + m[1]) return null; // pas sur sa propre pièce
    return m[1];
  }
  function place(x, y) {
    var w = box.offsetWidth, h = box.offsetHeight, vw = innerWidth, vh = innerHeight;
    var left = x + 18, top = y + 18;
    if (left + w > vw - 12) left = x - w - 18;
    if (top + h > vh - 12) top = Math.max(12, vh - h - 12);
    box.style.left = Math.max(12, left) + 'px';
    box.style.top = top + 'px';
  }
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a === current) return;
    var s = slugOf(a);
    if (!s) return;
    current = a;
    var d = P[s];
    bImg.src = img(s); bT.textContent = d[0]; bS.textContent = d[1]; bM.textContent = d[2]; bM.style.color = d[3];
    clearTimeout(timer);
    timer = setTimeout(function () { place(e.clientX, e.clientY); box.classList.add('on'); }, 140);
  });
  document.addEventListener('mousemove', function (e) { if (current && box.classList.contains('on')) place(e.clientX, e.clientY); });
  document.addEventListener('mouseout', function (e) {
    if (!current) return;
    if (e.relatedTarget && current.contains(e.relatedTarget)) return;
    if (e.target.closest && e.target.closest('a[href]') !== current) return;
    clearTimeout(timer); box.classList.remove('on'); current = null;
  });
  window.addEventListener('scroll', function () { clearTimeout(timer); box.classList.remove('on'); current = null; }, { passive: true });
})();
