import { quizService } from './quizService';
import { weeklyQuizzes } from '../data/quizData';

export const initializeFirebaseData = async () => {
  try {
    console.log('Starting database initialization...');
    await quizService.initializeQuizzes(weeklyQuizzes);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}; 