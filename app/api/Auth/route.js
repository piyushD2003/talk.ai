import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/db/ConnectDB";
import User from "@/model/User";

// Secret Key for JWT (Use environment variables in production)
const SECRET_KEY = "your_secret_key"; // Replace with .env variable

// **User Registration API**
export async function POST(req) {
    await connectDB();

    try {
        const { action, email, password, name,college, highestqualification, qualificationyear, SKey } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        if (action === "register") {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json({ message: "User already exists" }, { status: 400 });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user in DB
            const newUser = new User({ email, name, college, highestqualification, qualificationyear, password: hashedPassword, SKey });
            await newUser.save();

            return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
        }

        if (action === "login") {
            // Find the user
            const user = await User.findOne({ email });
            if (!user) {
                return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

            return NextResponse.json({ message: "Login successful", token, Skey: user.SKey, name: user.name, email: user.email }, { status: 200 });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// **User Update API**
export async function PATCH(req) {
    await connectDB();

    try {
        const { email, name, password, SKey } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required to update user data" }, { status: 400 });
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Update user fields
        if (name) user.name = name;
        if (SKey) user.SKey = SKey;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Save changes
        await user.save();

        return NextResponse.json({ message: "User updated successfully" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
