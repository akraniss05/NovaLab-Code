/**
 * LiveryLab Academy — Username login (email-backed Supabase Auth).
 * Made with 💙 from NyxAtheris (LiveryLab Studios)
 *
 * Passwords are checked only through Supabase Auth.
 * Never reveal account email for unauthenticated username lookups.
 * Public login endpoint: verify_jwt=false, credentials are verified here.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const allowedOrigin = Deno.env.get('ACADEMY_ORIGIN') || 'https://akraniss05.github.io';
const allowedOrigins = new Set([allowedOrigin,'https://akraniss05.github.io','https://liverylab-academy.dev']);
const headers: Record<string, string> = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
  'Vary': 'Origin',
  'X-Content-Type-Options': 'nosniff'
};
Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin')||allowedOrigin;
  const corsHeaders = {...headers, 'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:allowedOrigin};
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {status, headers:corsHeaders});
  const denied = () => reply(401, { error: 'Benutzername oder Passwort ist falsch.' });
  if (request.method === 'OPTIONS') return new Response('ok', {status:allowedOrigins.has(origin)?200:403,headers:corsHeaders});
  if (request.method !== 'POST') return reply(405, {error: 'Method not allowed'});
  if (!allowedOrigins.has(origin)) return reply(403, {error: 'Origin not allowed'});
  if (Number(request.headers.get('content-length') || '0') > 3072) return reply(413, {error: 'Request too large'});
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return reply(400, {error: 'Invalid request'}); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400,{error:'Invalid request'});
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-z][a-z0-9_]{2,23}$/.test(username) || password.length < 1 || password.length > 256) return denied();

  const url = Deno.env.get('SUPABASE_URL') || '';
  const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  const secret = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!url || !publicKey || !secret) return reply(503,{error:'Anmeldeservice nicht eingerichtet'});

  try {
    const admin = createClient(url, secret, {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const {data:profile, error:lookupError} = await admin.from('academy_profiles')
      .select('id,active').eq('username',username).maybeSingle();
    if (lookupError) return reply(503,{error:'Anmeldeservice vorübergehend nicht erreichbar'});
    if (!profile || !profile.active) return denied();

    const {data:found, error:userError} = await admin.auth.admin.getUserById(profile.id);
    if (userError || !found.user?.email) return denied();

    const auth = createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const {data,error} = await auth.auth.signInWithPassword({email:found.user.email,password});
    if (error || !data.session || data.user?.id !== profile.id) return denied();
    return reply(200,{
      access_token:data.session.access_token,
      refresh_token:data.session.refresh_token
    });
  } catch {
    return reply(503,{error:'Anmeldeservice vorübergehend nicht erreichbar'});
  }
});
