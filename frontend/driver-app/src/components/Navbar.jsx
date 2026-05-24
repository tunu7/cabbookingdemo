import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <nav
      style={{
        width: "100%",
        background: "#111827",
        color: "white",
        padding: "16px 24px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "700",
              fontSize: "18px",
            }}
          >
            D
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              Driver App
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#9ca3af",
              }}
            >
              Driver Dashboard
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={logout}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "10px",
            background: "#dc2626",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            transition: "0.3s ease",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;