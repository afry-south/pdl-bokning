import { useRouter } from "next/router";

export default function VerifyCode() {
  const { query } = useRouter();
  return (
    <form action="/api/auth/callback/email" method="get">
      <h1>Enter your code</h1>
      <input type="hidden" name="callbackUrl" value={query.callbackUrl} />
      <input type="hidden" name="email" value={query.email} />
      <label>
        Code
        <input aria-label="code" type="text" name="token" />
      </label>

      <button type="submit">Sign in</button>
    </form>
  );
}
