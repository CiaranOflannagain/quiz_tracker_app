import './App.css';
import { useState, useEffect } from 'react';
import { weeklyQuizzes } from './data/quizData';
import { quizService } from './firebase/quizService';
import { initializeFirebaseData } from './firebase/initializeData';

function App() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load quizzes from Firebase
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const loadedQuizzes = await quizService.getQuizzes();
        if (loadedQuizzes.length === 0) {
          // Initialize with default quizzes if empty
          await quizService.initializeQuizzes(weeklyQuizzes);
          setQuizzes(weeklyQuizzes);
        } else {
          setQuizzes(loadedQuizzes);
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Reorder weekdays to start with Monday
  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // Create time slots from 18:00 (6 PM) to 00:00 (midnight)
  const timeSlots = Array.from({ length: 7 }, (_, i) => {
    const hour = i + 18;
    return `${hour === 24 ? '00' : hour}:00`;
  });

  const getQuizzesForDay = (dayOfWeek) => {
    // Use quizzes state instead of weeklyQuizzes
    const adjustedDay = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    return quizzes
      .filter(quiz => quiz.dayOfWeek === adjustedDay)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getQuizPosition = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 18; // 6 PM
    const totalMinutes = (hours - startHour) * 60 + minutes;
    return (totalMinutes / 60) * 100; // 100px per hour
  };

  const handleEditQuiz = (quiz) => {
    setEditedQuiz({...quiz});
    setSelectedQuiz(null);
  };

  const handleSaveEdit = async () => {
    if (!editedQuiz) return;
    
    try {
      await quizService.updateQuiz(editedQuiz.id, editedQuiz);
      const updatedQuizzes = quizzes.map(quiz => 
        quiz.id === editedQuiz.id ? editedQuiz : quiz
      );
      setQuizzes(updatedQuizzes);
      setEditedQuiz(null);
    } catch (error) {
      console.error('Error saving quiz:', error);
      // Add error handling UI here
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedQuiz(prev => ({
      ...prev,
      [name]: name === 'dayOfWeek' ? parseInt(value) : value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div className="editor-toggle">
        <button 
          className={`toggle-button ${isEditorMode ? 'active' : ''}`}
          onClick={() => setIsEditorMode(!isEditorMode)}
        >
          {isEditorMode ? 'Exit Editor' : 'Editor Mode'}
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="init-container">
          <p>No quizzes found in database</p>
          <button 
            className="init-button"
            onClick={initializeFirebaseData}
          >
            Initialize Database
          </button>
        </div>
      ) : (
        <div className="container">
          <div className="schedule-container">
            <div className="time-axis">
              {timeSlots.map(time => (
                <div key={time} className="time-slot">
                  {time}
                </div>
              ))}
            </div>
            
            <div className="week-grid">
              {weekDays.map((day, index) => {
                const dayQuizzes = getQuizzesForDay(index);
                const isToday = (new Date().getDay() || 7) - 1 === index;
                
                // Group quizzes by time
                const quizzesByTime = dayQuizzes.reduce((acc, quiz) => {
                  acc[quiz.time] = acc[quiz.time] || [];
                  acc[quiz.time].push(quiz);
                  return acc;
                }, {});
                
                return (
                  <div key={day} className={`day-column ${isToday ? 'today' : ''}`}>
                    <div className="day-header">{day}</div>
                    <div className="quiz-list">
                      {dayQuizzes.map((quiz, quizIndex) => {
                        const sameTimeQuizzes = quizzesByTime[quiz.time];
                        const quizPosition = sameTimeQuizzes.indexOf(quiz);
                        const verticalOffset = quizPosition * 40; // Stack vertically with 40px offset
                        
                        return (
                          <div 
                            key={quiz.id}
                            className="quiz-card"
                            style={{
                              top: `${getQuizPosition(quiz.time) + verticalOffset}px`,
                            }}
                            onClick={() => setSelectedQuiz(quiz)}
                          >
                            <div className="quiz-venue">{quiz.venue}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedQuiz && !editedQuiz && (
            <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedQuiz(null)}>×</button>
                <h2>{selectedQuiz.venue}</h2>
                <div className="quiz-info">
                  <div className="info-row">
                    <span className="label">Time:</span>
                    <span>{selectedQuiz.time}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span>{selectedQuiz.type}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Price:</span>
                    <span>{selectedQuiz.price}</span>
                  </div>
                  <div className="info-row address">
                    <span className="label">Address:</span>
                    <span>{selectedQuiz.address}</span>
                  </div>
                  <div className="info-row description">
                    <span className="label">Description:</span>
                    <span>{selectedQuiz.description}</span>
                  </div>
                  {isEditorMode && (
                    <button 
                      className="edit-button"
                      onClick={() => handleEditQuiz(selectedQuiz)}
                    >
                      Edit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {editedQuiz && (
            <div className="modal-overlay">
              <div className="modal-content edit-mode">
                <button className="modal-close" onClick={() => setEditedQuiz(null)}>×</button>
                <h2>Edit Quiz</h2>
                <div className="edit-form">
                  <div className="form-group">
                    <label>Venue Name:</label>
                    <input
                      name="venue"
                      value={editedQuiz.venue}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Day:</label>
                    <select
                      name="dayOfWeek"
                      value={editedQuiz.dayOfWeek}
                      onChange={handleInputChange}
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time:</label>
                    <input
                      type="time"
                      name="time"
                      value={editedQuiz.time}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type:</label>
                    <input
                      name="type"
                      value={editedQuiz.type}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <input
                      name="price"
                      value={editedQuiz.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address:</label>
                    <input
                      name="address"
                      value={editedQuiz.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={editedQuiz.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="edit-actions">
                    <button 
                      className="cancel-button"
                      onClick={() => setEditedQuiz(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-button"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
