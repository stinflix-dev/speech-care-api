import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSessions1791278064708 implements MigrationInterface {
  name = 'CreateAuthSessions1791278064708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "authSessions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f762373005ea0d9b6ccebc33ea5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "authRefreshTokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sessionId" uuid NOT NULL, "tokenHash" character varying(64) NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_auth_refresh_tokens_tokenHash" UNIQUE ("tokenHash"), CONSTRAINT "PK_fe06fc0a020edd92b7a6320caf4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_refresh_tokens_sessionId" ON "authRefreshTokens"  ("sessionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "authSessions" ADD CONSTRAINT "FK_704fcb338a1737dafc9879d3f35" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "authRefreshTokens" ADD CONSTRAINT "FK_9ba89e9d16805a746ded42a5db3" FOREIGN KEY ("sessionId") REFERENCES "authSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      GRANT SELECT, INSERT, UPDATE
      ON TABLE
        "public"."authSessions",
        "public"."authRefreshTokens"
      TO "speech_care_app"
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "authRefreshTokens" DROP CONSTRAINT "FK_9ba89e9d16805a746ded42a5db3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "authSessions" DROP CONSTRAINT "FK_704fcb338a1737dafc9879d3f35"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_auth_refresh_tokens_sessionId"`,
    );
    await queryRunner.query(`DROP TABLE "authRefreshTokens"`);
    await queryRunner.query(`DROP TABLE "authSessions"`);
  }
}
