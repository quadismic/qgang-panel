import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { posts } from "@/lib/demo";
export default function Home(){
 return <AppShell><div className="pageHead"><div><span className="kicker">Q-GANG</span><h1>Home</h1></div><a className="button primary" href="/create">Paylaş</a></div>
 <section className="composer"><div className="avatar">Q</div><a href="/create">Ateşe ne bırakmak istersin?</a></section>
 <div className="feed">{posts.map(p=><PostCard key={p.id} post={p}/>)}</div></AppShell>
}