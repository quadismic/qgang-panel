import type {SVGProps} from "react";

type IconName="hearth"|"discover"|"signals"|"rules"|"identity"|"fund"|"control"|"people"|"campfire"|"pulse"|"text"|"image"|"poll"|"link"|"video"|"send";
export function QGIcon({name,...props}:{name:IconName}&SVGProps<SVGSVGElement>){const common={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true,...props};const paths:{[K in IconName]:React.ReactNode}={
hearth:<><path d="M12 3.2c.8 3-1.7 4.3-.3 6.3 1-1.5 2.7-2.1 3.8-4 2.7 3.2 4.2 6.1 3.1 9.4-1 3.1-3.5 5.1-6.6 5.1s-5.7-2-6.6-5.1c-.8-2.7.3-5.1 2.7-7.7.2 2 1 3 2.1 3.8-.2-3.1.7-5.4 1.8-7.8Z"/><path d="M9.6 15.4c.2-1.7 1.1-2.8 2.5-4.1.1 1.5 1.5 2.2 1.7 3.6.2 1.6-.6 2.7-1.8 3.1-1.3-.3-2.6-1.1-2.4-2.6Z"/></>,
discover:<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M11 7.5v7M7.5 11h7"/></>,
signals:<><path d="m12 3 7.5 9-7.5 9-7.5-9L12 3Z"/><circle cx="12" cy="12" r="2.2"/><path d="M12 6.7v1.5M12 15.8v1.5"/></>,
rules:<><path d="M6 3.5h10.5A1.5 1.5 0 0 1 18 5v15.5H7.5A2.5 2.5 0 0 1 5 18V5.5a2 2 0 0 1 1-2Z"/><path d="M8.5 8h6M8.5 12h6M8.5 16h4"/></>,
identity:<><circle cx="12" cy="8.2" r="3.2"/><path d="M5.8 20c.6-4 2.6-6 6.2-6s5.6 2 6.2 6"/></>,
fund:<><path d="M4 9.5h16M5.5 9.5V19M9.8 9.5V19M14.2 9.5V19M18.5 9.5V19M3.5 20h17"/><path d="m12 3 8 4H4l8-4Z"/></>,
control:<><circle cx="12" cy="12" r="3"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></>,
people:<><circle cx="9" cy="9" r="3"/><circle cx="16.5" cy="10.5" r="2.3"/><path d="M3.8 19c.5-3.4 2.3-5.2 5.2-5.2s4.7 1.8 5.2 5.2M14.2 15.2c2.8-.7 4.8.6 5.5 3.8"/></>,
campfire:<><path d="m5 20 14-7M19 20 5 13"/><path d="M12 3.5c.5 2.2-1.3 3.2-.3 4.7.7-1.1 2-1.6 2.8-3 2 2.4 3.1 4.5 2.3 7-.7 2.3-2.6 3.8-4.8 3.8s-4.1-1.5-4.8-3.8c-.6-2 .2-3.8 2-5.7.1 1.5.7 2.2 1.5 2.8-.1-2.3.5-4 1.3-5.8Z"/></>,
pulse:<><path d="M3 12h4l2-5 3.2 10 2.4-7 1.7 2H21"/></>,
text:<><path d="M5 5h14M12 5v14M8.5 19h7"/></>,
image:<><rect x="3.5" y="4" width="17" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m5.5 17 4.2-4 3 2.7 2.5-2.2 3.3 3.5"/></>,
poll:<><path d="M5 19v-6M10 19V8M15 19v-9M20 19V5"/></>,
link:<><path d="m9.5 14.5 5-5M7.5 16.5l-1 1a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 7.5l1-1a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"/></>,
video:<><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></>,
send:<><path d="m4 4 17 8-17 8 3-8-3-8Z"/><path d="M7 12h14"/></>};return <svg {...common}>{paths[name]}</svg>}
