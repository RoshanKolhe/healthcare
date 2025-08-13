// sections
import { HomeView } from 'src/sections/home/view';
import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'HealthCare: The starting point for your next project',
};

export default function HomePage() {
  redirect('/auth/jwt/login'); 
}
