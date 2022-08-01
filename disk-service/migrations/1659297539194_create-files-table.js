/* eslint-disable unicorn/filename-case */
const { createMigration } = require('aurora-orm/dist/migrator/templates/v1')

module.exports = createMigration({
  async up({ sql }) {
    await sql.query(`
      CREATE TABLE "files" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "size" BIGINT NOT NULL,
        "exp" VARCHAR(255),
        "mime" VARCHAR(255),
        "user_id" int NOT NULL,
        "disk_id" uuid NOT NULL,
        "folder_id" uuid INDEX,
        "created_at" timestamp NOT NULL DEFAULT (now()),
        "updated_at" timestamp NOT NULL DEFAULT (now())
      );
      CREATE INDEX "idx_files_folder_id" ON "files" ("folder_id");
      ALTER TABLE "files" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
      ALTER TABLE "files" ADD FOREIGN KEY ("disk_id") REFERENCES "disks" ("id");
    `)
  },
  async down({ sql }) {
    await sql.query(`
      DROP INDEX "idx_files_folder_id";
      ALTER TABLE "files" DROP CONSTRAINT "files_user_id_fkey";
      ALTER TABLE "files" DROP CONSTRAINT "files_disk_id_fkey";
      DROP TABLE "files";
    `)
  },
})