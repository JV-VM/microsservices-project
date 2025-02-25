import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import kafkaMiddleware from './session.middleware';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_AUTH',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'gateway',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'gateway-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [], 
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(kafkaMiddleware).forRoutes('*');
  }
}
