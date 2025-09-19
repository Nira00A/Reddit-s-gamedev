import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { media } from '@devvit/web/server';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

// Route to save puzzle challenge and create Reddit post
router.post('/api/create-puzzle-challenge', async (req, res) => {
  const { pixelData, title, difficulty, creatorUsername } = req.body;
  
  if (!pixelData || !title || !creatorUsername) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: pixelData, title, or creatorUsername' 
    });
  }

  try {
    const puzzleId = `puzzle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const { subredditName } = context;
    
    if (!subredditName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subreddit context not found' 
      });
    }

    // Create Reddit post with puzzle data
    const post = await reddit.submitPost({
      subredditName: subredditName,
      title: `🧩 Puzzle Challenge: ${title} (${difficulty})`,
      text: `Created by u/${creatorUsername}\n\nTry to solve this ${difficulty} pixel art puzzle!\n\nClick the link below to play!\n\n---PUZZLE_DATA---\n${JSON.stringify({
        type: 'puzzle-challenge',
        puzzleId: puzzleId,
        pixelData: pixelData,
        title: title,
        difficulty: difficulty,
        creatorUsername: creatorUsername,
        createdAt: Date.now(),
        isActive: true
      })}\n---END_PUZZLE_DATA---`
    });

    res.json({
      success: true,
      puzzleId: puzzleId,
      postId: post.id,
      postUrl: `https://reddit.com/r/${subredditName}/comments/${post.id}`
    });

  } catch (error) {
    console.error('Error creating puzzle challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create puzzle challenge'
    });
  }
});

// Route to get puzzle data by ID
router.get('/api/puzzle/:puzzleId', async (req, res) => {
  const { puzzleId } = req.params;
  
  try {
    // In a real implementation, you might store this in Redis or fetch from post data
    // For now, we'll return a success response - the puzzle data is embedded in posts
    res.json({
      success: true,
      message: 'Puzzle data embedded in post'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzle data'
    });
  }
});

// Route to record puzzle completion
router.post('/api/puzzle/:puzzleId/complete', async (req, res) => {
  const { puzzleId } = req.params;
  
  try {
    // Here you could store completion stats if using Redis
    // For now, just return success
    res.json({
      success: true,
      message: 'Puzzle completion recorded',
      encouragement: 'Great job! Now create your own puzzle challenge!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record completion'
    });
  }
});

// In your server/index.ts

router.post('/api/create-puzzle-challenge', async (req, res) => {
  const { puzzleId, title, difficulty, pieces } = req.body;
  const { subredditName, userId } = context;

  if (!pieces || !Array.isArray(pieces) || pieces.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid pieces' });
  }

  const gridSize = Math.sqrt(pieces.length);
  let mdGrid = '';
  for (let row = 0; row < gridSize; row++) {
    const rowImgs = pieces
      .slice(row * gridSize, row * gridSize + gridSize)
      .map(p => `![piece](${p.src})`)
      .join(' ');
    mdGrid += rowImgs + '\n\n';
  }

  // JSON metadata embedded as markdown code block
  const metadataBlock = '```' +
    JSON.stringify({ puzzleId, difficulty, pieces }, null, 2) +
    '\n```';

  try {
    const post = await reddit.submitPost({
      subredditName,
      title: `🧩 ${title} [${difficulty}]`,
      text: `
## Puzzle Challenge: ${title}

${mdGrid}

---

${metadataBlock}
      `,
    });

    res.json({
      success: true,
      postId: post.id,
      postUrl: `https://reddit.com/r/${subredditName}/comments/${post.id}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
