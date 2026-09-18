import type {Metadata} from "next";
import {Cinzel} from "next/font/google";
import "./globals.css";
import "./brand-sidebar.css";
import "./living-seal.css";
import "./checkpoint-b.css";
import "./checkpoint-c.css";
import "./checkpoint-c2.css";
import "./one-surface.css";
import {EmberStage} from "@/components/EmberStage";

const cinzel=Cinzel({subsets:["latin"],weight:["400","500","600","700"],variable:"--font-qgang",display:"swap"});

export const metadata:Metadata={title:"Q-GANG",description:"Play. Create. Connect."};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="tr" className={cinzel.variable}><body><EmberStage>{children}</EmberStage></body></html>
}