import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.jsx"),
  route("admin", "./routes/admin.jsx"),
  route("admin/login", "./routes/admin-login.jsx"),
  route("privacy", "./routes/privacy.jsx"),
  route("projects", "./routes/legacy-redirect.jsx"),
  route("projects/:slug", "./routes/legacy-redirect.jsx"),
  route("work", "./routes/legacy-redirect.jsx"),
  route("contact", "./routes/legacy-redirect.jsx"),
  route("*", "./routes/not-found.jsx"),
];
