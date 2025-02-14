import mongoose from "mongoose";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female"
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number;
    //virtual Attributes
}

const schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "product ID is required"],
        },
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email is already registered"],
            validate: {
                validator: function (v: string) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: (props: any) => `${props.value} is not a valid email address!`,
            }
        },
        photo: {
            type: String,
            required: [true, "User photo is required"],
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            required: [true, "Please enter gender"]
        },
        dob: {
            type: Date,
            required: [true, "Please enter date of birth"]
        }
    },
    {
        timestamps: true
    });

    schema.virtual("age").get(function () {
        //code give by copilot
        // const diff = Date.now() - this.dob.getTime();
        // const ageDate = new Date(diff);
        // return Math.abs(ageDate.getUTCFullYear() - 1970);

        //code by me
        const today = new Date();
        const dob = this.dob;
        let age = today.getFullYear() - dob.getFullYear();

        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    });

export const User = mongoose.model<IUser>("User", schema);