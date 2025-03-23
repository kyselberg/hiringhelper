import { defineEventHandler, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);

    // Find user by email
    const user = await UserModel.findByEmail(email);

    console.log('user =>', user);

    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Invalid email or password' }
      };
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(user, password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: { message: 'Invalid email or password' }
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
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
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
});