import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.jsx"),
  route("admin", "./routes/admin.jsx"),
  route("admin/login", "./routes/admin-login.jsx"),
  route("privacy", "./routes/privacy.jsx"),
  route("*", "./routes/not-found.jsx"),
];
