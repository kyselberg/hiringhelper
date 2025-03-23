import bcrypt from 'bcryptjs';
import { defineEventHandler, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 400,
        body: { message: 'User with this email already exists' }
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 201,
      body: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
});