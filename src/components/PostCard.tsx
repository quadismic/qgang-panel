import type { FeedPost } from "@/lib/types";
export function PostCard({post}:{post:FeedPost}){
 return <article className="post">
  <header><div className="avatar">{post.author.slice(0,1)}</div><div><strong>{post.author}</strong><span>{post.handle} · {post.created_at}</span></div>{post.campfire&&<em>🔥 {post.campfire}</em>}</header>
  <p>{post.body}</p>
  <footer><button>♡ {post.reactions}</button><button>◌ {post.comments}</button><button>↗ Paylaş</button></footer>
 </article>
}
