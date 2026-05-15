import { buildApp } from '../src/app.js';

let appPromise;

async function getApp() {
  if (!appPromise) {
    const app = buildApp({
      logger: false,
    });
    appPromise = app.ready().then(() => app);
  }

  return appPromise;
}

export default async function handler(request, response) {
  const app = await getApp();
  app.server.emit('request', request, response);
}
