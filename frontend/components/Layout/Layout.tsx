import React from "react";
import { toast } from "react-toastify";
import { useAuthUser } from "next-firebase-auth";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";

type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Layout({ children, className }: LayoutProps): JSX.Element {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    // Build user data for user context
    const fetchUserData = async () => {
      const [resUserData, errUserData] = await getUserDetails(
        await authUser.getIdToken(),
        authUser.email ?? "bad",
        "client",
      );

      if (errUserData !== null) {
        throw errUserData;
      }

      if (resUserData === null) throw new Error("This shouldn't have happened");
      return resUserData;
    };

    if (user.userDetails === null && authUser.id !== null) {
      console.log("Fetching initial user data");
      fetchUserData()
        .then((res) => {
          console.log("fetched");
          if (user.setUserDetails !== undefined) {
            console.log(user);
            user.setUserDetails(res.userDetails);
            // setShowedCourses(res.userDetails.enrolments);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          toast.error("failed to fetch shit");
        });
    } else {
      console.log("Did not need to fetch. Not logged in");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);
  console.log(user);

  return <div className={className}>{children}</div>;
}
