# mc-dev

Portfolio de Manuel Candoli — 17 años, Córdoba, Argentina. Páginas web, tiendas online, sistemas a medida y automatizaciones con IA.

**Trilingüe (ES/EN/PT)** con detección automática del idioma del navegador y switcher manual. El front es **React + Tailwind** (build con Vite); el servidor local es Node puro, sin dependencias.

---

## En Termux (presentación / demo)

En el celu, dentro de Termux:

```bash
pkg install nodejs -y          # si no lo tenés
git clone https://github.com/manuchin/mc-dev.git   # solo la primera vez
cd mc-dev
git pull                       # traer lo último (si ya lo clonaste)
node server.js
```

No hace falta `npm install`: el servidor, los tests y `dist/` (el sitio ya compilado) están versionados.

Abrí el navegador del celu en **http://localhost:4173** — listo. El sitio entero corre desde tu Android.

**Bandeja de mensajes** (solo vos la ves, corre en tu máquina):

```
http://localhost:4173/bandeja
```

Cuando alguien deja un mensaje en el formulario ("Guardar sin WhatsApp"), aparece ahí y queda guardado en `data/feedback.json` — la base de datos vive en tu celu. Cada mensaje muestra un botón **RESPONDER POR WHATSAPP / EMAIL** con el contacto que dejó la persona (si no dejó contacto, la bandeja lo marca como perdido). También podés ver el JSON crudo en `http://localhost:4173/api/feedback`.

**Aviso por email (opcional):** si definís `RESEND_API_KEY` (en el Keys/API keys UI o en `.env.local`) y `NOTIFY_EMAIL` (default: `manuelcandoliobregon@gmail.com`), cada mensaje que cae en la bandeja te llega también a tu Gmail — con el contacto para responder en un toque. Sin la key, todo sigue igual y la bandeja es la fuente. Se usa la API REST de Resend con `https` nativo: cero dependencias nuevas, funciona en Termux.

> El botón principal del formulario abre WhatsApp con el mensaje ya escrito. El botón secundario guarda en la bandeja local (útil si el visitante no usa WhatsApp).

## Deploy a internet

El hosting corre: `npm install` + `vite build` → `dist/`. En producción el sitio queda idéntico (trilingüe incluido). La bandeja `/bandeja` y la API de guardado son **solo locales** (Termux): en producción, el botón "Guardar sin WhatsApp" avisa amablemente y redirige a WhatsApp/Instagram.

## Testing

```bash
node scripts/test.js
```

Checks (69 en total): sintaxis, contenido, paridad de claves i18n (es/en/pt), build con Vite, y un servidor real efímero que prueba health, estáticos, POST con límite de frecuencia, XSS, acceso solo-localhost, 404, path traversal, byte nulo y que `data/`, `server.js`, `.env` y `scripts/` **nunca** se sirvan como archivos estáticos.

## Estructura

```
index.html          # shell de React (Vite)
src/                # secciones, i18n ES/EN/PT, componentes ui
server.js           # servidor estático + API /api/feedback (cero dependencias)
vite.config.mjs     # build para hosting (emite dist/)
dist/               # sitio compilado, versionado para Termux (git pull + node server.js)
public/robots.txt   # copiado a dist/ por Vite
scripts/test.js     # suite de tests sin dependencias
data/feedback.json  # base de datos local de mensajes (git-ignored)
```

Contacto: manuelcandoliobregon@gmail.com · +54 9 351 380 5496 · @manucandoli
