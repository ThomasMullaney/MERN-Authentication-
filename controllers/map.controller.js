const User = require("../models/auth.model");


// get all users in db
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        return res.status(200).json({
            succes: true,
            count: users.length,
            data: users
        }); 
    } catch(err) {
        console.log(err);
        res.staus(500).json({ error: "Server error" });
    }
}

// vauge possible feature create "store" post request could be used for creating any object you make schema of
exports.createStore = async (req, res, next) => {
    try {
       const store = await Store.create(req.body);

       return res.staus(200).json( {
        succes: true,
        data: store
       })
    } catch(err) {
        console.log(err);
        if(err.code === 1100) {
            return res.status(400).json({
                error: "This X already exists"
            })
        }
        res.staus(500).json({ error: "Server error" });
    }
}