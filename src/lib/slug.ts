export function slugify(value: string): string {
  return value.toLocaleLowerCase("tr-TR").replace(/ı/g,"i").normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"").slice(0,180).replace(/-+$/g,"");
}
