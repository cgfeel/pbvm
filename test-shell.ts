import { spawn } from 'child_process'

const CHROME =
  '/Users/liwei/Library/Caches/pbvm-nodejs/chrome/mac-114.0.5734.0/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const tmpDir = `/tmp/pbvm-test-${Date.now()}`

async function test(label: string, args: string[]) {
  const p = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] })
  let found = false
  const t = setTimeout(() => {}, 4000)
  for await (const chunk of p.stderr) {
    const text = chunk.toString()
    if (text.includes('DevTools listening')) {
      found = true
      clearTimeout(t)
      break
    }
  }
  console.log(`${label}: ws ${found ? 'OK' : 'NO'}`)
  p.kill()
}

await test('no flags', [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=0',
  'about:blank',
])
await test('+ no-sandbox', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=0',
  'about:blank',
])
await test('+ user-data-dir', [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=0',
  `--user-data-dir=${tmpDir}`,
  'about:blank',
])
await test('+ both', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=0',
  `--user-data-dir=${tmpDir}`,
  'about:blank',
])
console.log('DONE')
