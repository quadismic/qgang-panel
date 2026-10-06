import {useId} from "react";
import {richHtml,footnoteHtml} from "@/lib/rich-text";
import {PrivacyRichContent} from "@/components/PrivacyRichContent";
export function RichText({value,className=""}:{value?:string|null;className?:string}){
 const id=useId().replace(/[^a-zA-Z0-9_-]/g, "");
 const html=footnoteHtml(richHtml(value||""), `fn-${id}`);const classes=`qgProse ${className}`;
 return html.includes("<iframe")||html.includes("<img")?<PrivacyRichContent html={html} className={classes}/>:<div className={classes} dangerouslySetInnerHTML={{__html:html}}/>;
}
