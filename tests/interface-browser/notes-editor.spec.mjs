import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
const origin=process.env.MINAMO_INTERFACE_URL;
if(!origin)throw Error('Use the explicit local Interface Foundry browser runner.');
const text='TEST ONLY long rich writing — A😀é remains exact across Classic Focus Task. 012345678901234567890123456789012345678901234567890123456789.';

test('long first rich edit, formatting and mode changes retain one writer and exact acknowledged Note',async({page})=>{
 const failures=[];page.on('pageerror',error=>failures.push(error.message));
 await page.setViewportSize({width:1280,height:844});
 await page.goto(origin+'/preview-interface/workspace?view=tools&family=experiment&id=TEST-ONLY-interface-debug');
 await expect(page.getByRole('region',{name:'Activity Studio',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Task',exact:true}).click();
 await page.getByRole('button',{name:'Open Notes',exact:true}).click();
 const panel=page.locator('.nw-workspace'),editor=page.getByRole('textbox',{name:'Note rich writing editor',exact:true});
 await expect(panel).toBeVisible();await expect(editor).toBeVisible();
 await panel.evaluate(element=>element.setAttribute('data-note-owner-proof','original-long-input-writer'));
 // A short edit does not exercise the reported React depth threshold. More
 // than fifty external editor transactions in succession is the regression.
 await editor.pressSequentially(text);await expect(editor).toHaveText(text);
 await expect(page.getByText('Unhandled Script Error',{exact:true})).toHaveCount(0);
 for(const mode of ['Classic','Focus','Task']){await page.getByRole('button',{name:mode,exact:true}).click();await expect(editor).toHaveText(text);await expect(panel).toHaveAttribute('data-note-owner-proof','original-long-input-writer');}
 await editor.press('Control+End');await editor.press('Shift+Home');await page.getByRole('button',{name:'Bold (Ctrl/⌘ B)',exact:true}).click();
 await expect(page.getByRole('button',{name:'Bold (Ctrl/⌘ B)',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(editor).toHaveText(text);
 await page.getByText('Insert & more',{exact:true}).click();await page.getByRole('button',{name:'Edit original source',exact:true}).click();await expect(page.getByRole('textbox',{name:'Note writing; original source',exact:true})).toHaveValue(text);
 await page.getByRole('button',{name:'Return to formatted writing',exact:true}).click();await expect(editor).toHaveText(text);
 await expect(panel.locator('output')).toHaveText(/^Saved$/);
 const title='TEST ONLY Notes long-edit regression '+randomUUID();
 await panel.locator('button[aria-label^="Rename "]').click();await page.getByRole('textbox',{name:'Rename Note',exact:true}).fill(title);await page.getByRole('textbox',{name:'Rename Note',exact:true}).press('Enter');
 await expect(panel.locator('output')).toHaveText(/^Saved$/);
 const saved=await page.request.get(origin+'/preview-interface/api?path='+encodeURIComponent('/api/query?'+new URLSearchParams({family:'note',q:title,limit:'40'})));
 expect(saved.ok()).toBeTruthy();const result=await saved.json();const persisted=result.records.find(record=>record.title===title);expect(persisted).toBeTruthy();expect(persisted.body).toBe(text);expect(persisted.rev).toBeGreaterThan(0);
 expect(failures).toEqual([]);
});

test('phone rich writing survives minimise/reopen and reduced keyboard height',async({page})=>{
 const failures=[];page.on('pageerror',error=>failures.push(error.message));
 await page.setViewportSize({width:390,height:420});await page.goto(origin+'/preview-interface/workspace?view=tools&family=experiment&id=TEST-ONLY-interface-debug');
 await page.getByRole('button',{name:'Open Notes',exact:true}).click();const panel=page.getByRole('dialog',{name:'Notes writing workspace',exact:true}),editor=page.getByRole('textbox',{name:'Note rich writing editor',exact:true});
 await expect(panel).toBeVisible();await editor.pressSequentially(text);await expect(editor).toHaveText(text);
 await page.getByRole('button',{name:'Minimise Notes',exact:true}).click();await expect(panel).toBeHidden();await page.getByRole('button',{name:'Restore Notes',exact:true}).click();await expect(editor).toHaveText(text);
 await expect(page.getByRole('button',{name:'Minimise Notes',exact:true})).toBeVisible();await page.getByText('Insert & more',{exact:true}).click();await expect(page.getByRole('button',{name:'Insert private image or screenshot',exact:true})).toBeVisible();expect(failures).toEqual([]);
});

test('first save keeps rich caret after a trailing space and following typing appends',async({page})=>{
 await page.setViewportSize({width:1280,height:844});
 await page.goto(origin+'/preview-interface/workspace?view=tools&family=experiment&id=TEST-ONLY-interface-debug');
 await page.getByRole('button',{name:'Open Notes',exact:true}).click();
 const panel=page.locator('.nw-workspace'),editor=page.getByRole('textbox',{name:'Note rich writing editor',exact:true});
 const text='TEST ONLY first-save caret ';
 await editor.pressSequentially(text);await expect(editor).toHaveText(text);
 await expect(panel.locator('output')).toHaveText(/^Saved$/);
 await expect(page.getByRole('textbox',{name:'Note writing; original source',exact:true})).toHaveCount(0);
 await editor.pressSequentially('NEXT');await expect(editor).toHaveText(text+'NEXT');
});
