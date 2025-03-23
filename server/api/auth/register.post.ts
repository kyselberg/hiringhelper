import { defineEventHandler, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event);

    // Create new user
    const user = await UserModel.create({
      email,
      password,
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
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific error cases
    if (error.message === 'Email already exists') {
      return {
        statusCode: 400,
        body: { message: 'User with this email already exists' }
      };
    }

    if (error.message === 'Invalid email format') {
      return {
        statusCode: 400,
        body: { message: 'Invalid email format' }
      };
    }

    if (error.message === 'Password must be at least 8 characters long') {
      return {
        statusCode: 400,
        body: { message: 'Password must be at least 8 characters long' }
      };
    }

    if (error.message === 'Name must be between 2 and 50 characters') {
      return {
        statusCode: 400,
        body: { message: 'Name must be between 2 and 50 characters' }
      };
    }

    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
});