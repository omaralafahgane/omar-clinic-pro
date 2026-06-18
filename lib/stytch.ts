import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
  env: process.env.STYTCH_PROJECT_ID?.startsWith('project-test-') ? stytch.envs.test : stytch.envs.live,
});

export const stytchClient = client;

// Helper to sync Stytch user with Clerk/Supabase
export const syncStytchUser = async (stytchUserId: string, email: string) => {
  // This logic would typically be called after a successful Stytch authentication
  // to ensure the user exists in our primary database (Supabase)
  return { stytchUserId, email };
};
