import mongoose from "mongoose";
import { errMSG } from "../Constans/message";
import bcrypt from "bcrypt";
import { Iuser } from "../Interfaces/model.interface";

const roleValues = ['user', 'creater', 'admin']

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, errMSG.required('Nmae')]
  },
  email: {
    type: String,
    unique: true,
    required: [true, errMSG.required('Email')]
  },
  profilepic: {
    type: String,
    required: [true, errMSG.required('profile picture')]
  },
  profilepicId: {
    type: String,
    required: [true, errMSG.required('profile picture id')]
  },
  password: {
    type: String,
    required: [true, errMSG.required('Password')]
  },
  role: {
    type: String,
    enum: roleValues,
    required: [true, errMSG.required('Role')],
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
})

const User = mongoose.model('User', userSchema);

export default User;