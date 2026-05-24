import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../utils/axios";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",

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
          "/auth/customer/register",
          formData
        );

      localStorage.setItem(
        "token",
        res.data.token
      );

      alert(
        "Registration Successful"
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data
          ?.message ||
          "Registration Failed"
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
          "linear-gradient(135deg, #0f172a, #1e293b)",

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
            Create Account
          </h1>

          <p
            style={{
              color: "#6b7280",

              fontSize: "15px",
            }}
          >
            Register to start
            booking rides
          </p>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
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
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
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
          }}
        >
          {loading
            ? "Creating Account..."
            : "Register"}
        </button>

        <Link
          to="/"
          style={{
            textAlign: "center",

            color: "#2563eb",

            textDecoration:
              "none",

            fontWeight: "600",
          }}
        >
          Already have an
          account?
        </Link>
      </form>
    </div>
  );
}

export default Register;