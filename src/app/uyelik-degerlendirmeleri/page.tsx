import {AppShell} from '@/components/AppShell';
import {getPermissions,allows} from '@/lib/permissions';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {MembershipReviews} from '@/components/membership-reviews/MembershipReviews';
import type {ReviewSnapshot} from '@/lib/membership-reviews/model';
import './reviews.css';
export const dynamic='force-dynamic';
export const metadata={title:'Üyelik Değerlendirmeleri'};
export default async function Page({searchParams}:{searchParams:Promise<{period?:string}>}){
 const {user,permissions}=await getPermissions();if(!user)redirect('/login?next=/uyelik-degerlendirmeleri');if(!allows(permissions,'reviews.view'))redirect('/topluluk');
 const q=await searchParams;const id=q.period&&/^[0-9a-f-]{36}$/i.test(q.period)?q.period:null;
 const s=await createClient();const {data,error}=await s.rpc('membership_review_snapshot',{p_period:id});
 return <AppShell right={false}>{error||!data?<main className="reviewsPage"><h1>Üyelik Değerlendirmeleri</h1><p role="alert">Değerlendirmeler şu anda yüklenemiyor.</p></main>:<MembershipReviews initial={data as ReviewSnapshot}/>}</AppShell>;
}
