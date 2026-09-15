import Link from "next/link";
export function MobileNav(){return <nav className="mobileNav"><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link className="create" href="/create">+</Link><Link href="/campfires">Fires</Link><Link href="/profile">Profile</Link></nav>}
