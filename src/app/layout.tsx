import {presentationImage} from "@/lib/presentation-image";
import type {Metadata} from "next";
import {Inter,Rajdhani,Teko} from "next/font/google";
import "./globals.css";
import "./brand-sidebar.css";
import "./living-seal.css";
import "./checkpoint-b.css";
import "./checkpoint-c.css";
import "./checkpoint-c2.css";
import "./one-surface.css";
import "./editor-portrait.css";
import "./aster.css";
import "./ui-consistency.css";
import "./ui-primitives.css";
import "./lobby.css";
import "./theme.css";
import "./design-system.css";
import "./clan-ui.css";
import {getActiveDesign} from "@/lib/design-server";

import {EmberStage} from "@/components/EmberStage";
import {DesignRuntime} from "@/components/DesignRuntime";
import {DesignPreviewBridge} from "@/components/DesignPreviewBridge";

const inter=Inter({subsets:["latin"],weight:["400","500","600","700"],variable:"--font-qg-ui",display:"swap"});
const rajdhani=Rajdhani({subsets:["latin"],weight:["500","600","700"],variable:"--font-qg-heading",display:"swap"});
const teko=Teko({subsets:["latin"],weight:["500","600","700"],variable:"--font-qg-brand",display:"swap"});

export async function generateMetadata():Promise<Metadata>{const d=await getActiveDesign();return {title:{default:"Anasayfa · Q-GANG",template:"%s · Q-GANG"},description:d.siteDescription,icons:{icon:presentationImage(d.favicon,240),shortcut:presentationImage(d.favicon,240),apple:presentationImage(d.favicon,240)}}}

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="tr" className={`${inter.variable} ${rajdhani.variable} ${teko.variable}`}><body><DesignRuntime/><DesignPreviewBridge/><EmberStage>{children}</EmberStage></body></html>
}
