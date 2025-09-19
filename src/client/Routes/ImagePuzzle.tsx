import React, { useEffect, useRef, useState } from "react";
import { useGlobal } from "../hooks/globals";

interface PuzzlePiece {
  id: number;
  src: string;
  correctPosition: number;
  isUniform: boolean;
}

interface ImagePuzzle {
  goToPage: (page: string) => void; // navigation handler prop
}

export const ImagePuzzle: React.FC<ImagePuzzle> = ({ goToPage }) => {
  const [puzzleGrid, setPuzzleGrid] = useState<(PuzzlePiece | null)[]>(Array(9).fill(null));
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { exportedImg } = useGlobal();
  const imageUrl = exportedImg;
  const gridSize = 3;

  useEffect(() => {
    const isUniformColor = (
      imageData: ImageData,
      tolerance = 0,
      requiredMatchRatio = 0.95
    ): boolean => {
      const data = imageData.data;
      const len = data.length;
      const firstPixel = data.slice(0, 4);

      let matchCount = 0;
      const totalPixels = len / 4;

      for (let i = 0; i < len; i += 4) {
        let isPixelMatching = true;
        for (let channel = 0; channel < 4; channel++) {
          const currentPixelValue = data[i + channel];
          const firstPixelValue = firstPixel[channel];

          if (
            currentPixelValue === undefined ||
            firstPixelValue === undefined ||
            Math.abs(currentPixelValue - firstPixelValue) > tolerance
          ) {
            isPixelMatching = false;
            break;
          }
        }
        if (isPixelMatching) {
          matchCount++;
        }
      }

      return matchCount / totalPixels >= requiredMatchRatio;
    };

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const gridWidth = img.width / gridSize;
      const gridHeight = img.height / gridSize;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pieces: PuzzlePiece[] = [];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          canvas.width = gridWidth;
          canvas.height = gridHeight;
          ctx.clearRect(0, 0, gridWidth, gridHeight);
          ctx.imageSmoothingEnabled = false;

          ctx.drawImage(
            img,
            col * gridWidth,
            row * gridHeight,
            gridWidth,
            gridHeight,
            0,
            0,
            gridWidth,
            gridHeight
          );

          const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
          const uniform = isUniformColor(imageData, 10);

          const dataUrl = canvas.toDataURL();
          const pieceIndex = row * gridSize + col;

          pieces.push({
            id: pieceIndex,
            src: dataUrl,
            correctPosition: pieceIndex,
            isUniform: uniform,
          });
        }
      }

      const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
      setPuzzleGrid(shuffledPieces);
    };
  }, [imageUrl]);

  const handleDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    draggedPiece: PuzzlePiece,
    draggedIndex: number
  ) => {
    e.dataTransfer.setData("draggedPiece", JSON.stringify(draggedPiece));
    e.dataTransfer.setData("draggedIndex", draggedIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const draggedPiece = JSON.parse(e.dataTransfer.getData("draggedPiece")) as PuzzlePiece;
    const draggedIndex = parseInt(e.dataTransfer.getData("draggedIndex"));
    if (draggedIndex === targetIndex) return;

    const newGrid = [...puzzleGrid];
    const targetPiece = newGrid[targetIndex] ?? null;
    newGrid[targetIndex] = draggedPiece;
    newGrid[draggedIndex] = targetPiece;
    setPuzzleGrid(newGrid);
    checkCompletion(newGrid);
  };

  const checkCompletion = (grid: (PuzzlePiece | null)[]) => {
    setIsComplete(grid.every((p, i) => p?.correctPosition === i));
  };

 const postShuffledPuzzle = async () => {
  if (puzzleGrid.some(p => p === null)) {
    console.error('Cannot post—puzzle still loading.');
    return;
  }

  const piecesPayload = puzzleGrid.map(p => ({
    src: (p as PuzzlePiece).src,
    correctPosition: (p as PuzzlePiece).correctPosition,
  }));

  const payload = {
    puzzleId: `puzzle_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
    title: 'Untitled Puzzle',
    difficulty: 'Easy',
    pieces: piecesPayload,
  };

  console.log('Posting puzzle challenge payload:', payload);

  try {
    const res = await fetch('/api/create-puzzle-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.success) {
      console.log(`Puzzle posted successfully! View at: ${json.postUrl}`);
      goToPage('home');
    } else {
      console.error(`Error posting puzzle: ${json.message}`);
    }
  } catch (error) {
    console.error('Network or server error:', error);
  }
};



  const resetPuzzle = () => {
    setPuzzleGrid((prev) => [...prev].sort(() => Math.random() - 0.5));
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-10">
      <canvas ref={canvasRef} className="hidden" />

      {isComplete && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-retro text-green-400 drop-shadow-lg">
            🎉 Puzzle Complete! 🎉
          </h2>
          <button
            onClick={resetPuzzle}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
          >
            Shuffle Again
          </button>
        </div>
      )}

      <div
        className="grid p-4 bg-gray-800 rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 100px)`,
          gridTemplateRows: `repeat(${gridSize}, 100px)`,
        }}
      >
        {puzzleGrid.map((piece, idx) => (
          <div
            key={idx}
            className="w-24 h-24 bg-black border-2 border-gray-700"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {piece ? (
              <div className="relative w-full h-full">
                <img
                  src={piece.src}
                  alt={`Piece ${piece.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece, idx)}
                  className="w-full h-full object-cover image-pixelated"
                />
                {piece.isUniform && (
                  <div className="absolute top-1 left-1 text-xs text-gray-400 bg-black bg-opacity-50 rounded px-1 select-none pointer-events-none">
                    {piece.correctPosition}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 font-retro">
                Empty
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 mx-10 text-gray-400 font-retro text-xs text-center">
        Drag any piece onto another piece to swap positions
      </p>

      <button
        onClick={postShuffledPuzzle}
        className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
      >
        📤 Post This Puzzle Challenge
      </button>

      
    </div>
  );
};
