import mongoose from "mongoose";
import { MSG } from "../Constans/message";

export const connectDB = async () => {
  await mongoose.connect(`${process.env.dburl}/${process.env.dbName}`)
  console.log(MSG.DBconnected);
}