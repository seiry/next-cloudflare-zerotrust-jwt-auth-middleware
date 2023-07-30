/* eslint-disable no-return-await */
// https://developers.cloudflare.com/pages/platform/functions/plugins/cloudflare-access/差点。。

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { NextMiddlewareResult } from 'next/dist/server/web/types';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const teamDomain = process.env.TEAM_DOMAIN;
const CERTS_URL = `${teamDomain}/cdn-cgi/access/certs`;

const JWKS = createRemoteJWKSet(new URL(CERTS_URL));
const defaultJwtName = 'CF_Authorization';

const errors = {
  noToken: 'no token',
  invalidToken: 'invalid token',
};

// middleware in next doesn't need to return
export async function handleMiddleware(
  request: NextRequest,
  options?: NextJWTAuthMiddlewareOptions | undefined,
  onSuccess?: (token: any) => Promise<NextMiddlewareResult>
) {
  let token = request.cookies?.get?.(options?.tokenName ?? defaultJwtName);

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
    return await onSuccess?.(token);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: errors.invalidToken }), {
      status: 403,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

// https://github.com/nextauthjs/next-auth/blob/c0f9af4c567a905c9d55b732cc0610d44fbae5a6/packages/next-auth/src/next/middleware.ts#L189C1-L210C24

export interface NextJWTAuthMiddlewareOptions {
  tokenName?: string;
}

export interface NextRequestWithJWTAuth extends NextRequest {}

export type NextMiddlewareWithJWTAuth = (
  request: NextRequestWithJWTAuth,
  event: NextFetchEvent
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

export type WithJWTAuthArgs =
  | [NextRequestWithJWTAuth]
  | [NextRequestWithJWTAuth, NextFetchEvent]
  | [NextRequestWithJWTAuth, NextJWTAuthMiddlewareOptions]
  | [NextMiddlewareWithJWTAuth]
  | [NextMiddlewareWithJWTAuth, NextJWTAuthMiddlewareOptions]
  | [NextJWTAuthMiddlewareOptions]
  | [];

export function withJWTAuth(...args: WithJWTAuthArgs) {
  if (!args.length || args[0] instanceof Request) {
    // @ts-expect-error
    return handleMiddleware(...args);
  }

  if (typeof args[0] === 'function') {
    const middleware = args[0];
    const options = args[1] as NextJWTAuthMiddlewareOptions | undefined;
    return async (...nextArgs: Parameters<NextMiddlewareWithJWTAuth>) =>
      await handleMiddleware(
        nextArgs[0],
        options,
        async () =>
          // nextArgs[0].nextauth = { token };
          await middleware(...nextArgs)
      );
  }

  const options = args[0];
  return async (...nextArgs: Parameters<NextMiddleware>) =>
    await handleMiddleware(nextArgs[0], options);
}

export default withJWTAuth;
