import slugify from 'slugify';
import mongoose from 'mongoose';

interface SlugOptions {
  lower?: boolean;
  strict?: boolean;
  replacement?: string;
}

// Generate a slug from text
export const generateSlug = (text: string, options: SlugOptions = {}): string => {
  const defaultOptions: SlugOptions = {
    lower: true,
    strict: true,
    replacement: '-',
    ...options,
  };

  return slugify(text, defaultOptions);
};

// Generate unique slug by checking database
export const generateUniqueSlug = async (
  text: string,
  Model: mongoose.Model<any>,
  existingId?: string
): Promise<string> => {
  let slug = generateSlug(text);
  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    // Build query to check for existing slug
    const query: any = { slug: uniqueSlug };

    // If updating, exclude the current document
    if (existingId) {
      query._id = { $ne: existingId };
    }

    const existing = await Model.findOne(query);

    if (!existing) {
      break;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
};

export default {
  generateSlug,
  generateUniqueSlug,
};
