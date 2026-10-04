import type {NextConfig} from "next";
const config:NextConfig={serverExternalPackages:["pdfkit"],outputFileTracingIncludes:{"/api/codex/compilations":["./assets/fonts/**/*","./public/brand/qgang-mark.png"]}};
export default config;
