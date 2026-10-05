import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1791200570249 implements MigrationInterface {
  name = 'CreateUsers1791200570249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying(255) NOT NULL, "passwordHash" text NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "avatarUrl" text, "birthday" date, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "CHK_users_email_canonical" CHECK ("email" = lower(btrim("email"))), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(`
      GRANT SELECT, INSERT
      ON TABLE "public"."users"
      TO "speech_care_app"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
