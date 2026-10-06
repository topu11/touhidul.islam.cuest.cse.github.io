(function () {
  var root = document.documentElement;

  /* ---------- theme (light by default, the choice is remembered) ---------- */
  var toggles = document.querySelectorAll('[data-theme-toggle]');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function saveTheme(value) {
    try { localStorage.setItem('theme', value); } catch (e) { /* storage unavailable */ }
  }
  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var text = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    toggles.forEach(function (button) {
      button.setAttribute('aria-label', text);
      button.setAttribute('title', text);
    });
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0a101f' : '#f3f6fc');
  }

  applyTheme(currentTheme());

  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- active section in the nav ---------- */
  var navLinks = document.querySelectorAll('[data-nav] a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var ids = [];
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (ids.indexOf(id) === -1) ids.push(id);
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-20% 0px -65% 0px' });
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- project details without leaving the page ---------- */
  var dialog = document.getElementById('project-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var body = dialog.querySelector('[data-dialog-body]');

  function slugFromHash() {
    var match = location.hash.match(/^#project-([a-z0-9-]+)$/);
    return match ? match[1] : null;
  }

  function show(slug) {
    var tpl = document.getElementById('tpl-' + slug);
    if (!tpl) return false;
    body.replaceChildren(tpl.content.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    return true;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-project]');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    var slug = link.getAttribute('data-project');
    if (show(slug)) history.pushState({ project: slug }, '', '#project-' + slug);
  });

  function closeProject() {
    if (dialog.open) dialog.close();
    if (!slugFromHash()) return;
    if (history.state && history.state.project) history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog || event.target.closest('[data-close]')) closeProject();
  });

  // Escape fires "cancel" first; close through the same path so the address bar stays in sync.
  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeProject();
  });

  // Browser Back and Forward.
  window.addEventListener('popstate', function () {
    var slug = slugFromHash();
    if (slug) show(slug);
    else if (dialog.open) dialog.close();
  });

  // A shared link such as /#project-wpsearch opens that project directly.
  var first = slugFromHash();
  if (first) show(first);
})();
