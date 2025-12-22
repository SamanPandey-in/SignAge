/**
 * Lesson Data
 * Contains all lesson content for sign language learning
 * Each lesson includes title, description, signs, and difficulty level
 */

/**
 * Lesson categories and their metadata
 */
export const LESSON_CATEGORIES = {
  BASICS: {
    id: 'basics',
    title: 'Basics',
    description: 'Start with fundamental signs',
    icon: '👋',
    color: '#4A90E2',
  },
  ALPHABET: {
    id: 'alphabet',
    title: 'Alphabet',
    description: 'Learn fingerspelling A-Z',
    icon: '🔤',
    color: '#50C878',
  },
  NUMBERS: {
    id: 'numbers',
    title: 'Numbers',
    description: 'Count in sign language',
    icon: '🔢',
    color: '#FF6B6B',
  },
  COMMON_PHRASES: {
    id: 'common_phrases',
    title: 'Common Phrases',
    description: 'Everyday expressions',
    icon: '💬',
    color: '#FFA500',
  },
};

/**
 * Individual lesson content
 * Each lesson contains multiple signs to practice
 */
export const LESSONS = [
  {
    id: 'lesson_1',
    categoryId: 'basics',
    title: 'Greetings',
    description: 'Learn how to greet people in sign language',
    difficulty: 'Beginner',
    duration: '10 min',
    completed: false,
    signs: [
      {
        id: 'hello',
        word: 'Hello',
        description: 'Wave your hand with palm facing outward',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Raise your hand to head level',
          'Keep palm facing outward',
          'Wave hand side to side gently',
        ],
      },
      {
        id: 'goodbye',
        word: 'Goodbye',
        description: 'Wave your hand while closing and opening palm',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Raise your hand to shoulder level',
          'Start with palm open',
          'Close and open palm repeatedly',
        ],
      },
      {
        id: 'thank_you',
        word: 'Thank You',
        description: 'Move hand from chin forward',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Place fingertips on chin',
          'Keep palm facing you',
          'Move hand forward and slightly down',
        ],
      },
    ],
  },
  {
    id: 'lesson_2',
    categoryId: 'basics',
    title: 'Basic Needs',
    description: 'Express your basic needs',
    difficulty: 'Beginner',
    duration: '12 min',
    completed: false,
    signs: [
      {
        id: 'help',
        word: 'Help',
        description: 'Closed fist on open palm, raise together',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Make a fist with one hand',
          'Place it on your open palm',
          'Raise both hands together',
        ],
      },
      {
        id: 'please',
        word: 'Please',
        description: 'Circular motion over chest with open palm',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Place open palm on chest',
          'Move hand in circular motion',
          'Keep motion smooth and gentle',
        ],
      },
    ],
  },
  {
    id: 'lesson_3',
    categoryId: 'alphabet',
    title: 'Letters A-G',
    description: 'Master the first letters of the alphabet',
    difficulty: 'Beginner',
    duration: '15 min',
    completed: false,
    signs: [
      {
        id: 'letter_a',
        word: 'A',
        description: 'Closed fist with thumb on side',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Make a closed fist',
          'Place thumb against side of fist',
          'Palm faces forward',
        ],
      },
      {
        id: 'letter_b',
        word: 'B',
        description: 'Flat hand with thumb across palm',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Extend fingers upward',
          'Keep fingers together',
          'Tuck thumb across palm',
        ],
      },
      {
        id: 'letter_c',
        word: 'C',
        description: 'Curved hand forming letter C',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Curve all fingers',
          'Form a C shape with hand',
          'Thumb curves toward fingers',
        ],
      },
    ],
  },
  {
    id: 'lesson_4',
    categoryId: 'numbers',
    title: 'Numbers 1-5',
    description: 'Learn to count from one to five',
    difficulty: 'Beginner',
    duration: '8 min',
    completed: false,
    signs: [
      {
        id: 'number_1',
        word: '1',
        description: 'Index finger extended upward',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Extend index finger',
          'Keep other fingers closed',
          'Palm faces forward',
        ],
      },
      {
        id: 'number_2',
        word: '2',
        description: 'Index and middle finger extended',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Extend index and middle finger',
          'Keep them separated',
          'Other fingers remain closed',
        ],
      },
    ],
  },
  {
    id: 'lesson_5',
    categoryId: 'common_phrases',
    title: 'Daily Expressions',
    description: 'Common phrases for daily use',
    difficulty: 'Intermediate',
    duration: '20 min',
    completed: false,
    signs: [
      {
        id: 'how_are_you',
        word: 'How are you?',
        description: 'Combination of multiple signs',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Sign "HOW" with hands together',
          'Sign "YOU" by pointing',
          'Combine in sequence',
        ],
      },
      {
        id: 'nice_to_meet_you',
        word: 'Nice to meet you',
        description: 'Combination gesture expressing pleasure',
        videoUrl: 'placeholder_video_url',
        imageUrl: 'placeholder_image_url',
        instructions: [
          'Sign "NICE" at chest level',
          'Sign "MEET" with hands coming together',
          'Sign "YOU" by pointing',
        ],
      },
    ],
  },
];

/**
 * Get lessons by category
 * @param {string} categoryId - The category ID to filter by
 * @returns {Array} Array of lessons in that category
 */
export const getLessonsByCategory = (categoryId) => {
  return LESSONS.filter(lesson => lesson.categoryId === categoryId);
};

/**
 * Get lesson by ID
 * @param {string} lessonId - The lesson ID
 * @returns {Object|null} The lesson object or null if not found
 */
export const getLessonById = (lessonId) => {
  return LESSONS.find(lesson => lesson.id === lessonId) || null;
};

/**
 * Progress tracking constants
 */
export const PROGRESS_CONSTANTS = {
  MIN_ACCURACY_FOR_COMPLETION: 80, // 80% accuracy required to complete a sign
  PRACTICE_ATTEMPTS_PER_SIGN: 3,    // Number of attempts per sign
  STARS_FOR_COMPLETION: 3,           // Maximum stars per lesson
};
