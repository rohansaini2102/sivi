import { Request, Response } from 'express';
import Course from '../models/Course';
import TestSeries from '../models/TestSeries';
import User from '../models/User';
import Question from '../models/Question';
import Payment from '../models/Payment';
import logger from '../utils/logger';

// Global search across all entities
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q, types, limit = '5' } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query must be at least 2 characters', code: 'INVALID_QUERY' },
      });
    }

    const searchQuery = q.trim();
    const searchLimit = Math.min(parseInt(limit as string) || 5, 10);
    const searchRegex = new RegExp(searchQuery, 'i');

    // Determine which types to search
    const typesToSearch = types
      ? (types as string).split(',').map(t => t.trim().toLowerCase())
      : ['courses', 'test_series', 'users', 'questions', 'payments'];

    const results: any = {};
    const searchPromises: Promise<void>[] = [];

    // Search courses
    if (typesToSearch.includes('courses')) {
      searchPromises.push(
        Course.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { shortDescription: searchRegex },
          ],
        })
          .select('_id title thumbnail isPublished examCategory price')
          .limit(searchLimit)
          .lean()
          .then((courses) => {
            results.courses = courses;
          })
      );
    }

    // Search test series
    if (typesToSearch.includes('test_series')) {
      searchPromises.push(
        TestSeries.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { shortDescription: searchRegex },
          ],
        })
          .select('_id title thumbnail isPublished examCategory price')
          .limit(searchLimit)
          .lean()
          .then((testSeries) => {
            results.testSeries = testSeries;
          })
      );
    }

    // Search users
    if (typesToSearch.includes('users')) {
      searchPromises.push(
        User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
          ],
          role: 'user', // Only search regular users
        })
          .select('_id name email phone avatar isActive createdAt')
          .limit(searchLimit)
          .lean()
          .then((users) => {
            results.users = users;
          })
      );
    }

    // Search questions
    if (typesToSearch.includes('questions')) {
      searchPromises.push(
        Question.find({
          $or: [
            { question: searchRegex },
          ],
        })
          .select('_id question subject difficulty')
          .limit(searchLimit)
          .lean()
          .then((questions) => {
            results.questions = questions;
          })
      );
    }

    // Search payments
    if (typesToSearch.includes('payments')) {
      searchPromises.push(
        Payment.find({
          $or: [
            { razorpayOrderId: searchRegex },
            { razorpayPaymentId: searchRegex },
          ],
        })
          .select('_id razorpayOrderId razorpayPaymentId amount status createdAt')
          .populate('user', 'name email')
          .limit(searchLimit)
          .lean()
          .then((payments) => {
            results.payments = payments;
          })
      );
    }

    await Promise.all(searchPromises);

    // Calculate total results
    const totalResults = Object.values(results).reduce(
      (sum: number, arr: any) => sum + (arr?.length || 0),
      0
    );

    res.json({
      success: true,
      data: {
        ...results,
        totalResults,
      },
    });
  } catch (error: any) {
    logger.error('Global search error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'SEARCH_ERROR' },
    });
  }
};

export default {
  globalSearch,
};
