import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import "./brand-sidebar.css";
import "./living-seal.css";
import "./checkpoint-b.css";
import "./checkpoint-c.css";
import "./checkpoint-c2.css";
import "./one-surface.css";
import "./editor-portrait.css";
import "./aster.css";
import {EmberStage} from "@/components/EmberStage";
import {DesignRuntime} from "@/components/DesignRuntime";
import {DesignPreviewBridge} from "@/components/DesignPreviewBridge";

const inter=Inter({subsets:["latin"],variable:"--font-qgang",display:"swap"});

export const metadata:Metadata={title:{default:"Q-GANG",template:"%s | Q-GANG"},description:"Q-GANG · Oyun, topluluk ve kardeşlik.",icons:{icon:"/brand/qgang-logo.png",shortcut:"/brand/qgang-logo.png",apple:"/brand/qgang-logo.png"}};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="tr" className={inter.variable}><body><DesignRuntime/><DesignPreviewBridge/><EmberStage>{children}</EmberStage></body></html>
}