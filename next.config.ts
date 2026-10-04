import type {NextConfig} from "next";
import {publicationSlugAliases} from "./src/lib/publication-slug-aliases";
const config:NextConfig={async redirects(){return Object.entries(publicationSlugAliases).flatMap(([old,current])=>["yayinlar","publications"].map(base=>({source:`/${base}/${old}`,destination:`/yayinlar/${current}`,permanent:true})))},serverExternalPackages:["pdfkit"],outputFileTracingIncludes:{"/api/codex/compilations":["./assets/fonts/**/*","./public/brand/qgang-mark.png"]}};
export default config;
