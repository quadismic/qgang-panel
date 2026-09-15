# Q-GANG Alpha 0.1

## Product loop
Sign in → create identity → join Campfire → discover players → interact → Play Together → move to Steam/Discord.

## 0.1.0 Foundation
- Next.js + TypeScript
- Dedicated Supabase project reference
- Environment boundary
- Clean rebuild branch

## 0.1.1 Identity
- Google OAuth client flow
- Discord OAuth client flow
- Steam entry/link boundary
- One Q-GANG profile with connected account model
- Secure auth trigger creates profile without trusting user metadata for authorization

## 0.1.2 Social
- Home feed shell
- Create flow
- Post/comment/reaction schema
- Profiles and members
- Notifications foundation

## 0.1.3 Campfire
- Campfire discovery
- Membership schema
- Campfire feed
- Initial Valheim, CS2 and Crimson Desert fires

## 0.1.4 Play Together
- Request model with pending/accepted/declined/cancelled states
- Steam/Discord handoff model
- No fake Steam Add Friend API: Q-GANG connects people, platforms handle the final social/game action

## 0.1.5 Quadismic
- Creator area
- YouTube Data API route with 15-minute cache
- No API secret exposed to browser

## 0.1.6 Control
- Founder/Admin/Moderator/Creator/Member roles
- Permission table
- Reports
- Moderation actions
- Q-Control shell

## 0.1.7 Polish
- Desktop/mobile navigation
- Responsive layout
- reduced-motion support
- loading/error/not-found states
- community rules and account/privacy settings
- indexed feed/query paths
- RLS on every exposed public table

## External activation gates
Code is prepared, but production activation requires credentials/configuration owned by the external providers:
1. Supabase publishable key in deployment environment.
2. Google OAuth client ID/secret in Supabase Auth.
3. Discord OAuth client ID/secret in Supabase Auth.
4. Steam Web API key + Steam OpenID server verification for Steam linking/sign-in.
5. YouTube API key + Quadismic channel ID for automatic video ingestion.
6. Run `supabase/migrations/0001_qgang_alpha.sql` on the dedicated Q-GANG project and run Supabase security/performance advisors.

These are activation gates, not reasons to add more product scope.
