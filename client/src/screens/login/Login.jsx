import React, { useState } from "react";
import "./login.style.css";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { authenticate, isAuth } from "../../helpers/auth";
import { Link, Redirect } from "react-router-dom";
import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

const Login = ({ history }) => {
  const [formData, setFormData] = useState({
    email: "",
    password1: "",
    textChange: "Sign In",
    
  });
  const { email, password1, textChange } = formData;

  // geolocation on login work in progress --------------------------------------------


 

  // const geoLocate = React.useCallback(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(this.getCoordinates);
  //     console.log(this.geolocation)
  //   } else {
  //     alert("Geolocation not supported or request denied");
  //   }
  // });

  // const getCoordinates = React.useCallback((position) => {
  //   console.log(position.coords.latitude);
  //   this.setState({
  //     latitude: position.coords.latitude,
  //     longitude: position.coords.longitude,
  //   });
  // });

  // getCoordinates();
  // geoLocate();
  
  //  ------------------------------------------------------------------------------------------

  // handle changes from input fields ----------------------------------------------------------------
  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });
  };

  // submit data to backend
  const handleSubmit = (e) => {
    console.log(process.env.REACT_APP_API_URL);
    e.preventDefault();
    if (email && password1) {
      setFormData({ ...formData, textChange: "Submitting" });
      axios
        .post(`${process.env.REACT_APP_API_URL}/login`, {
          email,
          password: password1,
        })
        .then((res) => {
          authenticate(res, () => {
            setFormData({
              ...formData,
              email: "",
              password1: "",
              textChange: "Submitted",
            });
            isAuth() && isAuth().role === "admin"
              ? history.push("/admin")
              : history.push("/private");
            toast.success(`Hey ${res.data.user.name}, Welcome back!`);
          });
        })
        .catch((err) => {
          setFormData({
            ...formData,
            email: "",
            password1: "",
            textChange: "Sign In",
          });
          console.log(err.response);
          toast.error(err.response.data.errors);
        });
    } else {
      toast.error("Please fill all fields");
    }
  };

  //Google OAuth ------------------------------------------------------------------------------------------
  // send google token
  const sendGoogleToken = (tokenId) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/googlelogin`, {
        idToken: tokenId,
      })
      .then((res) => {
        console.log(res.data);
        informParent(res);
      })
      .catch((error) => {
        console.log("GOOGLE SIGNIN ERROR", error.response);
        toast.err("Google login error");
      });
  };

  // get response from google
  const responseGoogle = (response) => {
    console.log(response);
    sendGoogleToken(response.tokenId);
  };
  // ---------------------------------------------------------------------------
  // if success we need to authenticate user and redirect. Used in both Facebook and Google
  const informParent = (response) => {
    authenticate(response, () => {
      isAuth() && isAuth().role === "admin"
        ? history.push("/admin")
        : history.push("/private");
    });
  };

  // facebook Login ----------------------------------------------------------------------------
  // send facebook token
  const sendFacebookToken = (userID, accessToken) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/facebooklogin`, {
        userID,
        accessToken,
      })
      .then((res) => {
        console.log(res.data);
        informParent(res);
      })
      .catch((error) => {
        console.log("GOOGLE SIGNIN ERROR", error.response);
      });
  };

  // get facebook response
  const responseFacebook = (response) => {
    console.log(response);
    sendFacebookToken(response.userID, response.accessToken);
  };
  // -----------------------------------------------------------------------------------------------

  // Return HTML -----------------------------------------------------------------------------------
  return (
    <div className="parentDiv min-h-screen flex">
      <div id="fb-root"></div>
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="loginDiv">
        <h1 className="spinItTitle">Sign In for SpinIt</h1>

        <div className="itemContainer">
          <form className="emailLogin relative " onSubmit={handleSubmit}>
            <input
              className="emailInputs focus:outline-none"
              type="email"
              placeholder="Email"
              onChange={handleChange("email")}
              value={email}
            />
            <input
              className="emailInputs focus:outline-none  mt-5"
              type="password"
              placeholder="Password"
              onChange={handleChange("password1")}
              value={password1}
            />
            <button
              type="submit"
              className="signInBtn rounded-lg flex focus:outline-none focus:shadow-outline"
            >
              <i className="fas fa fa-sign-in-alt" />
              <span className="">Sign In</span>
            </button>
            <Link
              to="/users/password/forget"
              className="no-underline hover:underline text-indigo-500 text-md text-right absolute right-0  mt-2"
            >
              Forget password?
            </Link>
          </form>

          <div className="pageBreak">
            <div className="pageBreakText transform animate-bounce">
              Not on the list?
            </div>
          </div>

          <div className="buttonContainer flex ">
            <GoogleLogin
              clientId={`${process.env.REACT_APP_GOOGLE_CLIENT}`}
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={"single_host_origin"}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="btn-google  flex focus:outline-none  animate-pulse  focus:shadow-outline"
                >
                  <div>
                    <i
                      className="fa fa-google"
                      onMouseOver={({ target }) => (target.style.color = "red")}
                    />
                  </div>
                  <span>Sign In</span>
                </button>
              )}
            ></GoogleLogin>

            <FacebookLogin
              appId={`${process.env.REACT_APP_FACEBOOK_CLIENT}`}
              autoLoad={false}
              callback={responseFacebook}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  className="btn-facebook flex focus:outline-none animate-pulse focus:shadow-outline"
                >
                  <div>
                    <i
                      className="fa fa-facebook"
                      onMouseOver={({ target }) =>
                        (target.style.color = "blue")
                      }
                    />
                  </div>
                  <span>Sign In </span>
                </button>
              )}
            />
            {/* signup */}
            <a
              className="btn-signup flex focus:outline-none animate-pulse focus:shadow-outline"
              href="/register"
              target="_self"
            >
              {" "}
              <button>
                <div>
                  <i
                    className="fa fa-user-plus"
                    onMouseOver={({ target }) => (target.style.color = "green")}
                  />
                  <span>Sign Up</span>
                </div>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
