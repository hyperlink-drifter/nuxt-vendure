import { MigrationInterface, QueryRunner } from 'typeorm';

export class KeycrmPlugin1744742038542 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "customFieldsKeycrm" jsonb`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "customFieldsKeycrm" jsonb`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "customFieldsKeycrm"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "customFieldsKeycrm"`,
      undefined
    );
  }
}
