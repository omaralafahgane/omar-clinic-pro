import { NextRequest, NextResponse } from 'next/server';
import { stytchClient as client } from '@/lib/stytch';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const stytch_token_type = searchParams.get('stytch_token_type');

  if (!token || !stytch_token_type) {
    return NextResponse.redirect(new URL('/auth-error', request.url));
  }

  try {
    if (stytch_token_type === 'magic_links') {
      const response = await client.magicLinks.authenticate({
        token,
        session_duration_minutes: 60 * 24 * 7, // 1 week
      });

      // Here you would typically sync with Supabase
      // const { session_token, session_jwt } = response;
      
      return NextResponse.redirect(new URL('/dashboard/clinic', request.url));
    }

    if (stytch_token_type === 'oauth') {
        const response = await client.oauth.authenticate({
          token,
          session_duration_minutes: 60 * 24 * 7,
        });
        return NextResponse.redirect(new URL('/dashboard/clinic', request.url));
    }

    return NextResponse.redirect(new URL('/auth-error', request.url));
  } catch (error) {
    console.error('Stytch Auth Error:', error);
    return NextResponse.redirect(new URL('/auth-error', request.url));
  }
}
