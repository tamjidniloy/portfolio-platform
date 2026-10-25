import test from "node:test";
import assert from "node:assert/strict";
import { deliverContactViaResend, validateContact } from "../server/studio/contact.js";

const env = {
  RESEND_API_KEY: "test-key-never-reaches-network",
  PORTFOLIO_FROM_EMAIL: "Portfolio QA <qa@example.test>",
};
const payload = validateContact({
  name: "Test Sender", email: "sender@example.test",
  subject: "A new engineering project",
  message: "Hello, I'd love to discuss a software project with you.",
  website: "", consent: true,
});

test("message delivery uses authenticated provider, verified sender, recipient and safe reply-to", async () => {
  let calls = 0;
  const fetcher = async (url, init) => {
    calls++;
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, "Bearer test-key-never-reaches-network");
    assert.equal(init.headers["Content-Type"], "application/json");
    assert.ok(init.signal, "Delivery must have a timeout signal");
    const value = JSON.parse(init.body);
    assert.equal(value.from, env.PORTFOLIO_FROM_EMAIL);
    assert.deepEqual(value.to, ["portfolio-owner@example.test"]);
    assert.equal(value.reply_to, "sender@example.test");
    assert.equal(value.subject, "Portfolio enquiry: A new engineering project");
    assert.match(value.text, /From: Test Sender/);
    assert.match(value.text, /software project with you/);
    assert.ok(!value.text.includes("test-key-never-reaches-network"));
    return {ok:true,status:202};
  };
  assert.equal(await deliverContactViaResend({recipient:"portfolio-owner@example.test",payload,env,fetcher}),true);
  assert.equal(calls,1);
});

test("provider rejection fails closed; no false success or leaking provider errors", async () => {
  for (const status of [400,401,429,500,503]) {
    await assert.rejects(
      deliverContactViaResend({recipient:"owner@example.test",payload,env,
        fetcher:async()=>({ok:false,status})}),
      (error) => error.status === 503 && /could not be delivered/.test(error.message),
    );
  }
});

test("provider network and timeout failures propagate instead of claiming delivery", async () => {
  await assert.rejects(
    deliverContactViaResend({recipient:"owner@example.test",payload,env,
      fetcher:async()=>{throw new Error("mock offline");}}),
    /mock offline/,
  );
});

test("malformed and malicious contact input never reaches email delivery", () => {
  const valid = {...payload,consent:true,website:""};
  const bad = [
    { ...valid, name: "\r\nBcc: other@example.test" },
    { ...valid, email: "bad@email.example\nBcc:other@example.test" },
    { ...valid, subject: "Hello\r\nX-Custom: problem" },
    { ...valid, website: "honeypot-filled" },
    { ...valid, consent: false },
    { ...valid, message: "too short" },
  ];
  for (const entry of bad) assert.throws(()=>validateContact(entry));
});
