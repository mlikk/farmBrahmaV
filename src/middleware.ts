
import createMiddleware from 'next-intl/middleware';
import {pathnames, locales, localePrefix} from './navigation';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale: 'en',
  // Make sure this configured matches the `localePrefix` configured
  // in your `src/navigation.ts` file
  localePrefix,
  pathnames
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
 
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|hi|mr|ta|te)/:path*',
 
    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_ipx|.*\\..*).*)'
  ]
};
