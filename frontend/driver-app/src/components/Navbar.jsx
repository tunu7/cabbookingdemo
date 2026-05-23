import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <div
      style={{
        padding: "15px",
        background: "black",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>Driver App</h2>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;