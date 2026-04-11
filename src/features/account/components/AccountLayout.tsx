
import { authOptions } from "@/shared/lib/auth";
import { AccountLayoutSwitcher } from "./AccountLayoutSwitcher";
import { getServerSession } from "next-auth";

export async function AccountLayout() {
  const session = await getServerSession(authOptions);
  const user    = session?.user;

  const createdAt = new Date().toLocaleDateString("id-ID", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });

  return (
    <AccountLayoutSwitcher
      name      ={user?.name     ?? ""}
      username  ={user?.username ?? ""}
      email     ={user?.email    ?? ""}
      avatar    ={user?.image    ?? ""}
      createdAt ={createdAt}
    />
  );
}