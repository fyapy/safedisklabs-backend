/* eslint-disable unicorn/filename-case */
const { createMigration } = require('aurora-orm/dist/migrator/templates/v1')

module.exports = createMigration({
  async up({ sql }) {
    await sql.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" varchar UNIQUE NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "hash" varchar NOT NULL,
        "blocked_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT (now()),
        "updated_at" timestamp NOT NULL DEFAULT (now())
      )
    `)
  },
  async down({ sql }) {
    await sql.query('DROP TABLE "users"')
  },
})
