export const publicationSlugAliases: Record<string,string> = {
  "bir-film-izleyicisine-haks-zl-k-edebilir-mi": "bir-film-izleyicisine-haksizlik-edebilir-mi",
};

export function previousPublicationSlug(slug:string):string|undefined {
  return Object.keys(publicationSlugAliases).find(old=>publicationSlugAliases[old]===slug);
}
