import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
  env: process.env.STYTCH_PROJECT_ENV === 'live' ? stytch.envs.live : stytch.envs.test,
});

export const stytchClient = client;

// Helper to sync Stytch user with Supabase
export const syncStytchUser = async (stytchUserId: string, email: string) => {
  // This logic will be used to ensure Stytch users are reflected in our Supabase database
  return { stytchUserId, email };
};
