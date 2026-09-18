const path = require('path');
require('tsconfig-paths').register({
  extensions: ['.ts', '.js']
});

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: true,
      credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log('🚀 KisanProcure Backend running on http://localhost:' + port);
    console.log('📚 API Documentation: http://localhost:' + port + '/docs');
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();