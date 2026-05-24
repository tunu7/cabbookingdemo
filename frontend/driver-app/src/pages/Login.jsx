import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res =
        await API.post(
          "/auth/driver/login",
          formData
        );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "driver",
        JSON.stringify(
          res.data.driver
        )
      );

      alert(
        "Login Successful"
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data
          ?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",

        display: "flex",

        justifyContent:
          "center",

        alignItems: "center",

        background:
          "linear-gradient(135deg, #111827, #1f2937)",

        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",

          maxWidth: "420px",

          background: "white",

          padding: "35px 30px",

          borderRadius: "24px",

          boxShadow:
            "0 10px 40px rgba(0,0,0,0.2)",

          display: "flex",

          flexDirection:
            "column",

          gap: "18px",
        }}
      >
        <div
          style={{
            textAlign: "center",

            marginBottom: "10px",
          }}
        >
          <h1
            style={{
              marginBottom: "8px",

              color: "#111827",

              fontSize: "32px",
            }}
          >
            Driver Login
          </h1>

          <p
            style={{
              color: "#6b7280",

              fontSize: "15px",
            }}
          >
            Login to manage
            rides and passengers
          </p>
        </div>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
          style={{
            padding: "15px",

            border:
              "1px solid #d1d5db",

            borderRadius:
              "14px",

            fontSize: "15px",

            outline: "none",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={
            formData.password
          }
          onChange={handleChange}
          autoComplete="current-password"
          required
          style={{
            padding: "15px",

            border:
              "1px solid #d1d5db",

            borderRadius:
              "14px",

            fontSize: "15px",

            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "15px",

            border: "none",

            borderRadius:
              "14px",

            background:
              "#111827",

            color: "white",

            fontWeight: "600",

            fontSize: "16px",

            cursor: "pointer",

            transition:
              "0.3s",
          }}
        >
          {loading
            ? "Logging In..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;