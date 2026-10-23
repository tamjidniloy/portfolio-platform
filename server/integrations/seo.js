export function canonicalUrl(path,origin=process.env.CMS_PUBLIC_ORIGIN){
 if(!origin||typeof path!=="string"||!/^\/(?:[a-z0-9/-]*)$/.test(path)||path.includes("//"))return null;
 const u=new URL(origin);
 if(!["http:","https:"].includes(u.protocol)||u.pathname!=="/"||u.username||u.password)return null;
 return u.origin+path;
}
export function canonicalMeta(data){
 if(!data?.canonical)return [];
 return [{tagName:"link",rel:"canonical",href:data.canonical},
   ...(data.title?[{property:"og:title",content:data.title}]:[]),
   {property:"og:url",content:data.canonical}];
}
