import React, { useState, useEffect, useRef } from "react";

interface BoardProps {
  height: number;
  width: number;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  goTo?: (page: string) => void;
  pixelData: string[];              
  setPixelData: (p: string[]) => void;
}

export const Board: React.FC<BoardProps> = ({
  height,
  width,
  selectedColor,
  setSelectedColor,
  goTo,
  pixelData,
  setPixelData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // render pixels
  let pixel = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = i * width + j;
      pixel.push(
        <Pixel
          key={index}
          color={pixelData[index] ?? "#fff"} // pass individual pixel color, fallback to "#fff"
          setColor={(newColor: string) => {
            const newPixels = [...pixelData];
            newPixels[index] = newColor;
            setPixelData(newPixels);
          }}
          selectedColor={selectedColor}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      );
    }
  }

  function handleDelete() {
    setPixelData(new Array(height * width).fill("#fff"));
  }

  function handleEraser() {
    setSelectedColor("eraser");
  }

  return (
    <div>
      {/* Pixel font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      <div
        ref={ref}
        id="board"
        className="grid relative"
        style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
      >
        {pixel}

        {selectedColor === "#fff" ? (
          <div className="select-none absolute z-10 pixel-font text-sm text-gray-300 top-[50%] left-[17%]">
            Tap to Draw
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleEraser}
          className={`flex items-center justify-center mt-2 p-1 rounded-lg bg-gray-800 transition-all duration-300 ease-in-out
                          shadow-lg hover:shadow-xl hover:bg-gray-700 active:scale-95 active:bg-gray-900
                          focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                          ${
                            selectedColor === "eraser"
                              ? "opacity-100"
                              : "opacity-70 hover:opacity-100"
                          }`}
          aria-label="Eraser Tool"
          title="Eraser Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
            className="pointer-events-none"
          >
            <path d="M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z" />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          className={`flex items-center justify-center mt-2 p-1 rounded-lg bg-red-300 transition-all duration-300 ease-in-out
                          shadow-lg hover:shadow-xl hover:bg-red-700 active:scale-95 active:bg-gray-900
                          focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50
                          ${
                            selectedColor === "eraser"
                              ? "opacity-100"
                              : "opacity-70 hover:opacity-100"
                          }`}
          aria-label="Delete-all Tool"
          title="Delete Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="red"
          >
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface PixelProps {
  key?: React.Key;
  color: string;
  setColor: (color: string) => void;
  selectedColor: string;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

function Pixel(props: PixelProps) {
  const { color, setColor, selectedColor, isDragging, setIsDragging } = props;
  const [isHovered, setIsHovered] = useState(false);

  function applyColor() {
    if (selectedColor === "eraser") {
      setColor("#fff");
    } else {
      setColor(selectedColor);
    }
  }

  function handleMouseDown() {
    setIsDragging(true);
    applyColor();
  }

  function handleMouseEnter() {
    setIsHovered(true);
    if (isDragging) {
      applyColor();
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  const displayColor = isHovered && !isDragging ? selectedColor : color;

  return (
    <div
      draggable={false}
      onDragStart={handleDragStart}
      style={{ width: "1rem", height: "1rem", backgroundColor: displayColor }}
      className={`bg-white ${
        selectedColor === "eraser" ? "hover:border border-black hover:opacity-[80%]" : ""
      }`}
      onClick={applyColor}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    ></div>
  );
}
