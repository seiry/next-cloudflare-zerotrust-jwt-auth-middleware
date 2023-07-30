import { NextMiddleware } from 'next/server';
import { expect, test } from 'vitest';

import withJWTAuth, { NextJWTAuthMiddlewareOptions } from '../src/edge';

test('should return 403 with no cookie', async () => {
  const options = {} satisfies NextJWTAuthMiddlewareOptions;

  const nextUrl: any = {};

  const req: any = { nextUrl, headers: {} };

  const handleMiddleware = withJWTAuth(options) as NextMiddleware;
  const res = await handleMiddleware(req, null as any);
  expect(res).toBeDefined();
  expect(res?.status).toBe(403);
});

// test('should call jwtVerify with cookie', async () => {
//   const options = {} satisfies NextJWTAuthMiddlewareOptions;

//   const nextUrl: any = {};

//   const req: any = {
//     nextUrl,
//     headers: {
//       cookies: 'CF_Authorization=teST',
//     },
//   };

//   // const jose = await vi.importMock<typeof joseModule>('jose');
//   const j = vi.mock('jose');
//   // const jwtVerifyFn = vi.spyOn(jwtVerify);
//   const handleMiddleware = withJWTAuth(options) as NextMiddleware;
//   const res = await handleMiddleware(req, null as any);
//   expect(res).toBeDefined();
//   expect(j).toHaveBeenCalled();
//   expect(res?.status).toBe(403);
//   vi.unmock('jose');
// });
