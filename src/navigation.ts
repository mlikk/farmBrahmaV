

import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
 
export const locales = ['en', 'hi', 'mr', 'ta', 'te'] as const;
export const localePrefix = 'always'; // Default
 
// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, a single
  // external path can be used for all locales.
  '/': '/',
 
  // If locales use different paths, you can
  // specify each external path per locale.
  '/dashboard': {
    en: '/dashboard',
    hi: '/dashboard',
    mr: '/dashboard',
    ta: '/dashboard',
    te: '/dashboard'
  },
  '/dashboard/market-trends': {
    en: '/dashboard/market-trends',
    hi: '/dashboard/market-trends',
    mr: '/dashboard/market-trends',
    ta: '/dashboard/market-trends',
    te: '/dashboard/market-trends'
  },
  '/dashboard/recommendations': {
    en: '/dashboard/recommendations',
    hi: '/dashboard/recommendations',
    mr: '/dashboard/recommendations',
    ta: '/dashboard/recommendations',
    te: '/dashboard/recommendations'
  },
  '/dashboard/environment': {
    en: '/dashboard/environment',
    hi: '/dashboard/environment',
    mr: '/dashboard/environment',
    ta: '/dashboard/environment',
    te: '/dashboard/environment'
  },
  '/dashboard/community': {
    en: '/dashboard/community',
    hi: '/dashboard/community',
    mr: '/dashboard/community',
    ta: '/dashboard/community',
    te: '/dashboard/community'
  },
  '/dashboard/location': {
    en: '/dashboard/location',
    hi: '/dashboard/location',
    mr: '/dashboard/location',
    ta: '/dashboard/location',
    te: '/dashboard/location'
  },
   '/partner': {
    en: '/partner',
    hi: '/partner',
    mr: '/partner',
    ta: '/partner',
    te: '/partner'
  }
} satisfies Pathnames<typeof locales>;
 
export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});
