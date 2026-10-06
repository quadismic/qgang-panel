"use client";
import {Button} from "./ui/Primitives";
export function ConfirmSubmitButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return <Button level="destructive" type="submit" className={className} onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>{children}</Button>;
}
