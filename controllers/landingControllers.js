const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt=require('bcrypt');
const Schedule= require("../models/scheduleModel");


exports.registerPageController=async(req,res)=>{
    res.render('registerPage');
}

exports.postregisterPageController=async(req,res)=>{
    try {
        const { name, email, password, role } = req.body;
    
     
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, message: "Email already registered" });
        }
    
        const hashed = await bcrypt.hash(password, 10);
    
        const newUser = new User({ name, email, password: hashed, role });
        await newUser.save();
    
        console.log("User registered successfully");

        return res.render("loginPage")
      } 
      
      catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" });
      }
}


exports.loginPageController=async(req,res)=>{
    res.render('loginPage');
}


exports.postloginPageController = async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );

      // Set cookie
      res.cookie("token", token, { httpOnly: true });

      if (user.role === "instructor") {
          const schedules = await Schedule.find({ instructor: user._id });
          return res.status(200).json({ 
              success: true, 
              message: "Login successful",
              role: "instructor",
              user,
              schedules
          });
      } else {
          return res.status(200).json({ 
              success: true, 
              message: "Login successful",
              role: "student",
              user
          });
      }

  } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Login failed", error });
  }
};


exports.logoutPageController=async(req,res)=>{
    res.cookie("token","");
    return res.status(200).json({ 
      success: true, 
      message: "Logged out"
  });
}