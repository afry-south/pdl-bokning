import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const { data: sessionData, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionData && status === "unauthenticated") {
      router.push("/signin");
    }
  }, [sessionData]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Overview />
      </main>
    </>
  );
};

export default Home;

const Overview = () => {
  const { data: activities, isLoading } = api.activity.getAll.useQuery();
  const router = useRouter();

  if (!activities && !isLoading) return <div>No activities found</div>;
  if (!activities) return null;

  if (activities.length === 1 && activities[0]) {
    router.push(`/${activities[0].id}`);
  }

  return (
    <div>
      {activities.map((activity) => {
        return (
          <Link href={`/${activity.id}`} className="cursor-pointer">
            {activity.name} - {activity.city}
          </Link>
        );
      })}
    </div>
  );
};
