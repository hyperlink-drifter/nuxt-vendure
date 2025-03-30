import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCustomFields1743359307165 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsKeycrmid" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsKeycrmid"`, undefined);
   }

}
