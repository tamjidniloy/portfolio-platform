/**
 * Network egress is confined to explicitly chosen, pinned HTTPS providers.
 * No arbitrary visitor URL may be used as a destination.
 */
const required=(value,name)=>{
  if(typeof value!=="string"||!value.trim())throw Error("Missing provider setting: "+name);
  return value;
};
export function createEmailProvider(env=process.env,fetchFn=fetch){
  const mode=env.EMAIL_PROVIDER||"disabled";
  if(mode==="disabled")return null;
  if(mode!=="resend")throw Error("Unsupported email delivery provider");
  const token=required(env.RESEND_API_KEY,"RESEND_API_KEY");
  const from=required(env.CONTACT_FROM_EMAIL,"CONTACT_FROM_EMAIL");
  const to=required(env.CONTACT_OWNER_EMAIL,"CONTACT_OWNER_EMAIL");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))
    throw Error("Valid configured email addresses required");
  return Object.freeze({
    async send({id,name,email,message}){
      const response=await fetchFn("https://api.resend.com/emails",{
        method:"POST",signal:AbortSignal.timeout(10000),
        headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json",
          "Idempotency-Key":"devfolio-contact-"+id},
        body:JSON.stringify({
          from,to:[to],reply_to:email,subject:"New DEVFOLIO OS contact message",
          text:"New contact from "+name+" <"+email+">\n\n"+message,
        }),
      });
      if(!response.ok)throw Error("RESEND_HTTP_"+response.status);
      return true;
    }
  });
}
export function createCachePurger(env=process.env,fetchFn=fetch){
  const mode=env.CACHE_PURGE_MODE||"no-store";
  if(mode==="no-store")return Object.freeze({async purge(){return true;}});
  if(mode!=="cloudflare")throw Error("Unsupported cache provider");
  const zone=required(env.CLOUDFLARE_ZONE_ID,"CLOUDFLARE_ZONE_ID");
  const token=required(env.CLOUDFLARE_API_TOKEN,"CLOUDFLARE_API_TOKEN");
  if(!/^[a-f0-9]{32}$/i.test(zone))throw Error("Invalid Cloudflare zone ID");
  const origin=new URL(required(env.CMS_PUBLIC_ORIGIN,"CMS_PUBLIC_ORIGIN"));
  if(origin.protocol!=="https:"||origin.pathname!=="/"||origin.username||origin.password||
     origin.search||origin.hash)throw Error("A canonical HTTPS public origin is required");
  return Object.freeze({
    async purge(paths){
      const urls=[...new Set(paths.filter(p=>typeof p==="string"&&p.startsWith("/")&&!p.startsWith("//")).map(p=>origin.origin+p))];
      const response=await fetchFn("https://api.cloudflare.com/client/v4/zones/"+zone+"/purge_cache",{
        method:"POST",signal:AbortSignal.timeout(10000),
        headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
        body:JSON.stringify({files:urls}),
      });
      if(!response.ok)throw Error("CLOUDFLARE_HTTP_"+response.status);
      const reply=await response.json();
      if(reply.success!==true)throw Error("CLOUDFLARE_PURGE_NOT_ACCEPTED");
      return true;
    },
  });
}
