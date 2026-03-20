import type { Metadata } from 'next';
import { Unbounded, Manrope } from 'next/font/google';

const unbounded = Unbounded({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  other: {
    'theme-color': '#08090a',
  },
  title: 'S1P — CRM for Call Centers | Manage Calls, Leads & Deals',
  description:
    'All-in-one CRM platform for call centers. Track calls, capture leads, close deals, and integrate with Telegram — built for Uzbekistan and the CIS market.',
  keywords: [
    'CRM',
    'call center',
    'Telegram',
    'Uzbekistan',
    'leads',
    'deals',
    'колл-центр',
    'CRM для колл-центров',
  ],
  openGraph: {
    title: 'S1P — CRM for Call Centers | Manage Calls, Leads & Deals',
    description:
      'Track calls, capture leads, close deals, and integrate with Telegram. Built for call centers in Uzbekistan and the CIS market.',
    type: 'website',
    siteName: 'S1P',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S1P — CRM for Call Centers',
    description:
      'All-in-one CRM for call centers with Telegram integration. Manage calls, leads & deals.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'S1P',
  applicationCategory: 'BusinessApplication',
  description:
    'CRM platform for call centers. Manage contacts, leads, deals, and calls with Telegram integration.',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '290000',
    priceCurrency: 'UZS',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${unbounded.variable} ${manrope.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  );
}
