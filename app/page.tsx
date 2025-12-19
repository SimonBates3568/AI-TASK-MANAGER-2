import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root to /tasks
  redirect('/tasks');
}
