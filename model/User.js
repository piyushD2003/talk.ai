import mongoose from "mongoose";
const {Schema, model} = mongoose

const UserSchema = new Schema({
  email: {type: String,required: true,unique: true},
  name: {type: String},
  SKey:{type:String},
  password:{type:String},
  createdAt: {type: Date,default: Date.now},
  updatedAt: {type: Date,default: Date.now}
});

export default mongoose.models.User|| model('User', UserSchema);
