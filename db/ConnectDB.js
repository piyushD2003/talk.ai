import mongoose from "mongoose"

const connectDB = async () => {
        const conn = await mongoose.connect("mongodb+srv://piyushai:12345@cluster0.zrroo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        // const conn = await mongoose.connect('mongodb://localhost:27017/AiBasedJobCracker');
        console.log("MongoDB Connected");
        return conn
}

export default connectDB