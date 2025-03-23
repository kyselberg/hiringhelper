import { createError, defineEventHandler } from 'h3';
import { UserModel } from '../../models/user.model';
import { getAuthCookie, verifyToken } from '../../utils/auth';

interface VerifyResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default defineEventHandler(async (event): Promise<VerifyResponse> => {
  try {
    const token = getAuthCookie(event);
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'No authentication token found'
      });
    }

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
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    });
  }
});