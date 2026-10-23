import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.jsx"),
  route("projects", "./routes/projects.jsx"),
  route("work", "./routes/work-redirect.jsx"),
  route("projects/:slug", "./routes/public-detail.jsx"),
  route("research/:slug", "./routes/public-detail.jsx"),
  route("admin", "./routes/admin.jsx"),
  route("admin/content/:id", "./routes/admin-content.jsx"),
  route(":section", "./routes/section.jsx"),
  route("*", "./routes/not-found.jsx"),
];
