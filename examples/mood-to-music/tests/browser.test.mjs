import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';

test('five runnable React source revisions: narrow browser, fault and recovery, personal label',async()=>{
  const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.mjs',import.meta.url)),server:{host:'127.0.0.1',port:0}});
  let browser;
  try{
    await server.listen();
    const base=server.resolvedUrls.local[0];
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage({viewport:{width:375,height:812}});
    for(const revision of ['v1','v2','v3','v4','v5']){
      await page.goto(base+'?revision='+revision);
      assert.match(await page.locator('h1').innerText(),/Mood-to-Music/);
      assert.equal(await page.locator('nav a[aria-current="page"]').innerText(),revision);
      assert.equal(await page.locator('html').evaluate(node=>node.scrollWidth<=node.clientWidth),true,'no horizontal overflow at phone width');
    }
    await page.goto(base+'?revision=v3');
    await page.getByRole('button',{name:'calm'}).click();
    await page.getByRole('button',{name:'energetic'}).click();
    await page.waitForTimeout(650);
    assert.equal(await page.getByRole('button',{name:'energetic'}).getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('.cards').innerText(),/Harbour at Dawn/,'v3 known fault displayed stale calm cards');
    await page.goto(base+'?revision=v4');
    await page.getByRole('button',{name:'calm'}).click();
    await page.getByRole('button',{name:'energetic'}).click();
    await page.waitForTimeout(650);
    assert.doesNotMatch(await page.locator('.cards').innerText(),/Harbour at Dawn/,'v4 ignores stale calm result');
    assert.match(await page.locator('.cards').innerText(),/Copper Sparks/);
    await page.goto(base+'?revision=v5');
    await page.getByLabel(/A label for/).fill('calming for me');
    await page.getByRole('button',{name:'Add personal label'}).click();
    assert.match(await page.locator('.cards').innerText(),/My labels: calming for me/);
    await page.close();
  }finally{
    await browser?.close();
    await server.close();
  }
});
