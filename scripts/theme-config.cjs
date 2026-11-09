const fs=require("node:fs"),path=require("node:path"),ts=require("typescript"),vm=require("node:vm");
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,"../src/lib/theme.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsObject});
const {defaultTheme,themePresets,parseThemeImport,campaignExpiry}=exportsObject;
const [preset,endsOn,baseFile]=process.argv.slice(2);
try{
 if(!Object.hasOwn(themePresets,preset)||campaignExpiry(endsOn)===null)throw Error("Kullanım: npm run theme:config -- gtaVi YYYY-AA-GG [mevcut-tema.json]. Paletler: "+Object.keys(themePresets).join(", "));
 const base=baseFile?parseThemeImport(fs.readFileSync(baseFile,"utf8")):defaultTheme;
 process.stdout.write(JSON.stringify({...base,campaign:{palette:themePresets[preset],endsOn}},null,2)+"\n");
}catch(e){console.error(e.message);process.exitCode=1;}
