
import { redirect } from '@/navigation';

// This page only redirects to the dashboard, which is the root of the app.
export default function RootPage() {
  redirect("/dashboard");
}
