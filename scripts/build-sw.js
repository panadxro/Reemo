import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

// Leer el archivo plantilla
const templatePath = path.resolve('public/firebase-messaging-sw.template.js');
const outputPath = path.resolve('public/firebase-messaging-sw.js');

let swCode = fs.readFileSync(templatePath, 'utf8');

// Reemplazar los placeholders con valores reales
swCode = swCode
  .replace('__VITE_FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY)
  .replace('__VITE_FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN)
  .replace('__VITE_FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID)
  .replace('__VITE_FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET)
  .replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replace('__VITE_FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID);

// Escribir el archivo final
fs.writeFileSync(outputPath, swCode);
console.log('✅ firebase-messaging-sw.js generado correctamente');