import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterUserRequestDto } from './dto/register-user-request.dto';
import { LoginUserRequestDto } from './dto/login-user-request.dto';
import { ClientKafka } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('KAFKA_AUTH') private readonly kafkaClient: ClientKafka,
  ) {}
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async registerUser(@Body() userData: RegisterUserRequestDto) {
    console.log('Sending Kafka event:', userData);
    this.kafkaClient.emit('user_registered', userData);
    return { message: 'User registration event sent' };
  }
  @Post('login')
  @ApiOperation({ summary: 'login the user service' })
  async loginUser(@Body() userData: LoginUserRequestDto) {
    console.log('Sending Kafka event:', userData);
    this.kafkaClient.emit('user_login', userData);
    return { message: 'User login event sent' };
  }
}
