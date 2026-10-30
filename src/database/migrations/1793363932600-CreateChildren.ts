import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChildren1793363932600 implements MigrationInterface {
  name = 'CreateChildren1793363932600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "children" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "birthday" date, "diagnosis" text, "speechDifficulties" text array NOT NULL DEFAULT '{}'::text[], "speechDifficultiesDetails" text, "parentName" character varying(100), "parentPhone" character varying(13), "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_8c5a7cbebf2c702830ef38d22b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "children" ADD CONSTRAINT "FK_045e714a8906182cae37c8dab89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      GRANT SELECT, INSERT, DELETE
      ON TABLE "public"."children"
      TO "speech_care_app"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "children" DROP CONSTRAINT "FK_045e714a8906182cae37c8dab89"`,
    );
    await queryRunner.query(`DROP TABLE "children"`);
  }
}
