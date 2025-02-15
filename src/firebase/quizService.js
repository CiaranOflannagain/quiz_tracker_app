import { db } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  query,
  orderBy,
  writeBatch 
} from 'firebase/firestore';

export const quizService = {
  // Get all quizzes
  getQuizzes: async () => {
    try {
      console.log('Getting quizzes from Firestore...');
      const quizCollection = collection(db, 'quizzes');
      console.log('Quiz collection reference:', quizCollection);
      
      const q = query(quizCollection, orderBy('dayOfWeek'), orderBy('time'));
      console.log('Query created:', q);
      
      const snapshot = await getDocs(q);
      console.log('Snapshot received:', snapshot);
      
      const quizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Processed quizzes:', quizzes);
      
      return quizzes;
    } catch (error) {
      console.error('Error in getQuizzes:', error);
      throw error;
    }
  },

  // Update a quiz
  updateQuiz: async (quizId, quizData) => {
    try {
      const quizRef = doc(db, 'quizzes', quizId.toString());
      await updateDoc(quizRef, quizData);
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Initialize database with default quizzes
  initializeQuizzes: async (defaultQuizzes) => {
    try {
      console.log('Starting initialization with:', defaultQuizzes);
      
      // Create a new batch
      const batch = writeBatch(db);
      
      // Add each quiz to the batch
      for (const quiz of defaultQuizzes) {
        const quizRef = doc(db, 'quizzes', quiz.id.toString());
        batch.set(quizRef, {
          venue: quiz.venue,
          dayOfWeek: quiz.dayOfWeek,
          time: quiz.time,
          type: quiz.type,
          price: quiz.price,
          address: quiz.address,
          description: quiz.description
        });
      }
      
      // Commit the batch
      await batch.commit();
      console.log('Database initialized with default quizzes');
    } catch (error) {
      console.error('Error initializing quizzes:', error);
      throw error;
    }
  }
}; 