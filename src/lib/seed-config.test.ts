import { describe, expect, it } from '@jest/globals'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = join(__dirname, '..', '..')

it('does not ship hard-coded bootstrap credentials', () => {
  const seed = readFileSync(join(repoRoot, 'prisma/seed.ts'), 'utf8')
  const setup = readFileSync(join(repoRoot, 'scripts/setup-supabase.js'), 'utf8')

  expect(seed).toContain('process.env.SEED_ADMIN_PASSWORD')
  expect(seed).not.toContain('admin123')
  expect(setup).toContain('process.env.SUPABASE_URL')
  expect(setup).toContain('process.env.SEED_ADMIN_PASSWORD')
  expect(setup).not.toContain('Navsaharan89')
  expect(setup).not.toContain("'$2b$10$hash'")
})
