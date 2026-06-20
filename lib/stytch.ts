import * as stytch from 'stytch';

const projectId = process.env.STYTCH_PROJECT_ID;
const secret = process.env.STYTCH_SECRET;

export const stytchClient = (projectId && secret) 
  ? new stytch.Client({
      project_id: projectId,
      secret: secret,
      env: process.env.STYTCH_PROJECT_ENV === 'live' ? stytch.envs.live : stytch.envs.test,
    })
  : null as unknown as stytch.Client;

// Helper to sync Stytch user with Supabase
export const syncStytchUser = async (stytchUserId: string, email: string) => {
  // This logic will be used to ensure Stytch users are reflected in our Supabase database
  return { stytchUserId, email };
};
