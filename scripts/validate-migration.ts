import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const rootMigrations = join(root, 'migrations')
const prismaMigrations = join(root, 'prisma', 'migrations')
const lockFile = join(rootMigrations, 'migration_lock.toml')

if (!existsSync(rootMigrations) || !existsSync(lockFile)) {
  throw new Error('Migration directory or lock file is missing')
}

if (existsSync(prismaMigrations)) {
  throw new Error('Multiple migration directories detected; reconcile them before deployment')
}

const lock = readFileSync(lockFile, 'utf8')
if (!lock.includes('provider = "postgresql"')) {
  throw new Error('Migration provider is not PostgreSQL; reconcile the lock file before deployment')
}

console.log('Migration layout is single-source and PostgreSQL-compatible')
