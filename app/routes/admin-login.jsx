import { useState } from "react";
import { Link, redirect } from "react-router";
import { studioSession } from "../../server/studio/index.js";
import { ThemeControl } from "../components/theme-control.jsx";

export async function loader({ request }) {
  if (await studioSession(request)) throw redirect("/admin");
  return Response.json({}, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow" } });
}
export function meta() {
  return [{ title: "Owner login — Portfolio Studio" }, { name: "robots", content: "noindex,nofollow" }];
}
async function post(path, body) {
  const response = await fetch("/api/studio" + path, {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Studio-Request": "1" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Unable to sign in. Please try again.");
  return result;
}
export default function AdminLogin() {
  const [stage, setStage] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (stage === "password") {
        const result = await post("/login/start", { email, password });
        setChallengeId(result.challengeId); setStage("code"); setPassword("");
      } else {
        await post("/login/verify", { challengeId, code });
        // Verify the browser retained the new session cookie before leaving the OTP form.
        // Otherwise an apparently successful login would bounce right back to this page.
        const sessionResponse = await fetch("/api/studio/session", { credentials: "same-origin", cache: "no-store" });
        const session = await sessionResponse.json().catch(() => ({}));
        if (!sessionResponse.ok || !session.authenticated) {
          throw new Error("Code verified, but the browser did not save your session. Allow first-party cookies and use the same localhost address throughout login.");
        }
        window.location.assign("/admin");
      }
    } catch (err) { setError(err.message || "Sign-in failed"); }
    finally { setBusy(false); }
  }
  return <main className="studio-login-page">
    <div className="studio-login-art">
      <Link to="/" className="studio-login-logo" style={{ textDecoration: "none", color: "#fff" }}><span>✳</span> Portfolio Studio</Link>
      <div className="orb-core" aria-hidden="true"/>
      <h2>Your space.<br/><em>Your story.</em><br/>Your studio.</h2>
      <p>A BEAUTIFUL PORTFOLIO, MADE SIMPLE.</p>
    </div>
    <div className="studio-login-form-wrap">
      <div className="studio-login-box">
        <div className="studio-login-toolbar">
          <Link className="studio-back" to="/">← Back to portfolio</Link>
          <ThemeControl compact />
        </div>
        <div className="studio-login-steps" aria-label={stage === "password" ? "Step 1 of 2: password" : "Step 2 of 2: verification code"}>
          {stage === "password" ? "STEP 01 / 02 · YOUR CREDENTIALS" : "STEP 02 / 02 · CONFIRM IT'S YOU"}
        </div>
        <span>PRIVATE OWNER ACCESS</span>
        <h1>{stage === "password" ? "Welcome back." : "Check your inbox."}</h1>
        <p>{stage === "password" ? "Sign in to make your portfolio entirely your own." :
          "Enter the six-digit verification code for " + email + ". It expires in 10 minutes."}</p>
        <form onSubmit={submit}>
          {stage === "password" ? <>
            <div className="studio-field"><label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required/></div>
            <div className="studio-field"><label htmlFor="login-password">Password</label>
              <div className="studio-password-wrap"><input id="login-password" type={showPassword ? "text" : "password"}
                autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password" required/>
                <button type="button" className="studio-show-password"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div></div>
          </> : <div className="studio-field"><label htmlFor="login-code">Verification code</label>
            <input id="login-code" className="studio-pin" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" type="text"
              maxLength={6} minLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required/>
            <small>Use the newest code from your email or, when testing locally, your WebStorm terminal. You can paste all six digits.</small></div>}
          {error && <p className="studio-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="studio-login-submit">
            {busy ? "Please wait…" : stage === "password" ? "Continue securely →" : "Verify and enter studio →"}
          </button>
        </form>
        {stage === "code" && <button type="button" onClick={() => { setStage("password"); setCode(""); setError(""); }} style={{ background: "none", border: 0, color: "#7656dd", fontWeight: 700, marginTop: 22 }}>← Start over</button>}
        <p className="studio-login-help">Private owner dashboard · Two-step verification<br/>Your password and code are never shared with visitors.</p>
      </div>
    </div>
  </main>;
}
