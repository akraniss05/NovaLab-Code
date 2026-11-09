import {test} from 'node:test';
import assert from 'node:assert/strict';

test('OAuth starts with PKCE, invalid callbacks are rejected and protected API requires a session',async()=>{
 Object.assign(process.env,{PUBLIC_URL:'https://control.example.com',DISCORD_CLIENT_ID:'123456789012345678',DISCORD_CLIENT_SECRET:'test',DISCORD_TOKEN:'test',DATABASE_URL:process.env.DATABASE_URL||'postgresql://test@localhost/test'});
 const {app}=await import('../apps/api/index.ts');
 try{
  const start=await app.inject('/auth/discord?next=%2Fsupport%3Fguild%3D123456789012345678');
  assert.equal(start.statusCode,302);
  const discord=new URL(String(start.headers.location));
  assert.equal(discord.origin,'https://discord.com');
  assert.equal(discord.searchParams.get('code_challenge_method'),'S256');
  assert.equal(discord.searchParams.get('redirect_uri'),'https://control.example.com/auth/callback');
  assert.match(String(start.headers['set-cookie']),/__Host-nl_state=.*;.*HttpOnly.*Secure/i);
  const callback=await app.inject('/auth/callback?code=test&state=bad');
  assert.equal(callback.statusCode,403);
  assert.equal((await app.inject('/api/guild/123456789012345678/support')).statusCode,401);
  assert.equal((await app.inject({method:'POST',url:'/api/logout',headers:{origin:'https://other.example.com'},payload:{}})).statusCode,403);
 }finally{await app.close();}
});
