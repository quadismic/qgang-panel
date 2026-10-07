import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {sortProfileActivity, type ProfileActivityEntry} from "@/lib/profile-activity";
import {publicationSlugAliases} from "@/lib/publication-slug-aliases";
import {ProfileActivityList} from "@/components/ProfileActivityList";

export async function ProfileActivity({userId}: {userId: string}) {
  const s = await createClient();
  // Explicit published filters also protect the feed when viewed by editorial staff.
  const [works, comments, awards] = await Promise.all([
    s.from("publications").select("id,title,slug,published_at").eq("author_id", userId).eq("status", "published").not("published_at", "is", null).order("published_at", {ascending: false}).order("id", {ascending: false}).limit(20),
    s.from("publication_comments").select("id,created_at,publications!inner(title,slug,status)").eq("author_id", userId).eq("publications.status", "published").order("created_at", {ascending: false}).order("id", {ascending: false}).limit(20),
    s.from("profile_badges").select("id,granted_at,badges(name)").eq("user_id", userId).is("revoked_at", null).order("granted_at", {ascending: false}).order("id", {ascending: false}).limit(20)
  ]);
  if (works.error || comments.error || awards.error) return <p className="qgActivityLimit" role="status">Faaliyetler şu anda yüklenemedi.</p>;
  const entries: ProfileActivityEntry[] = [];
  for (const work of works.data ?? []) {
    if (work.published_at && work.slug) entries.push({id: `publication:${work.id}`, kind: "publication", title: work.title, date: work.published_at, href: `/yayinlar/${(publicationSlugAliases[work.slug] || work.slug)}`});
  }
  for (const comment of comments.data ?? []) {
    const work = Array.isArray(comment.publications) ? comment.publications[0] : comment.publications;
    if (work?.slug) entries.push({id: `comment:${comment.id}`, kind: "comment", title: work.title, date: comment.created_at, href: `/yayinlar/${(publicationSlugAliases[work.slug] || work.slug)}#publication-comments`});
  }
  for (const award of awards.data ?? []) {
    const badge = Array.isArray(award.badges) ? award.badges[0] : award.badges;
    if (badge) entries.push({id: `badge:${award.id}`, kind: "badge", title: badge.name, date: award.granted_at, href: "/rozetler"});
  }
  const {data:events,error:eventError}=await s.rpc("list_profile_event_activity",{p_user:userId});
  for(const event of events??[]) entries.push({id:`event:${event.id}`,kind:"event",title:event.title,date:event.starts_at,href:`/etkinlikler/${event.id}`});
  return <>{eventError&&<p className="qgActivityLimit" role="status">Etkinlik faaliyetleri şu anda yüklenemedi.</p>}<ProfileActivityList entries={sortProfileActivity(entries)}/>{!!events?.length&&<Link className="qgButton qgButton-tertiary" href={`/etkinlikler?view=archive&member=${userId}`}>Katılım Arşivi →</Link>}</>;
}
