import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-microservice',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'auth-group',
      },
    },
  });

  await app.listen();
  console.log('Auth Microservice is listening for Kafka events...');
}
bootstrap();
