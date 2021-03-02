const User = require("../models/auth.model");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandlers");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  //   if errors is not empty send errors
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    //   if no errors check to see if email is already registered
    User.findOne({
      email,
    }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          errors: "Email is already registerd",
        });
      }
    });

    // create registration / activation token
    const token = jwt.sign(
      {
        name,
        email,
        password,
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "10m",
      }
    );

    // crafting email to be sent
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Account Activation Link",
      html: `
            <h1> Please use the following link to activate your account</h1>
            <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
            <hr />
            <p1>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>`,
    };

    // send grid mailing
    sgMail
      .send(emailData)
      .then((sent) => {
        return res.json({
          message: `Email sent to ${email}`,
        });
      })
      .catch((err) => {
        return res.status(400).json({
          success: false,
          errors: console.log(err),
        });
      });
  }
};

// Activation and save to DB
exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    // verify token is valid or not expired
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log("Activation error", err);
        return res.status(401).json({
          errors: "Expired link. Signup again.",
        });
      } else {
        // if valid save to database.
        // get name email and password from token.
        const { name, email, password } = jwt.decode(token);
        console.log(email);
        const user = new User({
          name,
          email,
          password,
        });

        user.save((err, user) => {
          if (err) {
            console.log("Save Error", errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: user,
              message: "Signup Success!",
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: "error happening please try again",
    });
  }
};

exports.signinController = (req, res) => {
  

  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    User.findOne({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        // validate user email is registered
        return res.status(400).json({
          errors: "User with that email does not exist. Please try again.",
        });
      }

      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: "Email and password do not match",
        });
      }

      // generate token and send to client
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      const { _id, name, email, role,} = user;

      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role,
          
        },
      });
    });
  }
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // req.user._id
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user_id,
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied.",
      });
    }

    req.profile = user;
    next();
  });
};

exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    User.findOne(
      {
        email,
      },
      (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: "User with that email does not exist",
          });
        }
        const token = jwt.sign(
          {
            _id: user._id,
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: "10m",
          }
        );

        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Password Reset link`,
          html: `
                          <h1>Please use the following link to reset your password</h1>
                          <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                          <hr />
                          <p>This email may contain sensetive information</p>
                          <p>${process.env.CLIENT_URL}</p>`,
        };

        return user.updateOne(
          {
            resetPasswordLink: token,
          },
          (err, success) => {
            if (err) {
              console.log("RESET PASSWORD LINK ERROR", err);
              return (
                res.status(400),
                json({
                  error:
                    "database connection error on user password forgot request",
                })
              );
            } else {
              sgMail
                .send(emailData)
                .then((sent) => {
                  // console.log("SIGNUP EMAIL SENT", sent)
                  return res.json({
                    message: `email has been sent to ${email}. follow instructions to activate account`,
                  });
                })
                .catch((err) => {
                  // console.log("SIGNUP EMAIL SENT ERROR", err)
                  return res.json({
                    message: err.msg,
                  });
                });
            }
          }
        );
      }
    );
  }
};

exports.resetPasswordController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        process.env.JWT_RESET_PASSWORD,
        function (err, decoded) {
          if (err) {
            return res.status(400).json({
              error: "Expired link. Try again.",
            });
          }

          User.findOne(
            {
              resetPasswordLink,
            },
            (err, user) => {
              if (err || !user) {
                return res.status(400).json({
                  error: "Something went wrong. Try later",
                });
              }

              const updateFields = {
                password: newPassword,
                resetPasswordLink: "",
              };

              user = _.extend(user, updateFields);

              user.save((err, result) => {
                if (err) {
                  return res.status(400).json({
                    error: "Error resetting user password.",
                  });
                }
                res.json({
                  message: `Great! Now you can login with your new password!`,
                });
              });
            }
          );
        }
      );
    }
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
// google login
exports.googleController = (req, res) => {
  const { idToken } = req.body;
  // get token from request

  // verify token
  client
    .verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT,
    })
    .then((response) => {
      // console.log("GOOGLE LOGIN RESPONSE", response)
      const { email_verified, name, email } = response.payload;
      // Check if email is verified
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          // find if this email already exists
          // if exists
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });

            const { _id, email, name, role, position } = user;
            // send response to client side(react) token and user info
            return res.json({
              token,
              user: { _id, email, name, role, position },
            });
          } else {
            // if user does not exists we will save in database and generate passwordfor it
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password }); //create new user object with this email
            user.save((err, data) => {
              if (err) {
                console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
                return res.status(400).json({
                  error: "User signup failed with google",
                });
              }
              // if no error create token
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const { _id, email, name, role, position } = data;
              return res.json({
                token,
                user: {
                  _id,
                  email,
                  name,
                  role,
                  position
                },
              });
            });
          }
        });
      } else {
        // if error send error
        return res.status(400).json({
          error: "Google login failed. Try again",
        });
      }
    });
};

exports.facebookController = (req, res) => {
  console.log("FACEBOOK LOGIN REQ BODY", req.body);
  const { userID, accessToken } = req.body; // Get id and token from React

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`; // Get from facebook

  return (
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      // .then(response => console.log(response))
      .then((response) => {
        const { email, name } = response; //Get email and password from facebook
        User.findOne({ email }).exec((err, user) => {
          //Check if this account already exists with inputted email
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role, position } = user;
            return res.json({
              token,
              user: { _id, email, name, role, position },
            });
          } else {
            let password = email + process.env.JWT_SECRET; //generate password and save to database as new user
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log("ERROR FACEBOOK LOGIN ON USER SAVE", err);
                return res.status(400).json({
                  error: "User signup failed with facebook",
                });
              }
              // if no error
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const { email, _id, name, role, position } = data;
              return res.json({
                token,
                user: { _id, email, name, role, position },
              });
            });
          }
        });
      })
      .catch((error) => {
        res.json({
          error: "Facebook login failed. Try again",
        });
      })
  );
};
