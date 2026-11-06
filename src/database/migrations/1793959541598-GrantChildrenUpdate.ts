import { MigrationInterface, QueryRunner } from 'typeorm';

export class GrantChildrenUpdate1793959541598 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    GRANT UPDATE
    ON TABLE "public"."children"
    TO "speech_care_app"
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    REVOKE UPDATE
    ON TABLE "public"."children"
    FROM "speech_care_app"
  `);
  }
}
