import { defineEventHandler } from 'h3';
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
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
});