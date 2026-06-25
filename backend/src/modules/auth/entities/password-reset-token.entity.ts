import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityModel } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'password_reset_tokens' })
@Index(['tokenHash'], { unique: true })
export class PasswordResetToken extends BaseEntityModel {
  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt!: Date | null;
}
