import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateTokens, setTokenCookies } from "../utils/generateTokens.js";

// @desc    Register a new user
// @route   POST /api/auth/register
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Create user
        const user = new User({ name, email, password });
        await user.save();

        // Generate tokens and set cookies
        const { accessToken, refreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in register controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Login user
// @route   POST /api/auth/login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate tokens and set cookies
        const { accessToken, refreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
export async function logout(req, res) {
    try {
        res.cookie("accessToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
        });

        res.cookie("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get current authenticated user
// @route   GET /api/auth/me
export async function getMe(req, res) {
    try {
        const user = req.user;

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in getMe controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh-token
export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No refresh token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, newRefreshToken);

        res.status(200).json({ message: "Token refreshed successfully" });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized - Refresh token expired, please login again" });
        }
        console.error("Error in refreshToken controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
