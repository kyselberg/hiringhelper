import { defineEventHandler, readBody } from 'h3';
import { UserModel } from '../../models/user.model';
import { generateToken, setAuthCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);

    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user || !user._id) {
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

    // Generate token and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    setAuthCookie(event, token);

    return {
      statusCode: 200,
      body: {
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