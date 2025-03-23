import { createError, defineEventHandler, readBody } from 'h3';
import { UserModel } from '../../models/user.model';
import { generateToken, setAuthCookie } from '../../utils/auth';

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default defineEventHandler(async (event): Promise<RegisterResponse> => {
  try {
    const body = await readBody(event);

    // Validate request body
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body'
      });
    }

    const { email, password, name } = body as RegisterRequestBody;

    // Validate required fields
    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: 'Email, password and name are required'
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

    // Create new user
    const user = await UserModel.create({
      email,
      password,
      name
    });

    if (!user._id) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create user'
      });
    }

    // Generate token and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    setAuthCookie(event, token);

    // Return success response
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    };
  } catch (error: unknown) {
    console.error('Registration error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      switch (error.message) {
        case 'Email already exists':
          throw createError({
            statusCode: 400,
            message: 'User with this email already exists'
          });
        case 'Invalid email format':
          throw createError({
            statusCode: 400,
            message: 'Invalid email format'
          });
        case 'Password must be at least 8 characters long':
          throw createError({
            statusCode: 400,
            message: 'Password must be at least 8 characters long'
          });
        case 'Name must be between 2 and 50 characters':
          throw createError({
            statusCode: 400,
            message: 'Name must be between 2 and 50 characters'
          });
      }
    }

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