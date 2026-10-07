// Shared site behaviour: nav scroll state, mobile drawer, scroll reveals, section progress, FAQ accordions, modals.

(function() {
  const init = () => {
    // Nav scrolled state
    const nav = document.querySelector(".nav");
    const onScroll = () => {
      if (!nav) return;
      const scrolled = window.scrollY > 80;
      nav.classList.toggle("scrolled", scrolled);
      if (nav.dataset.transparentDefault === "true") {
        nav.classList.toggle("transparent", !scrolled);
      }
    };
    if (nav && nav.classList.contains("transparent")) {
      nav.dataset.transparentDefault = "true";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Hero video autoplay retry — kept for backward compatibility if a <video class="hero-video"> is reintroduced
    const heroVideo = document.querySelector(".hero-video");
    if (heroVideo) {
      const tryPlay = () => heroVideo.play().catch(() => {});
      tryPlay();
      heroVideo.addEventListener("loadeddata", tryPlay);
    }

    // Mobile drawer
    const menuBtn = document.querySelector(".menu-btn");
    const drawer = document.querySelector(".drawer");
    const closeDrawer = () => drawer && drawer.classList.remove("open");
    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", () => drawer.classList.toggle("open"));
      drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeDrawer));
    }

    // Reveal on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));

    // Section progress rail
    // Scroll-based "current section" detection (rather than pure
    // IntersectionObserver) so tall sections like about/Hijama are
    // reliably tracked as their band crosses the upper third of the viewport.
    const rail = document.querySelector(".progress-rail");
    if (rail) {
      const links = [...rail.querySelectorAll("a")];
      const sections = links
        .map(l => l.getAttribute("href"))
        .filter(h => h && h.startsWith("#"))
        .map(h => document.getElementById(h.slice(1)))
        .filter(Boolean);

      const setActive = (id) => {
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
      };

      const update = () => {
        const probeY = window.innerHeight * 0.35;
        let current = sections[0];
        for (const s of sections) {
          const rect = s.getBoundingClientRect();
          if (rect.top - probeY <= 0) current = s;
          else break;
        }
        if (current) setActive(current.id);
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    // FAQ accordions
    document.querySelectorAll(".faq-item").forEach(item => {
      const q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", String(open));
      });
    });

    // Service modal (homepage / services page)
    const modal = document.querySelector(".service-modal");
    if (modal) {
      const closeBtn = modal.querySelector(".sm-close");
      const titleEl = modal.querySelector(".sm-title");
      const tagEl = modal.querySelector(".sm-tag");
      const descEl = modal.querySelector(".sm-desc");
      const ptsEl = modal.querySelector(".sm-points");
      const close = () => { modal.classList.remove("open"); document.body.style.overflow = ""; };
      closeBtn && closeBtn.addEventListener("click", close);
      modal.addEventListener("click", e => { if (e.target === modal) close(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

      document.querySelectorAll("[data-service]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          const data = JSON.parse(card.getAttribute("data-service"));
          tagEl.textContent = data.tag;
          titleEl.textContent = data.title;
          descEl.textContent = data.desc;
          ptsEl.innerHTML = data.points.map((p, i) =>
            `<li><span class="num">${String(i+1).padStart(2,"0")}</span>${p}</li>`
          ).join("");
          modal.classList.add("open");
          document.body.style.overflow = "hidden";
        });
      });
    }

    // Floating RDV button — visible after scrolling past the header
    if (!document.querySelector('.rdv-fab')) {
      const fabHtml = `
<button type="button" class="rdv-fab" aria-label="Prendre rendez-vous" data-rdv-open>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M12 14l2 2 4-4"/>
  </svg>
  <span class="rdv-fab-label">Prendre rendez-vous</span>
</button>`;
      document.body.insertAdjacentHTML('beforeend', fabHtml);
    }
    const fab = document.querySelector('.rdv-fab');
    if (fab) {
      const updateFab = () => {
        const shown = window.scrollY > 200;
        fab.classList.toggle('is-visible', shown);
      };
      updateFab();
      window.addEventListener('scroll', updateFab, { passive: true });
    }

    // Back-to-top button — sits below the RDV FAB, bottom-right
    if (!document.querySelector('.back-to-top')) {
      document.body.insertAdjacentHTML('beforeend',
        '<button type="button" class="back-to-top" aria-label="Retour en haut">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>' +
        '</button>');
    }
    const toTop = document.querySelector('.back-to-top');
    if (toTop) {
      const updateTop = () => toTop.classList.toggle('is-visible', window.scrollY > 200);
      updateTop();
      window.addEventListener('scroll', updateTop, { passive: true });
      toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // RDV popup — phone + WhatsApp, with live open/closed status (auto-injected)
    if (!document.querySelector('.rdv-modal')) {
      const html = `
<div class="rdv-modal" role="dialog" aria-modal="true" aria-labelledby="rdv-title" aria-hidden="true">
  <div class="rdv-backdrop" data-rdv-close></div>
  <div class="rdv-card" role="document">
    <button class="rdv-close" type="button" aria-label="Fermer" data-rdv-close>×</button>
    <span class="eyebrow"><span>| Prise de rendez-vous</span></span>
    <h2 class="rdv-title" id="rdv-title">Réserver <em>une séance.</em></h2>
    <p class="rdv-status" data-rdv-status><span class="rdv-dot" aria-hidden="true"></span><span data-rdv-status-text></span></p>
    <div class="rdv-meta">
      <a href="tel:+212537866270" class="rdv-meta-item"><span class="l">Téléphone</span><span class="v">+212 537 866 270</span></a>
      <div class="rdv-meta-item"><span class="l">Horaires</span><span class="v">Lun–Ven · 9h → 17h<br>Samedi · 9h → 13h</span></div>
    </div>
    <div class="rdv-ctas">
    <a class="rdv-cta" href="tel:+212537866270">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span>Appeler</span>
    </a>
    <a class="rdv-cta rdv-cta--wa" href="https://wa.me/212618939300?text=${encodeURIComponent('Bonjour, je souhaite prendre rendez-vous pour une séance de Hijama.')}" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      <span>WhatsApp</span>
    </a>
    </div>
    <p class="rdv-note" data-rdv-wa-note hidden>Hors horaires d’ouverture : laissez-nous un message, nous vous répondons dès la réouverture.</p>
  </div>
</div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    }

    const rdvModal = document.querySelector('.rdv-modal');

    // Opening hours in Salé time: Mon–Fri 9h–17h, Sat 9h–13h, closed Sunday
    const HOURS = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 13] };
    const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const cabinetStatus = () => {
      let day, mins;
      try {
        const p = {};
        new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Casablanca', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(({ type, value }) => { p[type] = value; });
        day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
        mins = +p.hour * 60 + +p.minute;
      } catch (_) {
        const d = new Date(); day = d.getDay(); mins = d.getHours() * 60 + d.getMinutes();
      }
      const today = HOURS[day];
      if (today && mins >= today[0] * 60 && mins < today[1] * 60) {
        return { open: true, text: 'Ouvert maintenant · jusqu’à ' + today[1] + 'h' };
      }
      if (today && mins < today[0] * 60) return { open: false, text: 'Fermé · ouvre aujourd’hui à ' + today[0] + 'h' };
      let next = (day + 1) % 7;
      while (!HOURS[next]) next = (next + 1) % 7;
      const when = next === (day + 1) % 7 ? 'demain' : DAYS[next];
      return { open: false, text: 'Fermé · ouvre ' + when + ' à ' + HOURS[next][0] + 'h' };
    };
    const refreshRdvStatus = () => {
      if (!rdvModal) return;
      const s = cabinetStatus();
      rdvModal.querySelector('[data-rdv-status]').classList.toggle('is-open', s.open);
      rdvModal.querySelector('[data-rdv-status-text]').textContent = s.text;
      rdvModal.querySelector('[data-rdv-wa-note]').hidden = s.open;
    };

    if (rdvModal) {
      const openModal = () => {
        refreshRdvStatus();
        rdvModal.classList.add('is-open');
        rdvModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('rdv-locked');
        // Focus the first call-to-action for accessibility
        setTimeout(() => {
          const cta = rdvModal.querySelector('.rdv-cta');
          if (cta) cta.focus();
        }, 200);
      };
      const closeModal = () => {
        rdvModal.classList.remove('is-open');
        rdvModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('rdv-locked');
      };
      window.openRdvModal = openModal;
      window.closeRdvModal = closeModal;

      // Intercept clicks on any link to booking.html or [data-rdv-open]
      document.addEventListener('click', (e) => {
        const opener = e.target.closest('a[href$="booking.html"], [data-rdv-open]');
        if (opener) {
          // Don't intercept if the opener is inside the modal itself (avoid loops)
          if (rdvModal.contains(opener)) return;
          e.preventDefault();
          openModal();
          // Close drawer if the trigger came from the mobile drawer
          const drawer = document.querySelector('.drawer');
          if (drawer && drawer.contains(opener)) drawer.classList.remove('open');
          // Close service-modal if it was the source (chained CTA)
          const serviceModal = document.querySelector('.service-modal.open');
          if (serviceModal && serviceModal.contains(opener)) {
            serviceModal.classList.remove('open');
          }
        }
        // Close handlers
        if (e.target.matches('[data-rdv-close]') || e.target.closest('[data-rdv-close]')) {
          closeModal();
        }
      });
      // Escape key closes
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && rdvModal.classList.contains('is-open')) closeModal();
      });
    }

    // Quick-contact "Envoyer un message" (fs-form) -> Apps Script (email contact@hijamamedicale.com + Google Sheet)
    (function () {
      const EP = 'https://script.google.com/macros/s/AKfycbzDENSrwDGJBOvqbkrGVCPiUWFnANqa-YnHPnGX8OW0cw75AGH5GXfeMiLrCMWydYA2EQ/exec';
      document.querySelectorAll('form.fs-form').forEach((form) => {
        if (form.dataset.wired) return;
        form.dataset.wired = '1';
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!form.checkValidity()) { form.reportValidity(); return; }
          const btn = form.querySelector('.fs-submit');
          const thanks = form.querySelector('.fs-form-thanks');
          if (btn) btn.disabled = true;
          const fd = new FormData(form);
          if (!fd.get('speciality')) fd.set('speciality', 'Message (contact rapide)');
          const done = () => {
            if (thanks) thanks.classList.add('is-shown');
            setTimeout(() => { form.reset(); if (thanks) thanks.classList.remove('is-shown'); if (btn) btn.disabled = false; }, 3000);
          };
          fetch(EP, { method: 'POST', mode: 'no-cors', body: fd }).then(done).catch(done);
        });
      });
    })();

    // i18n
    if (window.initI18n) window.initI18n();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
