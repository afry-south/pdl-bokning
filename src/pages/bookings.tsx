import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const Bookings = () => {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const { data } = api.example.hello.useQuery(
    { text: userId ?? "" },
    { enabled: !!userId }
  );

  return (
    <>
      <div>Bookings</div>
      <div>{data?.greeting}</div>
    </>
  );
};

export default Bookings;
