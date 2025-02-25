import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { cookieParser } from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API documentation for the microservices')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-session-id', in: 'header' },
      'X-sessionId',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('gateway', app, document);
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: { groupId: 'auth-group' },
    },
  });
  await app.listen(3000);
  console.log('API Gateway is running on http://localhost:3000/gateway');
}
bootstrap();
