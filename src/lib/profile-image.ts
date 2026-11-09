import sharp from "sharp";

export async function profileImage(file:File,max:number){
 if(!file.size||file.size>max||!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("invalid_image");
 const bytes=Buffer.from(await file.arrayBuffer());
 const image=sharp(bytes,{limitInputPixels:20000000,animated:false,failOn:"warning"});
 const metadata=await image.metadata();
 if(!["png","jpeg","webp"].includes(metadata.format||"")||!metadata.width||!metadata.height)throw new Error("invalid_image");
 const result=await image.rotate().resize({width:2400,height:2400,fit:"inside",withoutEnlargement:true}).webp({quality:88}).toBuffer();
 if(result.length>max)throw new Error("invalid_image");
 return result;
}
