import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  async onModuleInit() {
    // Idempotent: only insert when there is no user row at all.
    // (Matches your requirement: insert first admin when user table is empty.)
    const usersCount = await this.usersRepository.count();
    if (usersCount > 0) {
      this.logger.log(`Skipping admin seed because users already exist (count=${usersCount})`);
      return;
    }

    const email = this.configService.get<string>('seed.adminEmail') ?? 'admin@gmail.com';
    const password = this.configService.get<string>('seed.adminPassword') ?? 'admin@123';

    const passwordHash = await bcrypt.hash(password, 12);

    await this.usersRepository.save(
      this.usersRepository.create({
        email,
        passwordHash,
        role: Role.ADMIN,
        isActive: true
      })
    );

    this.logger.log(`Seeded initial admin user: ${email}`);
  }
}

