// App.tsx
import 'index.css';
import { useState } from 'react';
import { Home } from './Routes/Home';
import { DisplayBoard } from './Drawing pallet/drawingBoard';
import { HelpPage } from './Help/help';
import { ImagePuzzle } from './Routes/ImagePuzzle';

export default function App() {
  const [page, setPage] = useState('home');

  const goToPage = (pageName: string) => setPage(pageName);

  const HomePage = () => (
    <Home
      goToPage={goToPage}
      onLeaderboards={() => goToPage('leaderboards')}
      onHowToPlay={() => goToPage('help')}
    />
  );

  const BoardPage = () => <DisplayBoard goToPage={goToPage} />;

  const HelpPageComponent = () => <HelpPage goToPage={goToPage} />;

  const ImagePuzzlePage = () => <ImagePuzzle goToPage={goToPage} />;

  const LeaderboardsPage = () => (
    // If you have a Leaderboards component replace below with <Leaderboards ... />
    <div>
      <h1>Leaderboards</h1>
      <button onClick={() => goToPage('home')}>Back to Home</button>
    </div>
  );

  return (
    <div className="App">
      {page === 'home' && <HomePage />}
      {page === 'board' && <BoardPage />}
      {page === 'help' && <HelpPageComponent />}
      {page === 'imagePuzzle' && <ImagePuzzlePage />}
      {page === 'leaderboards' && <LeaderboardsPage />}
    </div>
  );
}
