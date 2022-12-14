/* eslint-disable unicorn/filename-case */
const { createMigration } = require('aurora-orm/dist/migrator/templates/v1')

module.exports = createMigration({
  async up({ sql }) {
    await sql.query(`
      CREATE TYPE file_type AS ENUM ('file', 'folder');
      CREATE TABLE "files" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "type" file_type NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "user_id" int NOT NULL,
        "disk_id" uuid NOT NULL,
        "folder_id" uuid,
        "hidden" BOOL DEFAULT false,
        "starred" BOOL DEFAULT false,
        "shared" BOOL DEFAULT false,
        "bin" BOOL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT (now()),
        "updated_at" timestamp NOT NULL DEFAULT (now())
      );
      CREATE TABLE "metas" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "file_id" uuid NOT NULL,
        "size" BIGINT NOT NULL,
        "ext" VARCHAR(255),
        "mime" VARCHAR(255)
      );
      CREATE INDEX "idx_files_folder_id" ON "files" ("folder_id");
      CREATE INDEX "idx_files_hidden" ON "files" ("hidden");
      CREATE INDEX "idx_files_starred" ON "files" ("starred");
      CREATE INDEX "idx_files_bin" ON "files" ("bin");
      ALTER TABLE "files" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
      ALTER TABLE "files" ADD FOREIGN KEY ("disk_id") REFERENCES "disks" ("id");
      ALTER TABLE "metas" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");
    `)
  },
  async down({ sql }) {
    await sql.query(`
      DROP INDEX "idx_files_folder_id";
      DROP INDEX "idx_files_hidden";
      DROP INDEX "idx_files_starred";
      DROP INDEX "idx_files_bin";
      ALTER TABLE "files" DROP CONSTRAINT "files_user_id_fkey";
      ALTER TABLE "files" DROP CONSTRAINT "files_disk_id_fkey";
      ALTER TABLE "metas" DROP CONSTRAINT "metas_file_id_fkey";
      DROP TABLE "files";
      DROP TABLE "metas";
      DROP TYPE file_type;
    `)
  },
})
