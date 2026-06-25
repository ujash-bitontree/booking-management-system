import { Column } from 'typeorm';

export abstract class AuditColumns {
  @Column({ nullable: true })
  createdBy!: string | null;

  @Column({ nullable: true })
  updatedBy!: string | null;
}
