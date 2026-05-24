import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../utils/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/customer/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "customer",
        JSON.stringify(res.data.customer)
      );

      alert("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      console.log(
        "Login Error:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <h1>Customer Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <button type="submit">
          Login
        </button>

        <Link to="/register">
          Create account
        </Link>
      </form>
    </div>
  );
}

export default Login;