const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        middleInitial: {
            type: String,
            trim: true,
            maxlength: 1,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        businessName: {
            type: String,
            trim: true,
            default: "",
        },
        emailAddresses: {
            type: [String],
            default: [],
        },
        contactNumbers: {
            type: [String],
            default: [],
        },
        instagramAccounts: {
            type: [String],
            default: [],
        },
        facebookPages: {
            type: [String],
            default: [],
        },
        businessLocations: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);