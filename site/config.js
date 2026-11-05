/*
 * PUBLIC browser configuration only.
 * No passwords, no service_role key, no sb_secret_ API keys.
 * Made with 💙 by NyxAtheris (LiveryLab)
 */
window.LL_CONFIG = {
  supabaseUrl: 'https://ekgxotvvhkmeuxvuwbei.supabase.co',
  supabaseAnonKey: '', // Add ONLY the public sb_publishable_ key after enabling the Supabase project
  adminFunctionName: 'admin-users',
  requireLogin: false // Switch to true ONLY after database, admin user and login are tested
};
