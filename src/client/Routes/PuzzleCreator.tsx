// src/client/Routes/PuzzleCreator.tsx
import React, { useState } from 'react';

interface PuzzleCreatorProps {
  pixelData: number[][];
  onPuzzleCreated: (title: string, difficulty: string, pixelData: number[][]) => void;
  goToPage: (page: string) => void;
}

export const PuzzleCreator: React.FC<PuzzleCreatorProps> = ({
  pixelData,
  onPuzzleCreated,
  goToPage
}) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your puzzle');
      return;
    }

    if (!pixelData || pixelData.length === 0) {
      alert('No pixel data found. Please create your art first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPuzzleCreated(title, difficulty, pixelData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create preview of pixel art
  const renderPixelPreview = () => {
    if (!pixelData || pixelData.length === 0) return null;
    
    return (
      <div className="grid gap-1 mx-auto" style={{ 
        gridTemplateColumns: `repeat(${pixelData[0]?.length || 8}, 1fr)`,
        maxWidth: '200px'
      }}>
        {pixelData.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="aspect-square"
              style={{
                backgroundColor: pixel === 1 ? '#ffffff' : '#000000',
                border: '1px solid #333'
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧩 Create Puzzle Challenge
        </h1>

        {/* Preview of pixel art */}
        <div className="mb-8">
          <h2 className="text-xl mb-4 text-center">Your Pixel Art:</h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            {renderPixelPreview()}
          </div>
        </div>

        {/* Puzzle details form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Puzzle Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Give your puzzle a catchy title..."
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              disabled={isSubmitting}
            >
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
              <option value="Expert">💀 Expert</option>
            </select>
          </div>

          <div className="bg-blue-900 p-4 rounded-lg">
            <h3 className="font-bold mb-2">📝 What happens next:</h3>
            <ul className="text-sm space-y-1">
              <li>• Your puzzle will be posted to the subreddit</li>
              <li>• Other users can find and play your puzzle</li>
              <li>• Players who solve it can create their own challenges</li>
              <li>• You'll get credit as the puzzle creator</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => goToPage('board')}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              ← Edit Pixel Art
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? '🚀 Creating...' : '🚀 Create Challenge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
