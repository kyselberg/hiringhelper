import { defineEventHandler, getHeader } from 'h3';
import { UserModel } from '../../models/user.model';
import { verifyToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
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
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'User not found'
      });
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    });
  }
});