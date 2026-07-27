import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </BaseIcon>
  );
}

export function IconEvents(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </BaseIcon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 19a4 4 0 0 1 5 0" />
    </BaseIcon>
  );
}

export function IconSubscriptions(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 7h12M8 12h12M8 17h8" />
      <path d="M4 7h.01M4 12h.01M4 17h.01" />
    </BaseIcon>
  );
}

export function IconPayments(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20M7 15h3" />
    </BaseIcon>
  );
}

export function IconAudit(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </BaseIcon>
  );
}

export function IconHealth(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M22 12h-4l-3 7L9 5l-3 7H2" />
    </BaseIcon>
  );
}

export function IconSecurity(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
      <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
    </BaseIcon>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </BaseIcon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 6l6 6-6 6" />
    </BaseIcon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </BaseIcon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </BaseIcon>
  );
}
