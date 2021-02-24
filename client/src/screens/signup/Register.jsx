import React, { useState } from "react";
import SignupBG from "../../assets/SignupBG.gif";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { authenticate, isAuth } from "../../helpers/auth";
import { Link, Redirect } from "react-router-dom";
import "./signup.style.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password1: "",
    password2: "",
    textChange: "Sign Up",
  });

  const { name, email, password1, password2, textChange } = formData;
  // handle input changes
  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };
  // submitt data to database
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password1) {
      if (password1 === password2) {
        setFormData({ ...formData, textChange: "Submitting" });
        axios
          .post(`${process.env.REACT_APP_API_URL}/register`, {
            name,
            email,
            password: password1,
          })
          .then((res) => {
            setFormData({
              ...formData,
              name: "",
              email: "",
              password1: "",
              password2: "",
              textChange: "Submitted",
            });

            toast.success(res.data.message);
          })
          .catch((err) => {
            setFormData({
              ...formData,
              name: "",
              email: "",
              password1: "",
              password2: "",
              textChange: "Sign Up",
            });
            console.log(err.response);
            toast.error(err.response.data.errors);
          });
      } else {
        toast.error("Passwords don't matches");
      }
    } else {
      toast.error("Please fill all fields");
    }
  };

  return (
    <div className="parentDiv2 flex ">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />

      <div className="formContainer flex flex-1">
        <div className="outerForm flex">
          <h1 className="animate-pulse">Sign Up for SpinIt</h1>

          <form className="flex-1" onSubmit={handleSubmit}>
            <div className="innerForm relative">
              <input
                className="signupInput"
                type="text"
                placeholder="Name"
                onChange={handleChange("name")}
                value={name}
              />
              <input
                className="signupInput"
                type="email"
                placeholder="Email"
                onChange={handleChange("email")}
                value={email}
              />
              <input
                className="signupInput"
                type="password"
                placeholder="Password"
                onChange={handleChange("password1")}
                value={password1}
              />
              <input
                className="signupInput"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange("password2")}
                value={password2}
              />
              <button
                type="submit"
                className="submitBtn hover:bg-indigo-700 flex focus:shadow-outline"
              >
                <i className="submitBtnIcon fas fa-user-plus fa" />
                <span className="ml-3">{textChange}</span>
              </button>
            </div>
            
              <div className="pageBreak animate-bounce transform translate-y-1/2">
               Need a shortcut? Create an account by using social login!
              </div>
           
            <div className="signInRedirectDiv flex">
              <a
                className="signInRedirect 
                flex transition-all duration-300 ease-in-out focus:shadow-outline"
                href="/login"
                target="_self"
              >
                <i className="signInRedirectIcon-Google fab fa-google fa " />
                <span className=" justify-content-center">Sign In</span>
                <i className="signInRedirectIcon-Facebook fab fa-facebook fa " />
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
