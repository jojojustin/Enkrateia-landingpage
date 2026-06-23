  /*
    Supabase Edge Function endpoint:
    https://<project-ref>.functions.supabase.co/waitlist-signup
  */
  const WAITLIST_ENDPOINT = 'https://jtlhhomzkfiufyoitpfg.functions.supabase.co/waitlist-signup';
  const ANALYTICS = {
    posthogKey: '',
    posthogHost: 'https://app.posthog.com',
    gaMeasurementId: '',
  };
  const ANALYTICS_CONSENT_KEY = 'enkrateia_analytics_consent_v1';
  // Keep render timestamp for anti-bot latency checks.
  const FORM_RENDERED_AT = Date.now();

  /* Nav ink on scroll */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('ink', window.scrollY > 20);
  }, { passive: true });

  function initAnalytics() {
    if (ANALYTICS.posthogKey) {
      !function(t,e){var o,n,p,r;e.__SV=1,window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e},u.people.toString=function(){return u.toString(1)+'.people (stub)'},o='init capture register register_once unregister unregister_once identify alias set_config reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing start_batch_senders stop_batch_senders'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1}(document,window.posthog||[]);
      posthog.init(ANALYTICS.posthogKey, { api_host: ANALYTICS.posthogHost, person_profiles: 'identified_only' });
      posthog.capture('landing_page_viewed');
    }

    if (ANALYTICS.gaMeasurementId) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.gaMeasurementId}`;
      document.head.appendChild(gtagScript);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ANALYTICS.gaMeasurementId, { anonymize_ip: true });
    }
  }

  function setConsent(enabled) {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, enabled ? 'yes' : 'no');
    const banner = document.getElementById('analytics-consent');
    if (banner) banner.style.display = 'none';
    if (enabled) initAnalytics();
  }

  const savedConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (savedConsent === 'yes') initAnalytics();
  document.addEventListener('DOMContentLoaded', () => {
    if (!savedConsent) {
      const banner = document.getElementById('analytics-consent');
      if (banner) banner.style.display = 'block';
    }
  });

  /* Waitlist handler */
  function bind(formId, emailId, okId, honeypotId, messageId) {
    const form  = document.getElementById(formId);
    const email = document.getElementById(emailId);
    const ok    = document.getElementById(okId);
    const honeypot = document.getElementById(honeypotId);
    const msg = document.getElementById(messageId);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (form.dataset.submitting === '1') return;
      if (msg) { msg.style.display = 'none'; msg.textContent = ''; }
      const v = email.value.trim();
      if (!v || !v.includes('@')) {
        email.focus();
        email.style.borderColor = '#FF6060';
        email.style.boxShadow   = '0 0 0 3px rgba(255,96,96,.14)';
        if (msg) {
          msg.textContent = 'Please enter a valid email.';
          msg.style.color = '#FF6060';
          msg.style.display = 'block';
        }
        setTimeout(() => { email.style.borderColor = ''; email.style.boxShadow = ''; }, 1800);
        return;
      }
      if (!WAITLIST_ENDPOINT) {
        form.style.display = 'none';
        ok.style.display   = 'flex';
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      form.dataset.submitting = '1';
      if (submitButton) submitButton.disabled = true;
      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: v,
          source: formId,
          // Keep honeypot field in DOM for bots, but never forward autofilled values.
          company: '',
          submitted_at: new Date().toISOString(),
          rendered_at: new Date(FORM_RENDERED_AT).toISOString(),
          metadata: { page: 'landing', ts: new Date().toISOString() },
        }),
      })
        .then(async (res) => {
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (msg && res.status === 429) {
              msg.textContent = 'Too many attempts from this network. Please wait 15 minutes and retry.';
              msg.style.color = '#D09030';
              msg.style.display = 'block';
            } else if (msg && payload && payload.error) {
              const backendError = String(payload.error || '').toLowerCase();
              if (backendError === 'rejected') {
                msg.textContent = 'Submission blocked by anti-spam checks. Please wait a moment and try again.';
              } else if (backendError === 'invalid email') {
                msg.textContent = 'Please enter a valid email address.';
              } else {
                msg.textContent = 'Could not join right now. Please retry in a moment.';
              }
              msg.style.color = '#FF6060';
              msg.style.display = 'block';
            } else {
              throw new Error('Waitlist submit failed');
            }
            return;
          }
          form.style.display = 'none';
          ok.style.display = 'flex';
          if (window.posthog) {
            window.posthog.capture('waitlist_signup', { source: formId });
          }
          if (window.gtag) {
            window.gtag('event', 'waitlist_signup', { source: formId });
          }
        })
        .catch(() => {
          email.focus();
          email.style.borderColor = '#FF6060';
          email.style.boxShadow   = '0 0 0 3px rgba(255,96,96,.14)';
          if (msg) {
            msg.textContent = 'We could not submit right now. Please try again.';
            msg.style.color = '#FF6060';
            msg.style.display = 'block';
          }
        })
        .finally(() => {
          form.dataset.submitting = '0';
          if (submitButton) submitButton.disabled = false;
        });
    });
  }
  bind('wl1','wl1-e','wl1-ok','wl1-company','wl1-msg');
  bind('wl2','wl2-e','wl2-ok','wl2-company','wl2-msg');
