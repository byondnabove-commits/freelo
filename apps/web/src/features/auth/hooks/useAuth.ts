import { useCurrentUser } from "./useCurrentUser";

export function useAuth() {
  const query = useCurrentUser();

  return {
    ...query,

    isAuthenticated: !!query.data?.user,

    isOnboarded: query.data?.isOnboarded ?? false,

    user: query.data?.user,

    session: query.data?.session,

    organization: query.data?.organization,

    member: query.data?.member,

    organizationProfile: query.data?.organizationProfile,

    subscription: query.data?.subscription,
  };
}
