# mc-dev

Portfolio de Manuel Candoli — 17 años, Córdoba, Argentina. Páginas web, tiendas online, sistemas a medida y automatizaciones con IA.

**Trilingüe (ES/EN/PT)** con detección automática del idioma del navegador y switcher manual. Tema **claro/oscuro automático** que detecta el modo del sistema. El front es **React + Tailwind** (build con Vite); el servidor local es Node puro, sin dependencias.

---

## Base de datos (la de verdad)

Los mensajes de "Guardar sin WhatsApp" viven en **Convex**, una base de datos real en la nube:

- **Qué guarda:** cada mensaje con nombre, contacto para responder, texto, idioma, página de origen, IP (para el límite de frecuencia) y estado (`respondido` / `pendiente`).
- **Dónde verla:** dashboard `/admin` (ver abajo), o el dashboard de Convex (https://dashboard.convex.dev) si el proyecto está linkeado a una cuenta.
- **Seguridad:** la lectura y las acciones exigen `ADMIN_TOKEN` (clave que solo vos tenés). El público solo puede *guardar* mensajes, con límite de frecuencia y honeypot anti-spam.
- **Respaldo:** en tu máquina (Termux), si Convex no está configurado o no responde, el servidor local guarda en `data/feedback.json` con escritura atómica y tope de 500 mensajes. Es un fallback honesto, no la base principal.

## Dashboard /admin (tu bandeja pro)

```
/admin        (en producción: tudominio.com/admin)
```

- Mensajes **en vivo** desde la base de datos (Convex) cuando está conectada.
- Botón **RESPONDER POR WHATSAPP / EMAIL** con el contacto que dejó la persona (si no dejó contacto, lo marca como perdido).
- **Marcar respondido / pendiente**, **borrar**, y **exportar CSV** para planillas.
- Pide tu clave de admin (ADMIN_TOKEN) la primera vez y la recuerda en ese navegador. En modo local lee `data/feedback.json` (solo funciona en tu máquina).
- `noindex`: los buscadores no lo listan.

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

**Bandeja local** (solo vos la ves, corre en tu máquina): `http://localhost:4173/bandeja` (simple, HTML) o `http://localhost:4173/admin` (completa, con responder/marcar/borrar/CSV). Sin Convex configurado, `/admin` muestra el modo local y lo dice en la cara — nada de chamuyo.

**Aviso por email (opcional):** si definís `RESEND_API_KEY` (en el Keys/API keys UI o en `.env.local`) y `NOTIFY_EMAIL` (default: `manuelcandoliobregon@gmail.com`), cada mensaje que cae en la bandeja te llega también a tu Gmail — con el contacto para responder en un toque. Sin la key, todo sigue igual y la bandeja es la fuente. Se usa la API REST de Resend con `https` nativo: cero dependencias nuevas, funciona en Termux.

> El botón principal del formulario abre WhatsApp con el mensaje ya escrito. El botón secundario guarda en la base de datos (útil si el visitante no usa WhatsApp).

## Deploy a internet

El hosting corre: `npm install` + `vite build` → `dist/` (incluye `admin.html`). El sitio queda idéntico (trilingüe + tema claro/oscuro). En producción, "Guardar sin WhatsApp" escribe en la base de datos Convex configurada vía `VITE_CONVEX_URL`; si esa env no existe, cae al guardado local del servidor.

## Testing

```bash
node scripts/test.js
```

Checks (96 en total): sintaxis, contenido, paridad de claves i18n (es/en/pt), base de datos Convex (schema, bandeja con clave, guardado unificado con fallback, honeypot, dashboard admin, build con admin.html), build con Vite, y un servidor real efímero que prueba health, estáticos, POST con límite de frecuencia, XSS, acceso solo-localhost, 404, path traversal, byte nulo y que `data/`, `server.js`, `.env` y `scripts/` **nunca** se sirvan como archivos estáticos.

## Estructura

```
index.html          # shell de React (Vite)
admin.html          # dashboard /admin (Vite lo compila aparte)
src/                # secciones, i18n ES/EN/PT, componentes ui
  src/lib/db.jsx    # proveedor de Convex (se degrada si no hay URL)
  src/lib/feedback.js  # guardado único: Convex → local → error honesto
  src/pages/AdminPage.jsx  # bandeja en vivo con clave de admin
convex/             # base de datos real: schema, guardar, leer, acciones
server.js           # servidor estático + /bandeja + /admin (cero dependencias)
vite.config.mjs     # build para hosting (emite dist/ con index y admin)
dist/               # sitio compilado, versionado para Termux (git pull + node server.js)
public/robots.txt   # copiado a dist/ por Vite
scripts/test.js     # suite de tests sin dependencias
data/feedback.json  # respaldo local de mensajes (git-ignored)
```

Contacto: manuelcandoliobregon@gmail.com · +54 9 351 380 5496 · @manucandoli
