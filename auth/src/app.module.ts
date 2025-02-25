import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PrismaService } from './lib/database/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_AUTH',
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
      },
    ]),JwtModule.register({
      secret: '',
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
