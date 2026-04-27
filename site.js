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

    // Hero video autoplay retry (some browsers block autoplay until interaction)
    const heroVideo = document.querySelector(".hero-video");
    if (heroVideo) {
      const tryPlay = () => heroVideo.play().catch(() => {});
      tryPlay();
      heroVideo.addEventListener("loadeddata", tryPlay);
      ["click", "touchstart", "scroll", "keydown"].forEach(evt => {
        window.addEventListener(evt, tryPlay, { once: true, passive: true });
      });
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
      const durEl = modal.querySelector(".sm-dur");
      const priceEl = modal.querySelector(".sm-price");
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
          durEl.textContent = data.dur;
          priceEl.textContent = data.price;
          ptsEl.innerHTML = data.points.map((p, i) =>
            `<li><span class="num">${String(i+1).padStart(2,"0")}</span>${p}</li>`
          ).join("");
          modal.classList.add("open");
          document.body.style.overflow = "hidden";
        });
      });
    }

    // RDV booking popup modal — auto-inject if not present on the page
    if (!document.querySelector('.rdv-modal')) {
      const html = `
<div class="rdv-modal" role="dialog" aria-modal="true" aria-labelledby="rdv-title" aria-hidden="true">
  <div class="rdv-backdrop" data-rdv-close></div>
  <div class="rdv-card" role="document">
    <button class="rdv-close" type="button" aria-label="Fermer" data-rdv-close>×</button>
    <div class="rdv-grid">
      <aside class="rdv-info">
        <span class="eyebrow"><span>— Prise de rendez-vous</span></span>
        <h2 class="rdv-title" id="rdv-title">Réserver <em>une séance.</em></h2>
        <p class="rdv-lead">Des créneaux sont généralement disponibles dans la semaine. Pour une urgence ou un cas complexe, contactez-nous directement par téléphone.</p>
        <div class="rdv-meta">
          <a href="tel:+212537866270" class="rdv-meta-item"><span class="l">Téléphone</span><span class="v">+212 537 866 270</span></a>
          <a href="mailto:contact@drbouhoutlatifa.com" class="rdv-meta-item"><span class="l">Email</span><span class="v">contact@drbouhoutlatifa.com</span></a>
          <div class="rdv-meta-item"><span class="l">Adresse</span><span class="v">Rue Lalla Asmae, Résidence Adam 2 · Tabriquet · Salé</span></div>
          <div class="rdv-meta-item"><span class="l">Horaires</span><span class="v">Lun–Ven · 9h → 17h<br>Samedi · 9h → 13h</span></div>
        </div>
      </aside>
      <form class="rdv-form" novalidate>
        <h3 class="rdv-form-title">Vos coordonnées</h3>
        <label class="rdv-field"><span class="rdv-field-label">Nom complet *</span><input type="text" name="name" required placeholder="Prénom et nom"></label>
        <div class="rdv-row">
          <label class="rdv-field"><span class="rdv-field-label">Téléphone *</span><input type="tel" name="phone" required placeholder="+212 …"></label>
          <label class="rdv-field"><span class="rdv-field-label">Email</span><input type="email" name="email" placeholder="vous@exemple.com"></label>
        </div>
        <label class="rdv-field"><span class="rdv-field-label">Spécialité *</span>
          <select name="speciality" required>
            <option value="" disabled selected>Choisissez une spécialité…</option>
            <option>Consultation médicale</option>
            <option>Hijama pour les douleurs dorsales</option>
            <option>Hijama pour le stress et l'anxiété</option>
            <option>Hijama pour la perte de poids</option>
            <option>Hijama pour les migraines</option>
            <option>Hijama pour la fertilité</option>
            <option>Hijama pour le SOPK</option>
            <option>Ventouses sèches</option>
            <option>Journées Hijama Sunna</option>
          </select>
        </label>
        <div class="rdv-row">
          <label class="rdv-field"><span class="rdv-field-label">Date souhaitée</span><input type="date" name="date"></label>
          <label class="rdv-field"><span class="rdv-field-label">Créneau</span>
            <select name="slot">
              <option value="" disabled selected>Sélectionner…</option>
              <option>Matin (9h–12h)</option>
              <option>Après-midi (14h–17h)</option>
              <option>Samedi matin (9h–13h)</option>
            </select>
          </label>
        </div>
        <label class="rdv-field"><span class="rdv-field-label">Message (facultatif)</span><textarea name="message" rows="3" placeholder="Préciser votre motif, antécédents, traitement en cours…"></textarea></label>
        <div class="rdv-consent"><label><input type="checkbox" required><span>J'accepte d'être recontacté(e) pour confirmer le rendez-vous.</span></label></div>
        <button type="submit" class="rdv-submit"><span>Envoyer la demande</span><span class="rdv-arrow" aria-hidden="true">→</span></button>
        <div class="rdv-thanks" role="status">✓ Merci, votre demande est bien reçue. Nous vous recontactons sous 24 h.</div>
      </form>
    </div>
  </div>
</div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    }

    const rdvModal = document.querySelector('.rdv-modal');
    if (rdvModal) {
      // Wire form submission with thanks state
      const form = rdvModal.querySelector('.rdv-form');
      if (form && !form.dataset.wired) {
        form.dataset.wired = '1';
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!form.checkValidity()) { form.reportValidity(); return; }
          form.querySelector('.rdv-thanks').classList.add('is-shown');
          setTimeout(() => {
            window.closeRdvModal && window.closeRdvModal();
            form.reset();
            form.querySelector('.rdv-thanks').classList.remove('is-shown');
          }, 2200);
        });
      }
    }

    if (rdvModal) {
      const openModal = () => {
        rdvModal.classList.add('is-open');
        rdvModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('rdv-locked');
        // Focus first input for accessibility
        setTimeout(() => {
          const firstInput = rdvModal.querySelector('input, select, textarea');
          if (firstInput) firstInput.focus();
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

    // i18n
    if (window.initI18n) window.initI18n();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
