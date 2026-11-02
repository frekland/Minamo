import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';

const origin=process.env.MINAMO_INTERFACE_URL;
if(!origin)throw Error('Run only against the explicit local Interface Foundry preview.');
const root=origin+'/preview-interface/workspace?workspace=context&view=home';

test('context Home writes a projectless canonical Note through the one shared editor and returns to the same context route',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1280,height:844});await page.goto(root);
 const host=page.locator('[data-working-context="v1"]');await expect(host).toBeVisible();
 await expect(page.getByRole('heading',{name:'What would you like to work on?'})).toBeVisible();
 await expect(page.locator('.nw-workspace')).toHaveCount(1);
 await host.getByRole('button',{name:'Start writing a Note'}).click();
 const editor=page.getByRole('textbox',{name:'Note rich writing editor',exact:true});await expect(editor).toBeVisible();
 const title='TEST ONLY contextual capture '+randomUUID(),body='An independent question. 今日は 日本語 😀';
 await page.getByRole('textbox',{name:'Note title',exact:true}).fill(title);await editor.pressSequentially(body);
 await expect(page.locator('.nw-workspace output')).toHaveText('Saved');
 const response=await page.request.get(origin+'/preview-interface/api?path='+encodeURIComponent('/api/query?'+new URLSearchParams({family:'note',q:title,limit:'40'})));
 expect(response.ok()).toBeTruthy();const records=(await response.json()).records;
 const saved=records.find(record=>record.title===title);expect(saved).toBeTruthy();expect(saved.body).toBe(body);expect(saved.links).toEqual([]);
 await page.getByRole('button',{name:'Hide Notes'}).click();
 await host.getByRole('link',{name:/Read.*Library sources/}).click();
 await expect(page).toHaveURL(/workspace=context/);await expect(page).toHaveURL(/view=library/);
 await page.getByRole('button',{name:'Use classic workspace'}).click();
 await expect(page).not.toHaveURL(/workspace=context/);
 await page.getByRole('button',{name:'Try contextual workspace'}).click();
 await expect(page).toHaveURL(/workspace=context/);
 await expect(page.locator('.nw-workspace')).toHaveCount(1);
 expect(errors).toEqual([]);
});

test('exact Article and mobile Notes remain separate primary surfaces with source history on demand',async({page})=>{
 await page.setViewportSize({width:390,height:520});
 await page.goto(root+'&view=library&family=article&id=TEST-ONLY-interface-reading');
 const host=page.locator('[data-working-context="v1"]');await expect(host).toBeVisible();
 await expect(host.getByText('CURRENT MATERIAL')).toBeVisible();
 await expect(page.locator('[data-reading-part="japanese"]').first()).toContainText('今日');
 await expect(page.locator('.nw-workspace')).toHaveCount(1);
 const connections=host.getByRole('button',{name:'Connections & history'});await expect(connections).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#wc-context-panel')).toBeHidden();await connections.click();await expect(connections).toHaveAttribute('aria-expanded','true');
 const history=host.getByRole('button',{name:'Browse recorded history'});await expect(history).toHaveAttribute('aria-expanded','false');await history.click();await expect(host).toHaveAttribute('data-history-open','true');
 await host.getByRole('button',{name:'Blank Note'}).click();
 const sheet=page.getByRole('dialog',{name:'Notes writing workspace'});await expect(sheet).toBeVisible();
 await expect(sheet.getByText('Standalone Note')).toBeVisible();
 const editor=page.getByRole('textbox',{name:'Note rich writing editor',exact:true});await editor.pressSequentially('今日も検証中 😀');
 await page.getByRole('button',{name:'Minimise Notes'}).click();await expect(sheet).toBeHidden();
 await page.getByRole('button',{name:'Restore Notes'}).click();await expect(editor).toContainText('今日も検証中 😀');
});

test('global search native Library route, reload and browser history preserve the deliberate contextual opt-in',async({page})=>{
 await page.setViewportSize({width:1280,height:800});await page.goto(root);
 await page.getByRole('button',{name:'Open search'}).click();
 await page.getByRole('searchbox',{name:'Search in this learning space'}).fill('Python sockets');
 const modal=page.getByRole('dialog',{name:'Search'});
 const links=modal.getByRole('link',{name:/Search.*in the Library|Search the Library|See more Library matches/});
 await expect(links.first()).toBeVisible();
 const native=await links.first().getAttribute('href');
 expect(new URL(native,origin).searchParams.get('workspace')).toBe('context');
 await links.first().click();
 await expect(page).toHaveURL(/workspace=context/);await expect(page).toHaveURL(/libraryFacet=search/);
 await expect(page).toHaveURL(/libraryQuery=Python/);
 await page.reload();await expect(page.getByRole('button',{name:'Use classic workspace'})).toBeVisible();
 await page.goBack();await expect(page).toHaveURL(/workspace=context/);
 await page.goForward();await expect(page).toHaveURL(/workspace=context/);
});
