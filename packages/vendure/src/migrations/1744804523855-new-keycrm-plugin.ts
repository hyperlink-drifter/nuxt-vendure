import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewKeycrmPlugin1744804523855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "customFieldsKeycrm_id" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "customFieldsKeycrm_created_at" TIMESTAMP(6)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "customFieldsKeycrm_updated_at" TIMESTAMP(6)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "customFieldsKeycrm_id" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "customFieldsKeycrm_product_id" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "customFieldsKeycrm_created_at" TIMESTAMP(6)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD "customFieldsKeycrm_updated_at" TIMESTAMP(6)`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "customFieldsKeycrm_updated_at"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "customFieldsKeycrm_created_at"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "customFieldsKeycrm_product_id"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP COLUMN "customFieldsKeycrm_id"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "customFieldsKeycrm_updated_at"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "customFieldsKeycrm_created_at"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "customFieldsKeycrm_id"`,
      undefined
    );
  }
}
