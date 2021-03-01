const User = require("../models/auth.model");
const expressJwt = require("express-jwt");

exports.readController = (req, res) => {
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};

exports.updateController = (req, res) => {
  // console.log('UPDATE USER - req.user, 'UPDATE DATA', req.body);
  const { name, password, address } = req.body;

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    } else {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be longer than 6 characters",
        });
      } else {
        user.password = password;
      }
    }

    if (!address) {
      return res.status(400).json({
        error: "Address is required",
      });
    } else {
      user.address = address;
    }

    // geocode and create location
    userSchema.pre("update", async function (next) {
      const loc = await geocoder.geocode(this.address);
      console.log(loc);
    });
    
    user.save((err, updatedUser) => {
      if (err) {
        console.log("USER UPDATE ERROR", err);
        return res.status(400).json({
          error: "User update failed",
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};
