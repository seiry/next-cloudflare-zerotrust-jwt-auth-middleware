// https://developers.cloudflare.com/pages/platform/functions/plugins/cloudflare-access/差点。。

import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const teamDomain = process.env.TEAM_DOMAIN;
const CERTS_URL = `${teamDomain}/cdn-cgi/access/certs`;

const JWKS = createRemoteJWKSet(new URL(CERTS_URL));

const errors = {
  noToken: 'no token',
  invalidToken: 'invalid token',
};

// middleware in next doesn't need to return
// eslint-disable-next-line consistent-return
export async function middleware(request: NextRequest) {
  let token = request.cookies.get('CF_Authorization');

  if (process.env.NODE_ENV === 'development') {
    // NextResponse.next();
    token = {
      value: process.env.DEBUG_JWT!,
      name: '',
    };
  }

  if (!token?.value) {
    return new NextResponse(JSON.stringify({ error: errors.noToken }), {
      status: 403,
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  try {
    await jwtVerify(token.value, JWKS);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: errors.invalidToken }), {
      status: 403,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
