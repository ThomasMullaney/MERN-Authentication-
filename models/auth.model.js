const mongoose = require("mongoose");
const crypto = require('crypto');
const {Client} = require("@googlemaps/google-maps-services-js");

// User Schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        
        name: {
            type: String,
            trim: true,
            required: true
        },

        hashed_password: {
            type: String,
            required: true
        },
        salt: String,

        role: {
            type: String,
            default: 'subscriber'
        },

        resetPasswordLink: {
            data: String,
            default: ''
        },

        address: {
            type: String,
            required: true,
            default: ""
        },

       location: {
           type: {
               type: String,
               enum: ['Point']
           },
           coordinates: {
               type: [Number],
               index: '2dsphere'
           },
           formattedAddress: String
       },
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("address")) {
        // geocoding through google
        const client = new Client({});
        let params = {
            address: this.address,
            coponents: 'country:US',
            key: process.env.REACT_APP_GOOGLE_KEY
        }
        client.geocode({
            params: params
        }).then(response => {
            const address = response.data.results[0];
            console.log(address)
            const formattedAddress = address.formatted_address;
            const addLat = address.geometry.location.lat;
            const addLng = address.geometry.location.lng;
            this.location = {
                type: 'Point',
                coordinates: [addLat, addLng],
                formattedAddress: formattedAddress,
            }
            console.log(addLat, addLng)
            console.log(this.location)
        }).catch(error => {
            console.log(error)
        });
    }
    next();
    // const loc = await geocoder.geocode(this.address);
    // console.log(loc);
  });


// virtual password
userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// methods
userSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + "";
    }
};

module.exports = mongoose.model("User", userSchema);