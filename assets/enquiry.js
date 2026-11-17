/* EGA enquiry form: pop-up dialog on every page + inline form on contact.html.
   Submissions go to FormSubmit (AJAX) and arrive at info@ega-advisory.com. */
(function () {
  var EMAIL = 'info@ega-advisory.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;
  var TOPICS = ['Feasibility & investment', 'New plant setup', 'Production process & recipe', 'Quality control',
    'Commissioning & start-up', 'Staff training', 'Ongoing support for an existing plant', 'Other'];

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function fields(p) {
    return '' +
      '<input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' +
      '<div class="f-row">' +
        '<div class="field"><label for="' + p + 'name">Name *</label><input id="' + p + 'name" name="Name" required autocomplete="name"></div>' +
        '<div class="field"><label for="' + p + 'company">Company</label><input id="' + p + 'company" name="Company" autocomplete="organization"></div>' +
      '</div>' +
      '<div class="f-row">' +
        '<div class="field"><label for="' + p + 'email">E-mail *</label><input id="' + p + 'email" name="email" type="email" required autocomplete="email"></div>' +
        '<div class="field"><label for="' + p + 'country">Country / region</label><input id="' + p + 'country" name="Country" autocomplete="country-name"></div>' +
      '</div>' +
      '<div class="field"><label for="' + p + 'topic">Area of interest</label><select id="' + p + 'topic" name="Area of interest">' +
        TOPICS.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="' + p + 'msg">Message *</label><textarea id="' + p + 'msg" name="Message" required placeholder="Planned capacity, location, timeline, current stage..."></textarea></div>' +
      '<button class="btn btn-primary" type="submit">Send enquiry <span class="arr">&rarr;</span></button>' +
      '<p class="form-msg" role="status" aria-live="polite"></p>';
  }

  var SENT = '<div class="sent-box" hidden>' +
    '<div class="sent-icon" aria-hidden="true">&#10003;</div>' +
    '<h3>Thank you &mdash; your enquiry has been sent.</h3>' +
    '<p>We will contact you within <strong>24 hours</strong> at the e-mail address you provided.</p>' +
    '</div>';

  function bind(form, onDone) {
    var btn = form.querySelector('button[type=submit]'), msg = form.querySelector('.form-msg');
    var label = btn.innerHTML;
    function v(n) { return ((form.elements[n] || {}).value || '').trim(); }
    form.addEventListener('input', function (e) { if (e.target.value && e.target.value.trim()) e.target.classList.remove('err'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg'; msg.textContent = '';
      var bad = [].slice.call(form.querySelectorAll('[required]')).filter(function (x) {
        var empty = !x.value.trim(); x.classList.toggle('err', empty); return empty;
      });
      var em = form.elements['email'];
      if (em.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) { em.classList.add('err'); bad.push(em); }
      if (bad.length) { msg.className = 'form-msg error'; msg.textContent = 'Please fill in your name, a valid e-mail address and a message.'; bad[0].focus(); return; }
      var data = {};
      new FormData(form).forEach(function (val, key) { data[key] = val; });
      data._subject = 'EGA enquiry: ' + v('Area of interest') + (v('Company') ? ' — ' + v('Company') : '');
      data._replyto = v('email');
      data._template = 'table';
      data._captcha = 'false';
      data.Page = location.pathname;
      btn.disabled = true; btn.textContent = 'Sending…';
      // FormSubmit can take 20+ s to answer although the e-mail is delivered.
      // keepalive lets the request finish even if the visitor closes the page;
      // the visitor sees success on the reply, or after 4 s while it is still on its way.
      var done = false;
      function ok() {
        if (done) return; done = true;
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { topic: data['Area of interest'] });
        form.reset(); btn.disabled = false; btn.innerHTML = label; onDone();
      }
      function fail() {
        if (done) return; done = true;
        msg.className = 'form-msg error';
        msg.innerHTML = 'Sorry, the message could not be sent. Please e-mail us at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
        btn.disabled = false; btn.innerHTML = label;
      }
      var wait = setTimeout(ok, 4000);
      // no-cors: FormSubmit delivers the e-mail but its reply cannot be read cross-origin,
      // so success = the request reached the server; only a network error counts as failure.
      fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, body: new URLSearchParams(data) })
        .then(function () { clearTimeout(wait); ok(); })
        .catch(function () { clearTimeout(wait); fail(); });
    });
  }

  /* ---- inline form on contact.html ---- */
  var host = document.getElementById('enquiry-inline');
  if (host) {
    host.innerHTML = '<form class="enquiry" novalidate><h3>Project enquiry</h3>' +
      '<p class="note">We will get back to you within 24 hours.</p>' + fields('i-') + '</form>' + SENT.replace('sent-box', 'enquiry sent-box');
    var f1 = host.querySelector('form'), s1 = host.querySelector('.sent-box');
    bind(f1, function () { f1.hidden = true; s1.hidden = false; s1.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  }

  /* ---- pop-up dialog ---- */
  var dlg = document.createElement('dialog');
  dlg.className = 'enq-dialog';
  dlg.setAttribute('aria-labelledby', 'enq-title');
  dlg.innerHTML = '<div class="enq-inner">' +
    '<button type="button" class="enq-close" aria-label="Close">&times;</button>' +
    '<div class="enq-body">' +
      '<div class="kicker">Get in touch</div>' +
      '<h2 id="enq-title">Tell us about your project</h2>' +
      '<p class="note">We will get back to you within 24 hours.</p>' +
      '<form class="enq-form" novalidate>' + fields('d-') + '</form>' +
    '</div>' + SENT +
    '</div>';
  document.body.appendChild(dlg);
  var form = dlg.querySelector('form'), body = dlg.querySelector('.enq-body'), sent = dlg.querySelector('.sent-box');
  var canDialog = typeof dlg.showModal === 'function';

  function open(e) {
    if (!canDialog) return; // very old browsers: follow the link to contact.html
    if (e) e.preventDefault();
    body.hidden = false; sent.hidden = true;
    dlg.showModal();
    document.documentElement.classList.add('enq-open');
    setTimeout(function () { var n = form.querySelector('input[name=Name]'); if (n && matchMedia('(hover:hover)').matches) n.focus(); }, 50);
    if (typeof gtag === 'function') gtag('event', 'open_enquiry_form');
  }
  function close() { dlg.close(); }
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('enq-open'); });
  dlg.querySelector('.enq-close').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  bind(form, function () {
    body.hidden = true; sent.hidden = false;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-primary'; b.textContent = 'Close';
    b.addEventListener('click', close);
    if (!sent.querySelector('.btn')) sent.appendChild(b);
  });

  // Every button-style link to contact.html opens the pop-up (plain text links still go to the page)
  [].forEach.call(document.querySelectorAll('a.btn[href="contact.html"], [data-enquiry]'), function (a) {
    a.addEventListener('click', open);
  });
  if (location.hash === '#enquiry') open();
})();
