import { createError, defineEventHandler } from 'h3';
import { removeAuthCookie } from '../../utils/auth';

interface LogoutResponse {
  message: string;
}

export default defineEventHandler(async (event): Promise<LogoutResponse> => {
  try {
    removeAuthCookie(event);

    return {
      message: 'Logged out successfully'
    };
  } catch (error: unknown) {
    console.error('Logout error:', error);

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