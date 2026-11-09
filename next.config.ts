import type {NextConfig} from "next";
import {publicationSlugAliases} from "./src/lib/publication-slug-aliases";
const imageHost=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"https://kttebbvinfmauthmayqp.supabase.co").hostname;
const config:NextConfig={images:{imageSizes:[64,128,256,384,480,960],qualities:[75,85],remotePatterns:["qgang-avatars","qgang-publications","qgang-design"].map(bucket=>({protocol:"https" as const,hostname:imageHost,port:"",pathname:`/storage/v1/object/public/${bucket}/**`}))},async headers(){return [{source:"/perf/:path*",headers:[{key:"Cache-Control",value:"public,max-age=31536000,immutable"}]},{source:"/(.*)",headers:[
 {key:"X-Content-Type-Options",value:"nosniff"},
 {key:"X-Frame-Options",value:"DENY"},
 {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
 {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
 {key:"Content-Security-Policy",value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'"},
 {key:"Content-Security-Policy-Report-Only",value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'"}
 ]}];},async redirects(){return Object.entries(publicationSlugAliases).flatMap(([old,current])=>["yayinlar","publications"].map(base=>({source:`/${base}/${old}`,destination:`/yayinlar/${current}`,permanent:true})))},serverExternalPackages:["pdfkit"],outputFileTracingIncludes:{"/api/budget/pdf":["./assets/fonts/**/*","./public/brand/qgang-mark.png"]}};
export default config;
