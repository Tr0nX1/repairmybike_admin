import { redirect } from 'next/navigation';

export default function NewInventoryPage() {
  // New part creation is handled via a Sheet on the main inventory page
  redirect('/dashboard/inventory');
}
