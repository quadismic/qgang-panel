import Link from "next/link";
import {RichText} from "@/components/RichText";
type Author={display_name?:string|null;handle?:string|null;avatar_url?:string|null};
export function CommentItem({id,body,createdAt,author,canDelete,action,returnTo}:{id:string;body:string;createdAt:string;author?:Author|null;canDelete:boolean;action:string;returnTo:string}){
 const name=author?.display_name||"Üye",profileUrl=author?.handle?"/u/"+author.handle:null;
 const identity=<><span className="qgCommentAvatar">{author?.avatar_url?<img src={author.avatar_url} alt="" loading="lazy"/>:<span aria-hidden="true">{name.slice(0,1).toLocaleUpperCase("tr-TR")}</span>}</span><span className="qgCommentAuthorCopy"><strong>{name}</strong>{author?.handle&&<small>@{author.handle}</small>}</span></>;
 return <article className="qgComment"><header className="qgCommentHeader">{profileUrl?<Link className="qgCommentAuthor" href={profileUrl}>{identity}</Link>:<div className="qgCommentAuthor">{identity}</div>}<time dateTime={createdAt}>{new Date(createdAt).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</time></header><RichText className="qgCommentBody" value={body}/>{canDelete&&<footer className="qgCommentActions"><form method="post" action={action}><input type="hidden" name="action" value="delete"/><input type="hidden" name="comment_id" value={id}/><input type="hidden" name="return_to" value={returnTo}/><button type="submit" className="qgAction qgActionQuiet">Yorumu sil</button></form></footer>}</article>;
}
