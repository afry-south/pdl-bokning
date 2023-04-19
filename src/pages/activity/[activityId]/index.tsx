import { format } from "date-fns";
import { useRouter } from "next/router";
import { RRule } from "rrule";
import { api } from "~/utils/api";

export default () => {
  const router = useRouter();
  const id = router.query.activityId;

  if (!id || Array.isArray(id)) return <div>Bad ID</div>;

  const { data: activity } = api.activity.getById.useQuery({ id });

  if (!activity) return <div>No activity found</div>;

  const rrule = RRule.fromString(activity.rrule);
  console.log(rrule.origOptions);
  rrule.options.count = 20;

  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold">{activity.name}</h1>
      </div>

      <div>
        {rrule.all().map((date) => {
          return (
            <div className="cursor-pointer rounded border-x border-t p-2">
              {format(date, "yyyy-MM-dd")}
            </div>
          );
        })}
      </div>
    </div>
  );
};
