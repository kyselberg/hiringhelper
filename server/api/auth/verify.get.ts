import { createError, defineEventHandler, getHeader } from 'h3';
import { UserModel } from '../../models/user.model';
import { verifyToken } from '../../utils/auth';

interface VerifyResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default defineEventHandler(async (event): Promise<VerifyResponse> => {
  try {
    const authHeader = getHeader(event, 'Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    // Get user data from database
    const user = await UserModel.findById(payload.userId);
    if (!user || !user._id) {
      throw createError({
        statusCode: 401,
        message: 'User not found'
      });
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    };
  } catch (error: unknown) {
    console.error('Token verification error:', error);

    // If it's already a H3 error, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // For other errors, create a new H3 error
    throw createError({
      statusCode: 401,
      message: error instanceof Error ? error.message : 'Invalid or expired token'
    });
  }
});