import { createError, defineEventHandler } from 'h3';
import { removeAuthCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    removeAuthCookie(event);

    return {
      statusCode: 200,
      body: { message: 'Logged out successfully' }
    };
  } catch (error) {
    console.error('Logout error:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});