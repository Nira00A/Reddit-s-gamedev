// src/client/App.tsx
import React, { useState, useCallback } from 'react';
import { Home } from './Routes/Home';
import { DisplayBoard } from './Drawing pallet/drawingBoard';
import { HelpPage } from './Help/help';
import { ImagePuzzle } from './Routes/ImagePuzzle';
import { PuzzleCreator } from './Routes/PuzzleCreator';
import { PuzzlePlayer } from './Routes/PuzzlePlayer';

export default function App() {
  const [page, setPage] = useState('home');
  const [pixelData, setPixelData] = useState<number[][]>([]);
  const [currentPuzzleData, setCurrentPuzzleData] = useState<any>(null);

  const goToPage = (pageName: string) => setPage(pageName);

  // Handle when user completes drawing and wants to create puzzle
  const handleCreatePuzzle = useCallback((finalPixelData: number[][]) => {
    setPixelData(finalPixelData);
    goToPage('puzzle-creator');
  }, []);

  // Handle puzzle creation and posting
  const handlePuzzleCreated = useCallback(async (
    title: string, 
    difficulty: string,
    finalPixelData: number[][]
  ) => {
    try {
      const response = await fetch('/api/create-puzzle-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pixelData: finalPixelData,
          title,
          difficulty,
          creatorUsername: 'current-user' // In real app, get from Devvit context
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`🎉 Puzzle challenge created successfully!\n\nPost URL: ${result.postUrl}\n\nShare this with others to play your puzzle!`);
        goToPage('home');
      } else {
        alert(`❌ Error creating puzzle: ${result.message}`);
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      alert(`❌ Network error: ${errorMessage}`);
    }
  }, []);

  // Handle when someone wants to play a specific puzzle
  const handlePlayPuzzle = useCallback((puzzleData: any) => {
    setCurrentPuzzleData(puzzleData);
    goToPage('puzzle-player');
  }, []);

  // Handle puzzle completion
  const handlePuzzleCompleted = useCallback(async (puzzleId: string, completionTime: number) => {
    try {
      const response = await fetch(`/api/puzzle/${puzzleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerUsername: 'current-user', // In real app, get from Devvit context
          completionTime
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Show completion message with option to create own puzzle
        const createOwn = confirm(
          `🎉 Congratulations! You solved the puzzle!\n\n${result.encouragement}\n\nWould you like to create your own puzzle challenge now?`
        );
        
        if (createOwn) {
          goToPage('board'); // Take them to drawing board
        } else {
          goToPage('home');
        }
      }
    } catch (error) {
      console.error('Error recording completion:', error);
      // Still show success message to user
      const createOwn = confirm(
        `🎉 Congratulations! You solved the puzzle!\n\nWould you like to create your own puzzle challenge?`
      );
      
      if (createOwn) {
        goToPage('board');
      } else {
        goToPage('home');
      }
    }
  }, []);

  const HomePage = () => (
    <Home
      goToPage={goToPage}
      onLeaderboards={() => goToPage('leaderboards')}
      onHowToPlay={() => goToPage('help')}
    />
  );

  const BoardPage = () => (
    <DisplayBoard
    goToPage={goToPage}
    onCreatePuzzle={(data) => {
    console.log('Creating puzzle with data:', data);
    // Convert string[][] to number[][]
    const numericData = data.map(row => row.map(cell => Number(cell)));
    setPixelData(numericData);
    console.log('Pixel data received from board:', data);
    goToPage('puzzle-creator');
  }}
/>
  );

  const PuzzleCreatorPage = () => (
    <PuzzleCreator
      pixelData={pixelData}
      onPuzzleCreated={handlePuzzleCreated}
      goToPage={goToPage}
    />
  );

  const PuzzlePlayerPage = () => (
    <PuzzlePlayer
      puzzleData={currentPuzzleData}
      onPuzzleCompleted={handlePuzzleCompleted}
      goToPage={goToPage}
    />
  );

  return (
    <div>
      {page === 'home' && <HomePage />}
      {page === 'board' && <BoardPage />}
      {page === 'help' && <HelpPage goToPage={goToPage} />}
      {page === 'imagePuzzle' && <ImagePuzzle goToPage={goToPage} />}
      {page === 'puzzle-creator' && <PuzzleCreatorPage />}
      {page === 'puzzle-player' && <PuzzlePlayerPage />}
    </div>
  );
}
