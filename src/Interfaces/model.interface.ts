import mongoose from "mongoose";

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  profilepic: string;
  peofilepicid: string;
  role: string;
  isPasswordCorrect(password: string): Promise<boolean>;
}


export interface Icontent extends Document {
  title: string;
  description: string;
  midea: string;
  owner: mongoose.Schema.Types.ObjectId;
  updatedby: mongoose.Schema.Types.ObjectId;
}