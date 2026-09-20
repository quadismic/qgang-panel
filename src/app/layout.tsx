import type {Metadata} from "next";
import {Cinzel} from "next/font/google";
import "./globals.css";
import "./brand-sidebar.css";
import "./living-seal.css";
import "./checkpoint-b.css";
import "./checkpoint-c.css";
import "./checkpoint-c2.css";
import "./one-surface.css";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
import {EmberStage} from "@/components/EmberStage";
import {DesignRuntime} from "@/components/DesignRuntime";
import {DesignPreviewBridge} from "@/components/DesignPreviewBridge";

const cinzel=Cinzel({subsets:["latin"],weight:["400","500","600","700"],variable:"--font-qgang",display:"swap"});

export async function generateMetadata():Promise<Metadata>{const s=await createClient();const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();const d=normalizeDesign(data?.settings??defaultDesign);return {title:{default:d.siteTitle,template:`%s · ${d.siteTitle}`},description:d.siteDescription,icons:{icon:d.favicon,shortcut:d.favicon,apple:d.favicon}}}

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="tr" className={cinzel.variable}><body><DesignRuntime/><DesignPreviewBridge/><EmberStage>{children}</EmberStage></body></html>
}