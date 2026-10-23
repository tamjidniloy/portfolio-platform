import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import "./styles.css";
import { getCmsPool } from "../server/cms/pool.js";
import { getPublicList } from "../server/cms/public-reader.js";

export async function loader() {
  const pool=getCmsPool();
  const articles=pool ? await getPublicList(pool,{type:"article",limit:1}) : [];
  return Response.json({showWriting:articles.length>0},{headers:{"Cache-Control":"no-store"}});
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <main className="error-layout">
      <p className="eyebrow">DEVFOLIO OS</p>
      <h1>{status === 404 ? "Page not found" : "This page is unavailable"}</h1>
      <p>Return to the foundation homepage to continue.</p>
      <a className="button-link" href="/">
        Go home
      </a>
    </main>
  );
}
