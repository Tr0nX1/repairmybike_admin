import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect root access to the dashboard
  // The middleware will then handle authentication and send to /login if needed
  redirect('/dashboard');
}
