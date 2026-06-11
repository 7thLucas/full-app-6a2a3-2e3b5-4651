import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useAuth } from "~/modules/authentication";
import { AppShell } from "~/components/compliance/AppShell";
import { EmployeeDetailPage } from "~/components/compliance/EmployeeDetailPage";
import { useParams } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function AdminEmployeeDetailRoute() {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  return <AppShell><EmployeeDetailPage userId={userId!} /></AppShell>;
}
