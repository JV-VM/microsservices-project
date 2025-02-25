import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RegisterUserEvent } from './lib/events/register-user.event';
import { LoginUserEvent } from './lib/events/login-user.event';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,) {}

  @EventPattern('user_registered')
  async handleUserCreated(@Payload() registerUserEvent: RegisterUserEvent) {
    return this.appService.handleUserRegister(registerUserEvent);
  }
  
  @EventPattern('user_login')
  async handleUserLogin(@Payload() loginUserEvent: LoginUserEvent) {
    return this.appService.handleUserLogin(loginUserEvent);
  }
}
