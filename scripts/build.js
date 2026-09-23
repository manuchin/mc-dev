#!/usr/bin/env node
/* Build: copia el sitio autocontenido a dist/ y agrega robots.txt. Sin dependencias. */
"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "dist");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

fs.copyFileSync(path.join(projectRoot, "index.html"), path.join(outDir, "index.html"));
fs.writeFileSync(
  path.join(outDir, "robots.txt"),
  "User-agent: *\nAllow: /\n"
);

console.log("Build listo en dist/ — un solo archivo HTML autocontenido.");
