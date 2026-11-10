import test from 'node:test';import assert from 'node:assert/strict';
import {equal,validId,cleanText,token} from '../src/security.mjs';
import {validatePanel} from '../src/panels.mjs';
test('constant-time equality handles unequal lengths',()=>{assert.equal(equal('abc','abc'),true);assert.equal(equal('abc','abcd'),false);});
test('tokens are unique and sufficiently long',()=>{assert.notEqual(token(),token());assert.equal(token().length,64);});
test('snowflake validation',()=>{assert.equal(validId('123456789012345678'),true);assert.equal(validId('bad'),false);});
test('panel validation rejects bad input',()=>{assert.throws(()=>validatePanel({channelId:'bad',title:'A',description:'B'}));});
test('panel input is length-limited',()=>{const p=validatePanel({channelId:'123456789012345678',title:'x'.repeat(500),description:'y'});assert.equal(p.title.length,120);});
test('text normalizes non-string',()=>assert.equal(cleanText(null),''));
