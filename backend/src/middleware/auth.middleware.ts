import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import User from '../models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        mustChangePassword?: boolean;
      };
    }
  }
}

// Authenticate user from JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('isActive mustChangePassword role');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive' },
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      mustChangePassword: user.mustChangePassword,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error' },
    });
  }
};

// Check if user has required role
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Insufficient permissions.' },
      });
    }

    next();
  };
};

// Check if admin must change password (block other routes except change-password)
export const checkPasswordChange = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.mustChangePassword && !req.path.includes('change-password')) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Password change required',
        code: 'PASSWORD_CHANGE_REQUIRED',
      },
    });
  }

  next();
};

// Optional authentication - attach user if token exists, continue if not
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (decoded) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
