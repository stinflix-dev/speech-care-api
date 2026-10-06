import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { AuthSession } from './auth-session.entity.js';

@Entity('authRefreshTokens')
@Unique('UQ_auth_refresh_tokens_tokenHash', ['tokenHash'])
@Index('IDX_auth_refresh_tokens_sessionId', ['sessionId'])
export class AuthRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => AuthSession, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session?: Relation<AuthSession>;

  @Column({
    type: 'varchar',
    length: 64,
    select: false,
  })
  tokenHash: string;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
