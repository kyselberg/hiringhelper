import { createError, defineEventHandler, readBody } from 'h3';
import { UserModel } from '../../models/user.model';
import { generateToken, setAuthCookie } from '../../utils/auth';

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    const body = await readBody(event);

    // Validate request body
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      });
    }

    const { email, password } = body as LoginRequestBody;

    // Validate required fields
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      });
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user || !user._id) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(user, password);
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      });
    }

    // Generate token and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    setAuthCookie(event, token);

    // Return only success response
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    };
  } catch (error: unknown) {
    console.error('Login error:', error);

    // If it's already a H3 error, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // For other errors, create a new H3 error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});