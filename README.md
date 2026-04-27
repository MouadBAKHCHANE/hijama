# Hijama Therapy — Cabinet Dr. BOUHOUT Latifa

Site officiel du cabinet **Hijama Therapy** — Dr. Latifa BOUHOUT, médecin généraliste à Salé (Tabriquet, Maroc). Site statique en HTML / CSS / JS, sans dépendance ni framework.

**Production URL :** _à compléter_

---

## Structure

```
.
├── index.html          # Accueil (hero vidéo + Hijama + Bénéfices + Spécialités + Process + Indications + Hygiène + Avis + FAQ + Actualités)
├── docteur.html        # Cabinets / À propos du Dr. Bouhout
├── services.html       # Spécialités (8 prestations détaillées)
├── contact.html        # Prise de rendez-vous + adresse + horaires
├── styles.css          # Design system partagé (tokens, navigation, drawer, boutons, type)
├── home.css            # Styles spécifiques aux sections + responsive global
├── site.js             # Interactions (drawer, scroll-reveal, FAQ, RDV modal, scroll-pinned bénéfices, …)
└── assets/             # 14 images (cabinet, ventouses, portrait Dr.)
```

---

## Pages

| Page | Description |
|---|---|
| `index.html` | Page d'accueil — hero vidéo, Hijama Cupping Therapy, 6 bénéfices (scroll-pinned desktop), 8 spécialités, déroulé, indications, hygiène, avis, FAQ, actualités |
| `docteur.html` | Profil de la praticienne, parcours, philosophie, citation manuscrite |
| `services.html` | Détail long-form des 8 spécialités + bandeau protocole |
| `contact.html` | Adresse, horaires, téléphone, email, mock map |

---

## Design system (résumé)

- **Brand color:** `#911439` (bordeaux) + `#eeccc7` (rose bébé)
- **Police:** Manrope (corps + UI), Caveat (citation manuscrite uniquement sur docteur.html)
- **Palette neutres:** `#070707` ink, `#fbf4f3` cream, `#6b5e60` muted
- **CTA primaire:** texte sans fond, soulignement animé + flèche qui glisse au hover
- **Modal RDV:** popup global injecté dynamiquement, ouvert par tout lien `booking.html` ou `[data-rdv-open]`

---

## Interactions clés

- **Hero:** vidéo autoplay (Pexels) avec poster fallback
- **Bénéfices (desktop):** section "scroll-pinned" — défilement vertical → cartes qui se révèlent horizontalement
- **Bénéfices (mobile/tablet):** flèches prev/next + scrollbar custom (scrollbar native masquée)
- **Header:** transparent au-dessus du hero, blanc + flou en sticky scroll
- **Sandwich menu (mobile):** drawer plein écran sur le même fond taupe que le footer, CTA + icônes sociales
- **Right rail (desktop ≥1100px):** indicateur de section active synchronisé au scroll
- **RDV modal:** popup global, fermable au clic backdrop / `Escape` / bouton `×`
- **FAQ:** accordion `aria-expanded`
- **Reveal au scroll:** IntersectionObserver
- **Reduced motion:** respecté (prefers-reduced-motion)

---

## Coordonnées (cabinet)

- **Adresse:** Rue Lalla Asmae, Résidence Adam 2, Imm. 2, appt. 6, Tabriquet, 11000 Salé, Maroc
- **Téléphone:** +212 537 866 270
- **Email:** contact@drbouhoutlatifa.com
- **Horaires:** Lun–Ven 9h → 17h · Samedi 9h → 13h
- **Réseaux:** [Instagram](https://www.instagram.com/latifabht/) · [Facebook](https://web.facebook.com/BOUHOUTlatifa/) · [WhatsApp](https://wa.me/212537866270)

---

## Déploiement

Site 100% statique → déployable en un clic sur **n'importe quel hébergement statique** :

### Netlify (drag-and-drop)
1. Aller sur https://app.netlify.com/drop
2. Glisser le dossier `deploy/` (ou le dossier zippé) sur la page
3. Connecter un domaine personnalisé (ex. `drbouhoutlatifa.ma`)

### Vercel
```bash
npm i -g vercel
cd deploy/
vercel --prod
```

### GitHub Pages
1. Pousser le contenu de `deploy/` à la racine d'un repo GitHub (ou dans `/docs`)
2. Settings → Pages → branche `main` (ou `gh-pages`) → dossier `/` ou `/docs`
3. Le site sera servi sur `https://USERNAME.github.io/REPO/`

### Cloudflare Pages
1. Créer un projet Pages, connecter le repo
2. Build command: _(laisser vide)_
3. Output directory: `/` (ou `deploy` si pushé tel quel)

### FTP / hébergement classique
Uploader simplement le contenu de `deploy/` à la racine `public_html/` ou `www/` du serveur.

---

## Pré-déploiement (checklist)

- [ ] Vérifier toutes les pages localement (`index`, `docteur`, `services`, `contact`)
- [ ] Tester le modal RDV depuis chaque CTA "Prendre rendez-vous"
- [ ] Vérifier les liens sociaux dans le footer + drawer
- [ ] Confirmer la vidéo hero charge (réseau lent → poster image visible)
- [ ] Mobile : drawer s'ouvre, RDV modal pleine hauteur, flèches benefits fonctionnent
- [ ] Configurer DNS / domaine personnalisé
- [ ] Activer HTTPS (automatique sur Netlify / Vercel / Cloudflare)
- [ ] Brancher le formulaire RDV à un backend (Formspree, Netlify Forms, EmailJS, ou SMTP) — actuellement: confirmation locale puis reset
- [ ] Ajouter un favicon `favicon.ico` à la racine (TODO)
- [ ] Ajouter une image Open Graph `og.jpg` 1200×630 (TODO)

---

## Backend du formulaire RDV (suggestions)

Le formulaire actuel affiche une confirmation locale après soumission. Pour recevoir réellement les demandes :

- **Netlify Forms** (gratuit, 100 soumissions/mois) : ajouter `netlify` à la balise `<form>` et `name="rdv"`
- **Formspree** (gratuit jusqu'à 50 soumissions/mois) : remplacer l'`onsubmit` par `action="https://formspree.io/f/XXXXX" method="POST"`
- **EmailJS** (intégration JS pure) : config dans `site.js`
- **Backend custom** : `fetch('/api/rdv', { method: 'POST', body: new FormData(form) })`

---

## Crédits & licence

© 2026 Cabinet Dr. BOUHOUT — Tous droits réservés
Médecin diplômé · Conseil National de l'Ordre des Médecins du Maroc

Vidéos hero : Pexels (libres de droits)
Polices : Google Fonts (Manrope, Caveat) — chargées via CDN
