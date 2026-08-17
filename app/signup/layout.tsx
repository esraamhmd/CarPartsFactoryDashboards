import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | MotorSync ERP',
  description: 'Create your MotorSync account to access the complete car parts factory ERP dashboard. Sign up for free.',
  keywords: ['ERP signup', 'factory management account', 'MotorSync register'],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Create Account | MotorSync ERP',
    description: 'Sign up to access the MotorSync car parts factory ERP dashboard.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://motorsync.vercel.app/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}