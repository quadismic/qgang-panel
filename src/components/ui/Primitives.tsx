import type {ButtonHTMLAttributes,InputHTMLAttributes,SelectHTMLAttributes,HTMLAttributes,ReactNode} from "react";
import {QGIcon,type QGIconName} from "@/components/QGIcon";
export type ActionLevel="primary"|"secondary"|"tertiary"|"destructive";
export function Button({level="secondary",className="",type="button",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{level?:ActionLevel}){return <button type={type} className={`qgButton qgButton-${level} ${className}`} {...props}/>}
export function IconButton({icon,label,...props}:Omit<ButtonHTMLAttributes<HTMLButtonElement>,"children">&{icon:QGIconName;label:string}){return <Button {...props} className={`qgIconButton ${props.className||""}`} aria-label={label} title={label}><QGIcon name={icon}/></Button>}
export function Input({className="",...props}:InputHTMLAttributes<HTMLInputElement>){return <input className={`qgInput ${className}`} {...props}/>}
export function Select({className="",...props}:SelectHTMLAttributes<HTMLSelectElement>){return <select className={`qgSelect ${className}`} {...props}/>}
export function Badge({className="",children,...props}:HTMLAttributes<HTMLSpanElement>){return <span className={`qgBadge ${className}`} {...props}>{children}</span>}
export function Metadata({children,className="",...props}:HTMLAttributes<HTMLDivElement>){return <div className={`qgMetadata ${className}`} {...props}>{children}</div>}
export function EmptyState({title,message,children}:{title:string;message?:string;children?:ReactNode}){return <div className="qgEmptyState"><QGIcon name="empty"/><h3>{title}</h3>{message&&<p>{message}</p>}{children}</div>}
export function ErrorState({title="İşlem tamamlanamadı",message,children}:{title?:string;message:string;children?:ReactNode}){return <div className="qgErrorState" role="alert"><strong>{title}</strong><p>{message}</p>{children}</div>}
