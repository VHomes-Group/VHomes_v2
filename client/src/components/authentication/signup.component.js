import React, { useState } from "react";
import "./signup.css";

const Signup = () => {
  const [userSignup, setUserSignup] = useState({
    email: "",
    name: "", // need to change to first and last name at some point
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8080/login", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: userSignup,
    }).then((res) => {
      if (res.status === 422) {
        console.log(res.body.errors);
      }

      if (res.status === 201) {
        window.sessionStorage.accessToken = res.body.token;
      }
    });
  };

  return (
    <div id="signup-content">
      <div class="login-form signup-form">
        <h2 className="services-title signup-title">create an account</h2>
        <form className="form signup-form">
          <input
            type="email"
            placeholder="your email"
            className="input login-input"
            onChange={(e) =>
              setUserSignup({ ...userSignup, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="your name"
            className="input login-input"
            onChange={(e) =>
              setUserSignup({ ...userSignup, name: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="your password"
            className="input login-input"
            onChange={(e) =>
              setUserSignup({ ...userSignup, password: e.target.value })
            }
          />
          <input
            type="submit"
            value="create your account"
            className="btn green"
            onClick={(e) => handleSubmit(e)}
          />
        </form>
        <div>
          already have an account?{" "}
          <a href="/Login" style={{ color: "green", textDecoration: "none" }}>
            log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
