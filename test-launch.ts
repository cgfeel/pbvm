import { spawn } from 'child_process'
import puppeteer from 'puppeteer-core'

const CHROME =
  '/Users/liwei/Library/Caches/pbvm-nodejs/chrome/mac-114.0.5734.0/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'

async function test(label: string, args: string[]) {
  console.log(`=== ${label} ===`)
  const chrome = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] })

  let wsEndpoint = ''
  const timeout = setTimeout(() => {
    chrome.kill()
    console.log('WS TIMEOUT')
  }, 5000)

  for await (const chunk of chrome.stderr) {
    const text = chunk.toString()
    const m = text.match(/DevTools listening on (ws:\/\/[^\s]+)/)
    if (m) {
      wsEndpoint = m[1]
      clearTimeout(timeout)
      break
    }
  }
  if (!wsEndpoint) return

  try {
    const b = await puppeteer.connect({ browserWSEndpoint: wsEndpoint, timeout: 5000 })
    console.log('connect: OK')

    console.log('newPage...')
    const page = await b.newPage()
    console.log('newPage:', page.url())

    const ua = await page.evaluate(() => navigator.userAgent)
    console.log('evaluate: OK, UA:', ua.slice(0, 40))

    await b.close()
    console.log('ALL OK\n')
  } catch (e) {
    console.error('FAIL:', e.message.slice(0, 120), '\n')
    chrome.kill()
  }
}

await test('new headless, NO about:blank', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=/tmp/pbvm-t8',
  '--remote-debugging-port=0',
])

await test('old headless, NO about:blank', [
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--user-data-dir=/tmp/pbvm-t9',
  '--remote-debugging-port=0',
])
