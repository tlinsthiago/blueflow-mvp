export async function healthRoutes(app) {
  app.get('/health', async () => {
    return {
      data: {
        status: 'ok',
        service: 'blueflow-backend',
        timestamp: new Date().toISOString(),
      },
      meta: {},
      errors: [],
    };
  });
}
