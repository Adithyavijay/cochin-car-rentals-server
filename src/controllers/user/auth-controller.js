import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import FileService from "../../services/file-service.js";
import { prisma } from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";

class AuthController {
    constructor() {
        this.otpStore = new Map(); // Temporary storage for OTPs
    }
    /**
     * @desc Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} Registered user object (without password)
     */

    async registerUser(res, userData) {
        try {
            const {
                name,
                email,
                phone,
                city,
                state,
                country,
                pincode,
                password,
                profilePicture,
            } = userData;

            // Check if user already exists
            const existingUser = await prisma.User.findUnique({
                where: { phone },
            });
            if (existingUser) {
                throw new Error("User with this phone number already exists");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            let profilePictureUrl = null;
            if (profilePicture) {
                // Upload profile picture
                profilePictureUrl = await FileService.uploadFile(
                    profilePicture,
                    "profile-pictures"
                );
            }


            // Create user
            const newUser = await prisma.User.create({
                data: {
                    name,
                    email,
                    phone,
                    city,
                    state,
                    country,
                    pincode,
                    password: hashedPassword,
                    profilePicture: profilePictureUrl,
                },
            });

            // Generate JWT token
            const token = jwt.sign(
                { userId: newUser.id },
                process.env.JWT_SECRET,
                { expiresIn: "1d" } // Token expires in 1 day
            );

            // Set cookie
            res.cookie("user_token", token, {
                httpOnly: true,
                secure: false, // Use secure cookies in production
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
                
                // 1 day
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (err) {
            console.log(err);
        }
    } 


   /**
     * @desc Handle user login process
     * @param {Object} res - Express response object for cookie setting
     * @param {Object} loginData - User login credentials
     * @param {string} loginData.email - User's email
     * @param {string} loginData.password - User's password
     * @returns {Object} Login response object
     * @throws {AuthenticationError} If login fails
     */
   async loginUser(res, { email, password }) {
    try {
        // 1. Find user by email
        const user = await prisma.User.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                profilePicture: true,
                city: true,
                state: true,
                country: true,
                phone: true
            }
        });

        // 2. Check if user exists
        if (!user) {
            throw new AuthenticationError("Invalid email or password");
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError("Invalid email or password");
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // 5. Set HTTP-only cookie
        res.cookie('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:  30*24 * 60 * 60 * 1000 // 30 days
        });

        // 6. Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        // 7. Return success response
        return {
            success: true,
            message: "Login successful",
            user: userWithoutPassword
        };

    } catch (error) {
        console.error("Login controller error:", error);
        
        if (error instanceof AuthenticationError) {
            throw error;
        }

        throw new Error("An error occurred during login. Please try again later.");
    }
}
}

export default new AuthController();
