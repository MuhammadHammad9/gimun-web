import React from 'react';

export interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function LogoIcon({ className = 'size-8', ...props }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer subtle shield container */}
      <path
        d="M24 4L40 10V22C40 32.5 33.2 42 24 44C14.8 42 8 32.5 8 22V10L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-40"
      />
      {/* GIMUN Laurel Branch (Left) in Orange accent */}
      <path
        d="M16 18C14.5 20.5 14.5 24 16 27C17 29 19 30.5 21 31.5M14 20C12 21.5 12 23.5 14 25M17 14C15.5 15.5 15.5 17 17 18.5"
        stroke="#FF6B35"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* GMC Scales of Justice (Right) in Teal accent */}
      <path
        d="M24 14V34M20 34H28M19 18H29M29 18L33 24M25 24H33M33 24L31 28M32 18C33.5 20.5 33.5 24 32 27"
        stroke="#00B4A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Star of Diplomatic Excellence */}
      <circle cx="24" cy="14" r="2" fill="#FF6B35" />
    </svg>
  );
}
