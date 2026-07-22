import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | MotorSync ERP',
  description: 'Sign in to MotorSync — the complete ERP dashboard for car parts manufacturing. Manage employees, inventory, machines and production in real-time.',
  keywords: ['ERP login', 'factory management', 'MotorSync sign in'],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sign In | MotorSync ERP',
    description: 'Sign in to access the MotorSync car parts factory ERP dashboard.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://motorsync.vercel.app/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}