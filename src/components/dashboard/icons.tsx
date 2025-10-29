export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 4 13V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M15 12h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7" />
      <path d="M18 6H6" />
      <path d="M18 6c-2.5 1.5-5 1.5-7.5 0" />
      <path d="M11 6V5" />
      <path d="M13 6V5" />
    </svg>
  );
}
