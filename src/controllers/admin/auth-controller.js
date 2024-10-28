import authRepository from "../../repository/auth-repository.js";
class AuthController{
    constructor(){
        this.authRepository=authRepository;
    }
    async login(email, password, res) {
        try { 
            
            const admin = await this.authRepository.findAdminByEmail(email);
            if (!admin) {
                throw new Error("Invalid credentials");
            }

            const isValid = await bcrypt.compare(password, admin.password);
            if (!isValid) {
                throw new Error("Invalid credentials");
            }

            const token = jwt.sign(
                { adminId: admin.id },
                process.env.JWT_SECRET,
                { expiresIn: `${THIRTY_DAYS_IN_SECONDS}s` }
            );  

            res.cookie("adminToken", token, {
                httpOnly: true,
                maxAge: THIRTY_DAYS_IN_SECONDS * 1000,
                sameSite: "lax",
                secure: false,
                path: "/",
            });

            return "Authentication successful";
        } catch (error) {
            console.error("Login error:", error);
            throw new Error("Authentication failed");
        }
    }

}

export default new AuthController();