import { useState, useEffect, useRef } from "react";
import { Pallet } from "./pallet";
import { Board } from "./board";
import { useGlobal } from "../hooks/globals";

interface DisplayBoardProps {
  goToPage: (page: string) => void; // Function prop to navigate pages
  onCreatePuzzle?: (pixelData: string[][]) => void;
}

export function DisplayBoard({ goToPage , onCreatePuzzle}: DisplayBoardProps) {
  const [boardWidth, setBoardWidth] = useState<number>(16);
  const [boardHeight, setBoardHeight] = useState<number>(16);
  const [currentColor, setCurrentColor] = useState<string>("#fff");
  const boardRef = useRef<HTMLDivElement | null>(null);
  const { setExportedImg } = useGlobal();
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [currentPixelData, setCurrentPixelData] = useState<string[][]>(
  Array(boardHeight).fill(null).map(() => Array(boardWidth).fill("#fff"))
);
  const [pixelData, setPixelData] = useState<string[]>(
    new Array(boardWidth * boardHeight).fill("#fff")
  );


  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (time >= 60) {
      handleSave();
      setTimerActive(false);
    }
  }, [time]);

  function handleSave() {
    if (!boardRef.current) return;
    const boardDiv = boardRef.current.querySelector("#board");
    if (!boardDiv) return;

    const canvas = document.createElement("canvas");
    canvas.width = boardWidth;
    canvas.height = boardHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelDivs = boardDiv.children;
    Array.from(pixelDivs).forEach((div, idx) => {
      const x = idx % boardWidth;
      const y = Math.floor(idx / boardWidth);
      const bgColor = (div as HTMLElement).style.backgroundColor || "#fff";
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, 1, 1);
    });

    const scale = 10;
    const scaled = document.createElement("canvas");
    scaled.width = boardWidth * scale;
    scaled.height = boardHeight * scale;
    const sCtx = scaled.getContext("2d");
    if (!sCtx) return;
    sCtx.imageSmoothingEnabled = false;
    sCtx.drawImage(canvas, 0, 0, scaled.width, scaled.height);

    const dataUri = scaled.toDataURL("image/png");

    setExportedImg(dataUri);

    // Use the parent-provided goToPage method for navigation
    goToPage("imagePuzzle");
  }

  return (
    <>
      {/* Pixel font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      <div className="w-screen h-screen bg-gray-900 relative pixelated-bg flex items-center justify-center">
        <button onClick={handleSave} className="absolute top-4 left-4 pixel-button">
          SAVE
        </button>

        <button className="absolute top-4 right-4 pixel-button">{time}s</button>

        <div className="w-[75%] max-w-3xl p-6 flex flex-col items-center gap-6">
          <h1 className="pixel-font text-white text-2xl">PIXEL BOARD</h1>

          <div className="pixel-pallet">
            <Pallet setCurrentColor={setCurrentColor} />
          </div>

          <div ref={boardRef} className="pixel-board">
            <Board
              height={boardHeight}
              width={boardWidth}
              selectedColor={currentColor}
              setSelectedColor={setCurrentColor}
              pixelData={pixelData}
              setPixelData={setPixelData}
            />
          </div>

          <button
            onClick={() => onCreatePuzzle && onCreatePuzzle(currentPixelData)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
          >
            🧩 Create Puzzle Challenge
          </button>


          <div className="text-xs text-center text-red-500 font-retro">
            Note: Maximum time is 60 seconds to draw.
          </div>
        </div>

        <style>{`
          .pixel-font {
            font-family: "Press Start 2P", monospace;
            image-rendering: pixelated;
            letter-spacing: 1px;
          }
          .pixelated-bg {
            background-size: cover;
            image-rendering: pixelated;
          }
          .pixel-panel {
            border: 4px solid #444;
            box-shadow: inset 0 0 0 4px #222;
            image-rendering: pixelated;
          }
          .pixel-input {
            width: 4rem;
            height: 1.5rem;
            background: #222;
            color: #eee;
            border: 2px solid #555;
            text-align: center;
            font-family: "Press Start 2P", monospace;
            image-rendering: pixelated;
            outline: none;
          }
          .pixel-input:focus {
            border-color: #888;
          }
          .pixel-pallet {
            padding: 0.5rem;
            background: #111;
            border: 2px solid #555;
            box-shadow: inset 0 0 0 2px #000;
            image-rendering: pixelated;
          }
          .pixel-board {
            padding: 0.5rem;
            background: #111;
            border: 2px solid #555;
            box-shadow: inset 0 0 0 2px #000;
            image-rendering: pixelated;
          }
          .pixel-button {
            font-family: "Press Start 2P", monospace;
            image-rendering: pixelated;
            background: #333;
            color: #fff;
            border: 2px solid #555;
            padding: 0.5rem 1rem;
            letter-spacing: 1px;
            cursor: pointer;
          }
          .pixel-button:hover {
            background: #444;
          }
          .pixel-button:active {
            background: #222;
          }
        `}</style>
      </div>
    </>
  );
}
