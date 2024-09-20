import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req, res) => {
   try {
      const { fullName, username, password, confirmPassword, gender } = req.body;

      const missingFields = [];
      if (!fullName) missingFields.push('fullName');
      if (!username) missingFields.push('username');
      if (!password) missingFields.push('password');
      if (!confirmPassword) missingFields.push('confirmPassword');
      if (!gender) missingFields.push('gender');

      if (missingFields.length > 0) {
         return res.status(400).json({
            error: 'Missing required fields',
            missingFields,
         });
      }

      if (password !== confirmPassword) {
         return res.status(400).json({
            error: "Password don't match",
         });
      }

      const user = await User.findOne({ username });
      if (user) {
         return res.status(400).json({
            error: 'User already exists',
         });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const boyProfileImg = `https://avatar.iran.liara.run/public/boy?username=${username}`;
      const girlProfileImg = `https://avatar.iran.liara.run/public/girl?username=${username}`;

      const newUser = new User({
         fullName,
         username,
         password: hashedPassword,
         gender,
         porfileImg: gender === 'male' ? boyProfileImg : girlProfileImg,
      });

      if (newUser) {
         // JWT generate
         const token = generateTokenAndSetCookie(newUser._id, res);
         await newUser.save();
         res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            porfileImg: newUser.porfileImg,
         });
      } else {
         res.status(400).json({ error: 'Invalid user data' });
      }
   } catch (error) {
      console.log('Error in signup controller', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

export const login = async (req, res) => {
   try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
         return res.status(400).json({ error: 'Invalid username' });
      }
      const isPasswordCorrect = await bcrypt.compare(password, user?.password || '');

      if (!isPasswordCorrect) {
         return res.status(400).json({ error: 'Invalid password' });
      }

      generateTokenAndSetCookie(user._id, res);

      res.status(200).json({
         _id: user._id,
         fullName: user.fullName,
         username: user.username,
         porfileImg: user.porfileImg,
      });
   } catch (error) {
      console.log('Error in login controller', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

export const logout = async (req, res) => {
   try {
      res.cookie('jwt', '', { maxAge: 0 });
      res.status(200).json({ message: 'Logged out successfully' });
   } catch (error) {
      console.log('Error in logout controller', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};
