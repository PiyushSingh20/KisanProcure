import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3000;
    const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    app.setGlobalPrefix(apiPrefix);
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: nodeEnv === 'production' ? configService.get('CORS_ORIGIN') : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        disableErrorMessages: nodeEnv === 'production',
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
    const config = new DocumentBuilder()
        .setTitle('KisanProcure API')
        .setDescription('Intelligent Farmer Procurement Management Platform - SIH 2026')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
        .addTag('Auth', 'Authentication and authorization')
        .addTag('Farmers', 'Farmer management')
        .addTag('Centers', 'Procurement center management')
        .addTag('Crops', 'Crop management')
        .addTag('Schedules', 'Schedule and slot management')
        .addTag('Bookings', 'Booking management')
        .addTag('Tokens', 'Token management')
        .addTag('Queue', 'Real-time queue management')
        .addTag('Procurement', 'Procurement processing')
        .addTag('Payments', 'Payment management')
        .addTag('Notifications', 'Notification management')
        .addTag('Complaints', 'Complaint management')
        .addTag('Analytics', 'Analytics and reporting')
        .addTag('Agents', 'AI Agent orchestration')
        .addServer(`http://localhost:${port}/${apiPrefix}`, 'Development')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });
    await app.listen(port);
    console.log(`🚀 KisanProcure Backend running on http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}
bootstrap();
