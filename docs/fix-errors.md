# Refresh Token Verification Notes

## Current Status

`POST /api/user/refresh-tokens` is now working in the real flow.

I verified these cases:

1. Register -> get refresh cookie -> call `/api/user/refresh-tokens` -> returns `200`
2. Login -> get refresh cookie -> call `/api/user/refresh-tokens` -> returns `200`

So the main refresh-token implementation is functional now.

## What Is Fixed

### 1. Refresh token cookie now contains the refresh-token row id

In [src/services/TokenCreation.ts](C:/Users/szb84/OneDrive/Desktop/Github%20Projects/coder-gyan/auth-service/src/services/TokenCreation.ts:44), you create the DB token first, then sign the JWT using:

```ts
const newPayload = {
  sub: payload.sub,
  id: token.id
}
```

This is the important fix.

It means:

- `sub` = user id
- `id` = refresh token row id

That matches what your middleware expects.

### 2. Middleware lookup is now compatible with the signed token

In [src/middleware/tokenValidation.ts](C:/Users/szb84/OneDrive/Desktop/Github%20Projects/coder-gyan/auth-service/src/middleware/tokenValidation.ts:16), the middleware checks:

```ts
id: (token?.payload as { id: string }).id
```

That now works because the refresh JWT `id` is the actual `RefreshToken.id`.

### 3. Login refresh flow is now aligned

In [src/controller/user.ts](C:/Users/szb84/OneDrive/Desktop/Github%20Projects/coder-gyan/auth-service/src/controller/user.ts:119), login now uses:

```ts
const payload = {
  sub: user.id,
};
```

That is better than using `user.email` for `sub`.

Now register, login, and refresh all use the same user identity style.

### 4. Refresh rotation is working

In [src/controller/user.ts](C:/Users/szb84/OneDrive/Desktop/Github%20Projects/coder-gyan/auth-service/src/controller/user.ts:197), the old token row is deleted, and then a new refresh token is issued.

Runtime verification showed this path is working.

## Remaining Issue

The remaining issue is the test, not the route.

## Why The Test Fails

In [test/user/refresh-token.spec.ts](C:/Users/szb84/OneDrive/Desktop/Github%20Projects/coder-gyan/auth-service/test/user/refresh-token.spec.ts:13), the test calls:

```ts
POST /api/user/refresh-tokens
```

without first:

- creating a user session
- receiving a `refreshToken` cookie
- sending that cookie back

So the request is unauthenticated.

Current real behavior for that request is:

- status: `500`
- message: `"No authorization token was found"`

That is why the test fails when it expects `200`.

## Exact Test Fix Needed

The test should model a real client flow:

1. Register or login a user
2. Capture `set-cookie`
3. Send those cookies to `POST /api/user/refresh-tokens`
4. Assert `200`
5. Assert new cookies are returned

## Suggested Test Shape

Use this flow:

```ts
const registerResponse = await request(app)
  .post('/api/user/register')
  .send(user);

const cookies =
  (registerResponse.headers as unknown as { 'set-cookie': string[] })[
    'set-cookie'
  ] ?? [];

const refreshResponse = await request(app)
  .post('/api/user/refresh-tokens')
  .set('Cookie', cookies)
  .send();

expect(refreshResponse.statusCode).toBe(200);
expect(refreshResponse.body.success).toBe(true);
```

You can also do the same using `/api/user/login` first instead of register.

## Optional Improvement

Right now, calling refresh without a cookie returns `500`.

That works for failing the request, but a cleaner API response would be:

- `401 Unauthorized` for missing token
- `401 Unauthorized` for invalid token
- `401 Unauthorized` for revoked token

This is not the main bug now, but it would improve API behavior.

## Final Conclusion

`POST /api/user/refresh-tokens` is working now in the real authenticated flow.

The remaining broken part is the test because it does not send a valid refresh-token cookie before expecting `200`.
