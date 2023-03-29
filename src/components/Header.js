import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav>
      <ul className="nav-items">
        <li>
          <Link to="/">帳戶</Link>
        </li>
        <li>
          <Link to="Project">我的協作專案</Link>
        </li>
        <li>
          <Link to="Users">用戶推薦</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
