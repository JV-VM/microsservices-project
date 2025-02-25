import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from './lib/database/prisma.service';
import { RegisterUserEvent } from './lib/events/register-user.event';
import { LoginUserEvent } from './lib/events/login-user.event';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async validateUser(loginUserEvent: LoginUserEvent): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserEvent.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(loginUserEvent.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, email: user.email };
  }

  async handleUserRegister(registerUserEvent: RegisterUserEvent) {
    console.log('Received Kafka Event:', registerUserEvent);

    if (!registerUserEvent) {
      return { message: 'Invalid event data' };
    }

    // Verifica se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerUserEvent.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Cria o usuário
    const hashedPassword = await this.hashPassword(registerUserEvent.password);
    const user = await this.prisma.user.create({
      data: {
        name: registerUserEvent.username,
        email: registerUserEvent.email,
        password: hashedPassword,
      },
    });

    console.log('User registered:', user.email);

    // Remove sessões anteriores (caso existam)
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Criação da sessão
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        data: sessionToken,
        expiresAt,
      },
    });

    console.log('New session created for:', user.email);

    return {
      message: 'User registered successfully',
      sessionId: sessionToken,
    };
  }

  async handleUserLogin(loginUserEvent: LoginUserEvent) {
    const user = await this.validateUser(loginUserEvent);

    // Remove sessões anteriores
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Criação da sessão
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        data: sessionToken,
        expiresAt,
      },
    });

    console.log('User logged in:', user.email);

    return { message: 'User logged in successfully', sessionId: sessionToken };
  }

  async validateSession(sessionId: string) {
    console.log('Checking session:', sessionId);
  
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId }, // Ensure it's correctly looking for the ID
    });
  
    if (!session) {
      console.log('Session not found in DB');
      throw new UnauthorizedException('No active session found');
    }
  
    if (new Date() > new Date(session.expiresAt)) {
      console.log('Session expired');
      throw new UnauthorizedException('Session expired');
    }
  
    console.log('Session is valid');
    return true;
  }
  
}
