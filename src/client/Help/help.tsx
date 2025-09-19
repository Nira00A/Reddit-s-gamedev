import React, { useState, useEffect } from "react";

interface Slide {
  heading: string;
  imgSrc: string;
  text: string;
}

interface HelpProps{
  goToPage: (page: string) => void;
}

export const HelpPage: React.FC<HelpProps> = ({ goToPage }) => {
  const slides: Slide[] = [
    {
      heading: "Drawing Board",
      imgSrc: "/board.png",
      text: "The pixel board lets you draw by clicking or dragging to color squares, erase pixels, or clear the board, making pixel art easy and ready for the puzzle",
    },
    {
      heading: "Color Pallet",
      imgSrc: "/color.png",
      text: "The color palette allows you to select and switch colors easily, enabling vibrant and precise pixel art creations.",
    },
    {
      heading: "Grid Indexing",
      imgSrc: "/grid.png",
      text: "Indexing puzzle pieces with more than 95% color coverage is important because these pieces carry most of the visual information needed for recognizing and placing them correctly. Prioritizing these colorful pieces during puzzle validation reduces confusion caused by mostly blank or uniform pieces, simplifies the checking process, and helps players solve the puzzle more intuitively and efficiently",
    },
  ];

  const [current, setCurrent] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(true);

  // Trigger fade animation on slide change
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 50);
    return () => clearTimeout(timeout);
  }, [current]);

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 flex flex-col items-center justify-center font-retro">
      <h1 className="text-2xl mb-8 select-none">
        {slides[current] ? slides[current].heading : ""}
      </h1>

      <div className="relative w-80 h-80 mb-6">
        <img
          src={slides[current] ? slides[current].imgSrc : ""}
          alt={`Help ${current + 1}`}
          className={`
            w-full h-full object-contain
            transition-opacity duration-500
            ${fade ? "opacity-100" : "opacity-0"}
          `}
        />
      </div>

      <p
        className={`
          max-w-xl text-center mb-8 text-sm leading-relaxed
          transition-opacity duration-500
          ${fade ? "opacity-100" : "opacity-0"}
        `}
      >
        {slides[current] ? slides[current].text : ""}

        {slides[current] && slides[current].imgSrc === "/grid.png" && (
          <div className="text-red-500">
            Note : Grids with less than 70% color coverage are not affected by indexing.
          </div>
        )}
      </p>

      <div className="space-x-4">
        <button
          onClick={prevSlide}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};
