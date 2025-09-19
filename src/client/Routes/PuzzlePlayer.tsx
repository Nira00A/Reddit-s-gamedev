// src/client/Routes/PuzzlePlayer.tsx
import React, { useState, useEffect } from 'react';
import { ImagePuzzle } from './ImagePuzzle';

interface PuzzlePlayerProps {
  puzzleData: any;
  onPuzzleCompleted: (puzzleId: string, completionTime: number) => void;
  goToPage: (page: string) => void;
}

export const PuzzlePlayer: React.FC<PuzzlePlayerProps> = ({
  puzzleData,
  onPuzzleCompleted,
  goToPage
}) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
    setIsCompleted(false);
  }, [puzzleData]);

  const handlePuzzleComplete = () => {
    if (isCompleted) return;
    
    const completionTime = Math.floor((Date.now() - startTime) / 1000);
    setIsCompleted(true);
    
    // Call the completion handler
    if (puzzleData?.puzzleId) {
      onPuzzleCompleted(puzzleData.puzzleId, completionTime);
    }
  };

  if (!puzzleData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No puzzle selected</h2>
          <button
            onClick={() => goToPage('home')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Puzzle header */}
      <div className="p-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{puzzleData.title}</h1>
            <p className="text-gray-400">
              Created by u/{puzzleData.creatorUsername} • {puzzleData.difficulty}
            </p>
          </div>
          <button
            onClick={() => goToPage('home')}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Pass modified ImagePuzzle component */}
      <ImagePuzzleWrapper 
        puzzleData={puzzleData}
        onComplete={handlePuzzleComplete}
        goToPage={goToPage}
      />
    </div>
  );
};

// Wrapper to modify your existing ImagePuzzle component
const ImagePuzzleWrapper: React.FC<{
  puzzleData: any;
  onComplete: () => void;
  goToPage: (page: string) => void;
}> = ({ puzzleData, onComplete, goToPage }) => {
  // You would modify your existing ImagePuzzle component to:
  // 1. Accept puzzle data as prop instead of getting from global context
  // 2. Call onComplete when puzzle is solved
  // 3. Generate image from pixelData if needed
  
  // For now, return your existing ImagePuzzle component
  // You'll need to modify it to work with the provided puzzle data
  return <ImagePuzzle goToPage={goToPage} />;
};
