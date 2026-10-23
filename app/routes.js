import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.jsx"),
  route("projects", "./routes/projects.jsx"),
  route("work", "./routes/work-redirect.jsx"),
  route("projects/:slug", "./routes/public-detail.jsx"),
  route("research/:slug", "./routes/research-detail.jsx"),
  route("writing", "./routes/writing.jsx"),
  route("writing/:slug", "./routes/writing-detail.jsx"),
  route("admin", "./routes/admin.jsx"),
  route("admin/login", "./routes/admin-login.jsx"),
  route("admin/setup", "./routes/admin-setup.jsx"),
  route("admin/security", "./routes/admin-security.jsx"),
  route("admin/content/:id", "./routes/admin-content.jsx"),
  route("admin/settings", "./routes/admin-settings.jsx"),
  route(":section", "./routes/section.jsx"),
  route("*", "./routes/not-found.jsx"),
];
