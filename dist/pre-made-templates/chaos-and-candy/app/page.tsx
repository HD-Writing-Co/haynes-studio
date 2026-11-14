import { getUser } from "./auth";
import Club from "./club";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <Club signedIn={!!await getUser()} signIn="/sign-in" />;
}
