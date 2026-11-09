import {NextResponse} from "next/server";

export function POST(req:Request){
 return NextResponse.redirect(new URL("/yonetim/moderasyon",req.url),303);
}
