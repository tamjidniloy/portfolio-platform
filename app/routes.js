import { index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.jsx"),
  route(":section", "./routes/section.jsx"),
  route("*", "./routes/not-found.jsx"),
];
