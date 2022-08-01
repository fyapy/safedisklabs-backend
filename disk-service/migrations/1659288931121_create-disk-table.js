/* eslint-disable unicorn/filename-case */
const { createMigration } = require('aurora-orm/dist/migrator/templates/v1')

module.exports = createMigration({
  async up({ sql }) {
    await sql.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE "disks" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "user_id" int NOT NULL,
        "max_size" BIGINT NOT NULL,
        "used_size" BIGINT NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT (now()),
        "updated_at" timestamp NOT NULL DEFAULT (now())
      );
      ALTER TABLE "disks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
    `)
  },
  async down({ sql }) {
    await sql.query(`
      ALTER TABLE "disks" DROP CONSTRAINT "disks_user_id_fkey";
      DROP TABLE "disks";
    `)
  },
})
