import { defineEventHandler, readBody } from 'h3';
import { UserModel } from '../../models/user.model';
import { generateToken, setAuthCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event);

    // Create new user
    const user = await UserModel.create({
      email,
      password,
      name
    });

    if (!user._id) {
      throw new Error('Failed to create user');
    }

    // Generate token and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    setAuthCookie(event, token);

    return {
      statusCode: 201,
      body: {
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