import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      void router.push("/");
    }
  }, [router, status]);

  if (!csrfToken) return <div>loading...</div>;

  let url = "http://localhost:3000"; // dev client should use localhost
  if (process.env.VERCEL_URL) url = `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  const handleSignIn = async () => {
    void signIn("email", {
      email,
      redirect: false,
      callbackUrl: `${url}/`,
    });

    await router.push(
      `${url}/auth/verify-code?email=${email}&csrfToken=${csrfToken}`
    );
  };

  return (
    <>
      <label>
        Email address
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button onClick={() => void handleSignIn()} type="submit">
        Sign in with Email
      </button>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}
