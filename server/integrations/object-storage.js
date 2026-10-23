import {
 S3Client, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { MEDIA_MAX_BYTES, validateStoredMedia } from "./media-validation.js";

export function createPrivateObjectStorage(env=process.env){
  const bucket=env.MEDIA_S3_BUCKET;
  const region=env.MEDIA_S3_REGION;
  if(!bucket||!region||!/^[a-z0-9][a-z0-9.-]{2,62}$/.test(bucket))
    throw Error("Valid private S3 bucket/region configuration required");
  const endpoint=env.MEDIA_S3_ENDPOINT;
  if(endpoint){
    const u=new URL(endpoint);
    if(u.protocol!=="https:" && env.NODE_ENV==="production")throw Error("Object storage endpoint must be HTTPS");
    if(u.username||u.password||u.search||u.hash)throw Error("Invalid object-storage endpoint");
  }
  const client=new S3Client({
    region,
    ...(endpoint?{endpoint,forcePathStyle:env.MEDIA_S3_PATH_STYLE==="true"}:{}),
  });
  return Object.freeze({
    async createUpload({key,mime,size}){
      if(!key.startsWith("private/staging/")||size>MEDIA_MAX_BYTES)throw Error("Invalid object staging key");
      const {url,fields}=await createPresignedPost(client,{
        Bucket:bucket,Key:key,Expires:300,
        Conditions:[
          ["content-length-range",1,size],
          ["eq","$Content-Type",mime],
          ["eq","$key",key],
        ],
        Fields:{"Content-Type":mime},
      });
      return {method:"POST",url,fields,expiresInSeconds:300};
    },
    async inspect({key,mime,size,sha256}){
      const head=await client.send(new HeadObjectCommand({Bucket:bucket,Key:key}));
      if(Number(head.ContentLength)!==size||head.ContentType!==mime)throw Error("Object metadata mismatch");
      const object=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
      return validateStoredMedia({
        body:object.Body,expectedSize:size,expectedMime:mime,expectedSha256:sha256,
      });
    },
    async delete({key}){
      await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));
    },
    async close(){client.destroy();},
  });
}
