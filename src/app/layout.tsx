import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Q-GANG 4.0",description:"Q-GANG klan sicili",icons:{icon:"/brand/qgang-logo.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="tr"><body>{children}</body></html>}