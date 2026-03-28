# Portfolio

Portfolio personnel construit avec Vite, JavaScript et Three.js.

## Apercu

Ce projet contient :

- un hero avec modele 3D interactif
- une section projets avec mes vrais liens
- une sidebar profil au scroll
- un formulaire de contact prepare pour EmailJS

## Stack

- HTML
- CSS
- JavaScript
- Vite
- Three.js

## Lancer le projet

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

## Deploiement GitHub Pages

Le projet est configure pour GitHub Pages avec :

- `vite.config.js`
- `.github/workflows/deploy.yml`

URL cible :

```text
https://nabbasnabbas6-sys.github.io/portfolio/
```

## Contact form

Le formulaire utilise EmailJS sans backend.

Les cles a renseigner dans `src/main.js` :

- `serviceId`
- `templateId`
- `publicKey`

Email de destination actuel :

```text
nabilbassim0@gmail.com
```
