interface HomeProps {
  onLeaderboards: () => void;
  onHowToPlay: () => void;
  currentLevel?: number;
  goToPage: (page: string) => void;  // Function to change pages, replacing useNavigate
}

export function Home({ onLeaderboards, onHowToPlay, currentLevel = 1, goToPage }: HomeProps) {
  function onStart() {
    // Instead of navigate, call goToPage
    goToPage('board');
  }

  function onHelp() {
    goToPage('help');
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      <div
        className="min-h-screen bg-gray-900 overflow-hidden bg-cover bg-center relative pixelated-bg"
        style={{
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
          aspectRatio: '16/9',
          width: '100%',
          height: 'auto',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Level */}
          <div className="absolute top-4 left-4">
            <div className="pixel-button bg-gray-800 border-3 border-gray-600 px-3 py-1">
              <span className="text-white font-bold text-xs pixel-font">LVL {currentLevel}</span>
            </div>
          </div>
          {/* Logo */}
          <div
            className="w-24 h-24 mb-10 mx-auto border border-white shadow-3xl relative flex items-center justify-center"
            style={{ imageRendering: 'pixelated' }}
          >
            <img
              src="icon.png"
              alt="Game Logo"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 pixel-font pixel-text-shadow">
            MEMETILE
          </h1>
          <p className="text-xs text-green-400 font-bold pixel-font">CREATE • SHUFFLE • SHARE</p>
          <p className="text-xs text-gray-300 pixel-font">PIXEL ART ADVENTURE</p>
          {/* Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {['blue', 'slate', 'indigo'].map((color, idx) => {
              const labels = ['START', 'SCORES', 'HELP'];
              const icons = ['▶', '★', '?'];
              const bg = color === 'blue' ? 'blue-600' : color === 'slate' ? 'slate-700' : 'indigo-600';
              const hoverBg = color === 'blue' ? 'blue-700' : color === 'slate' ? 'slate-800' : 'indigo-700';

              const onClickHandlers = [onStart, onLeaderboards, onHelp];

              return (
                <button
                  key={color}
                  onClick={onClickHandlers[idx]}
                  className={`relative bg-${bg} hover:bg-${hoverBg} text-white font-bold py-2 px-6 rounded-md
                    transition-all duration-200 transform hover:-translate-y-1 active:translate-y-1
                    focus:outline-none pixel-font text-sm`}
                  style={{
                    clipPath:
                      'polygon(0 3px, 3px 3px, 3px 0, calc(100% - 3px) 0, calc(100% - 3px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 3px), 0 calc(100% - 3px))',
                    textShadow: '1px 1px 0 #000',
                  }}
                >
                  <span className="text-lg">{icons[idx]}</span> {labels[idx]}
                  <div
                    className="absolute top-1 left-1 w-full h-full opacity-50"
                    style={{
                      backgroundColor: `rgba(0,0,0,0.3)`,
                      clipPath:
                        'polygon(0 3px, 3px 3px, 3px 0, calc(100% - 3px) 0, calc(100% - 3px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 3px), 0 calc(100% - 3px))',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <style>{`
          .pixel-font {
            font-family: 'Press Start 2P', monospace;
            image-rendering: pixelated;
            letter-spacing: 0.5px;
          }
          .pixel-text-shadow {
            text-shadow: 2px 2px 0 #000, 4px 4px 0 rgba(0, 0, 0, 0.5);
          }
          .pixelated-bg {
            image-rendering: crisp-edges;
          }
        `}</style>
      </div>
    </>
  );
}

