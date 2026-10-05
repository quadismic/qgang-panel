import {richHtml} from "@/lib/rich-text";
import {PrivacyRichContent} from "@/components/PrivacyRichContent";
export function RichText({value,className=""}:{value?:string|null;className?:string}){
 const html=richHtml(value||"");const classes=`qgProse ${className}`;
 return html.includes("<iframe")||html.includes("<img")?<PrivacyRichContent html={html} className={classes}/>:<div className={classes} dangerouslySetInnerHTML={{__html:html}}/>;
}
