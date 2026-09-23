# mc-dev

Portfolio de Manuel Candoli — 17 años, Córdoba, Argentina. Páginas web, tiendas online, sistemas a medida y automatizaciones con IA.

**Trilingüe (ES/EN/PT)** con detección automática del idioma del navegador y switcher manual. **Sin dependencias**: un `index.html` autocontenido y un servidor Node puro con bandeja de mensajes.

---

## Mañana (presentación en Termux)

En el celu, dentro de Termux:

```bash
pkg install nodejs -y          # si no lo tenés
git clone https://github.com/manuchin/mc-dev.git   # solo la primera vez
cd mc-dev
git pull                       # traer lo último (si ya lo clonaste)
node server.js
```

Abrí el navegador del celu en **http://localhost:4173** — listo. El sitio entero corre desde tu Android.

**Bandeja de mensajes** (solo vos la ves, corre en tu máquina):

```
http://localhost:4173/bandeja
```

Cuando alguien deja un mensaje en el formulario ("Guardar sin WhatsApp"), aparece ahí y queda guardado en `data/feedback.json` — la base de datos vive en tu celu. También podés ver el JSON crudo en `http://localhost:4173/api/feedback`.

> El botón principal del formulario abre WhatsApp con el mensaje ya escrito. El botón secundario guarda en la bandeja local (útil si el visitante no usa WhatsApp).

## Después (deploy a internet)

El deploy está configurado con Freebuff: install sin deps + `node scripts/build.js` que genera `dist/`. Cuando quieras publicarlo, Deploy desde el panel o `freebuff-deploy start`.

En el deploy público el sitio queda igual (trilingüe incluido). La bandeja `/bandeja` y la API de guardado son **solo locales**: en producción, el botón "Guardar sin WhatsApp" avisa amablemente y redirige a WhatsApp/Instagram.

## Testing

```bash
node scripts/test.js
```

45 checks: sintaxis, contenido, paridad de claves i18n (es/en/pt), build autocontenido, y un servidor real efímero que prueba health, estáticos, POST con límite de frecuencia, XSS, acceso solo-localhost, 404 y path traversal.

## Estructura

```
index.html        # el sitio completo: CSS y JS inline, i18n ES/EN/PT
server.js         # servidor estático + API /api/feedback (cero dependencias)
scripts/build.js  # genera dist/ (deploy estático)
scripts/test.js   # suite de tests sin dependencias
data/feedback.json  # base de datos local de mensajes (git-ignored)
```

Contacto: manuelcandoliobregon@gmail.com · +54 9 351 380 5496 · @manucandoli
