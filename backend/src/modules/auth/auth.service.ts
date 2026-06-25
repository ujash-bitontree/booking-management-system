import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Role } from '../../common/enums/role.enum';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

type AuthUserResponse = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfilesRepository: Repository<DoctorProfile>,
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      isActive: true
    });

    const savedUser = await this.usersRepository.save(user);

    await this.createProfile(savedUser.id, dto);

    const tokens = await this.issueTokens(savedUser);
    await this.persistRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(savedUser),
      ...tokens
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(user),
      ...tokens
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash, userId: payload.sub }
    }as any);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(user),
      ...tokens
    };
  }

  async logout(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash }
    });

    if (storedToken && !storedToken.revokedAt) {
      storedToken.revokedAt = new Date();
      await this.refreshTokensRepository.save(storedToken);
    }

    return { message: 'logged out' };
  }

  async getMe(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });

    if (!user || !user.isActive) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    const resetToken = this.passwordResetTokensRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null
    }as any);

    await this.passwordResetTokensRepository.save(resetToken);

    return {
      message: 'If the email exists, a reset link will be sent',
      resetToken: rawToken
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const storedToken = await this.passwordResetTokensRepository.findOne({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset token is not valid');
    }

    const user = await this.usersRepository.findOne({
      where: { id: storedToken.userId }
    }as any);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Reset token is not valid');
    }

    user.passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersRepository.save(user);

    storedToken.usedAt = new Date();
    await this.passwordResetTokensRepository.save(storedToken);

    await this.refreshTokensRepository.update(
      { userId: user.id, revokedAt: null } as any,
      { revokedAt: new Date() }
    )

    return { message: 'password reset successful' };
  }

  private async createProfile(userId: string, dto: RegisterDto): Promise<void> {
    if (dto.role === Role.DOCTOR) {
      const profile = this.doctorProfilesRepository.create({
        userId,
        fullName: dto.fullName,
        specialization: null,
        bio: null,
        experienceYears: null,
        consultationFeeCents: 5000,
        currency: this.configService.get<string>('stripe.currency') ?? 'usd'
      } as any);
      await this.doctorProfilesRepository.save(profile);
      return;
    }

    if (dto.role === Role.PATIENT) {
      const profile = this.patientProfilesRepository.create({
        userId,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber ?? null
      }as any);
      await this.patientProfilesRepository.save(profile);
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn')
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verifyAsync<{ sub: string; email: string; role: Role }>(refreshToken, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret')
    });
  }

  private async persistRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.getRefreshTtlMillis());
    const token = this.refreshTokensRepository.create({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
      revokedAt: null,
      userAgent: null,
      ipAddress: null
    }as any);

    await this.refreshTokensRepository.save(token);
  }

  private getRefreshTtlMillis(): number {
    const ttl = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    if (ttl.endsWith('d')) {
      return Number.parseInt(ttl, 10) * 24 * 60 * 60 * 1000;
    }
    if (ttl.endsWith('h')) {
      return Number.parseInt(ttl, 10) * 60 * 60 * 1000;
    }
    if (ttl.endsWith('m')) {
      return Number.parseInt(ttl, 10) * 60 * 1000;
    }
    if (ttl.endsWith('s')) {
      return Number.parseInt(ttl, 10) * 1000;
    }

    return 7 * 24 * 60 * 60 * 1000;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private toSafeUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
  }
}
