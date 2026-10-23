import { createHash } from "node:crypto";
import { CmsError } from "../../domain/cms/content-contract.js";

export const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_MIMES = Object.freeze(["image/jpeg","image/png","image/webp","application/pdf"]);
const allowed=new Set(MEDIA_MIMES);
const hex=/^[a-f0-9]{64}$/;
const fail=message=>new CmsError("INVALID_MEDIA",422,message);

export function validateMediaIntent({name,mime,size,sha256}={}){
  if(typeof name!=="string"||!name.trim()||name.length>160||
    (name.includes("/")||name.includes("\\")||
     [...name].some(ch=>ch.charCodeAt(0)<32||ch.charCodeAt(0)===127)))throw fail("Invalid filename");
  if(!allowed.has(mime))throw fail("Unsupported media MIME");
  if(!Number.isInteger(size)||size<1||size>MEDIA_MAX_BYTES)throw fail("Media must be 1–8 MiB");
  if(typeof sha256!=="string"||!hex.test(sha256))throw fail("Valid SHA-256 required");
  return Object.freeze({name:name.trim(),mime,size,sha256});
}
export function sniffMediaMime(data){
  if(!Buffer.isBuffer(data)||!data.length)return null;
  if(data.length>=8&&data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
  if(data.length>=3&&data[0]===255&&data[1]===216&&data[2]===255)return "image/jpeg";
  if(data.length>=12&&data.toString("ascii",0,4)==="RIFF"&&data.toString("ascii",8,12)==="WEBP")return "image/webp";
  if(data.length>=5&&data.toString("ascii",0,5)==="%PDF-")return "application/pdf";
  return null;
}
export async function validateStoredMedia({body,expectedSize,expectedMime,expectedSha256}={}){
  if(!body||typeof body[Symbol.asyncIterator]!=="function")throw fail("Unreadable storage stream");
  let total=0;
  const chunks=[],hasher=createHash("sha256");
  for await(const raw of body){
    const chunk=Buffer.from(raw);
    total+=chunk.length;
    if(total>MEDIA_MAX_BYTES||total>expectedSize)throw fail("Object exceeds declared upload size");
    chunks.push(chunk);
    hasher.update(chunk);
  }
  const data=Buffer.concat(chunks,total);
  const observedMime=sniffMediaMime(data);
  if(total!==expectedSize||observedMime!==expectedMime||hasher.digest("hex")!==expectedSha256){
    throw fail("Uploaded object failed length, signature or SHA-256 checks");
  }
  return Object.freeze({byteSize:total,observedMime,sha256:expectedSha256});
}
