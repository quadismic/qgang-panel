import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/supabase/server";

// Notifications come from authorized, persisted source operations (e.g. badge RPCs).
// No client, including an administrator, may impersonate a system notification.
export async function POST(){
 const user=await getCurrentUser();
 return NextResponse.json({error:user?"notifications_require_source_operation":"unauthorized"},{status:user?403:401});
}
