import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Account from "./pages/Account";
import Project from "./pages/Project";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

export default function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Account />} />
          <Route path="project" element={<Project />} />
          <Route path="Users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
