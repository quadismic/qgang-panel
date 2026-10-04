/** Safe destination after identity completion; never route back into an auth loop. */
export function authNext(raw?:string|null){
 const value=raw||'/profil';
 if(!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u0020]/.test(value))return '/profil';
 const u=new URL(value,'https://q-gang.com');
 if(['/login','/onboarding'].includes(u.pathname)||u.pathname.startsWith('/auth/')||u.pathname.startsWith('/api/'))return '/profil';
 return u.pathname+u.search+u.hash;
}
