import { execFileSync } from 'node:child_process'

const commands: Array<[string, string[]]> = [
  ['npm', ['run', 'type-check']],
  ['npm', ['test', '--', '--runInBand']],
  ['npm', ['run', 'test:cms-sanitization']],
  ['npm', ['run', 'test:ckeditor-runtime']],
]

for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`)
  execFileSync(command, args, { stdio: 'inherit', env: process.env })
}

console.log('\nAll configured test gates passed')
