import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BoardState, 
  GameState, 
  Player, 
  Position, 
  INITIAL_PIECES_COUNT, 
  Move 
} from './types';
import { 
  createInitialBoard, 
  getValidMoves, 
  isValidPos, 
  processMoveAndCaptures, 
  checkWinCondition, 
  getBestAIMove
} from './services/gameLogic';
import Board from './components/Board';
import AdSense from './components/AdSense';
import AdMobBanner from './components/AdMob';
import { Capacitor } from '@capacitor/core';
import { preloadInterstitial, showInterstitial } from './utils/adMobInterstitial';
import { 
  RefreshCw, 
  Undo2, 
  Cpu, 
  User, 
  Info, 
  X,
  Trophy 
} from 'lucide-react';
import { clsx } from 'clsx';

const App: React.FC = () => {
  // Game State
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('A');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  
  // Settings
  const [isAIEnabled, setIsAIEnabled] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Stats
  const [pieceCounts, setPieceCounts] = useState<{A: number, B: number}>({ A: 4, B: 4 });
  const gameCountRef = useRef<number>(0); // Track number of games played

  // Initialize AdMob and preload interstitial on app start
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      preloadInterstitial().catch(console.error);
    }
  }, []);

  // Update piece counts whenever board changes
  useEffect(() => {
    let a = 0;
    let b = 0;
    board.forEach(row => row.forEach(cell => {
      if (cell === 'A') a++;
      if (cell === 'B') b++;
    }));
    setPieceCounts({ A: a, B: b });

    // Check winner if not already set (safety check)
    if (!winner) {
      if (a < 2) setWinner('B');
      else if (b < 2) setWinner('A');
    }
  }, [board, winner]);

  // Show interstitial ad when game ends
  useEffect(() => {
    if (winner && Capacitor.isNativePlatform()) {
      // Small delay to let winner modal show first, then show ad
      const timer = setTimeout(() => {
        showInterstitial().catch(console.error);
      }, 1500); // 1.5 second delay after winner is determined
      
      return () => clearTimeout(timer);
    }
  }, [winner]);

  // AI Turn Logic
  useEffect(() => {
    if (isAIEnabled && currentPlayer === 'B' && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const bestMove = getBestAIMove(board, 'B');
        if (bestMove) {
          executeMove(bestMove, 'B');
        } else {
          // No moves possible? Usually shouldn't happen unless completely blocked
          // If stuck, pass turn or game over logic (simplified here)
          setCurrentPlayer('A');
        }
        setIsAiThinking(false);
      }, 800); // Artificial delay
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isAIEnabled, winner, board]);

  const handleCellClick = (pos: Position) => {
    if (winner || isAiThinking || (isAIEnabled && currentPlayer === 'B')) return;

    const clickedCell = board[pos.row][pos.col];

    // Case 1: Select own piece
    if (clickedCell === currentPlayer) {
      setSelectedPos(pos);
      setValidMoves(getValidMoves(board, pos));
      return;
    }

    // Case 2: Move to empty valid cell
    if (selectedPos) {
      const isMoveValid = validMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isMoveValid) {
        executeMove({ from: selectedPos, to: pos }, currentPlayer);
        return;
      }
    }

    // Case 3: Click empty invalid cell or enemy -> Deselect
    setSelectedPos(null);
    setValidMoves([]);
  };

  const executeMove = (move: Move, player: Player) => {
    // Save history
    setHistory(prev => [...prev, board.map(r => [...r])]);

    // Process logic
    const { newBoard, captured } = processMoveAndCaptures(board, move, player);
    
    setBoard(newBoard);
    setLastMove(move);
    setSelectedPos(null);
    setValidMoves([]);

    // Check win
    const gameWinner = checkWinCondition(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(prev => prev === 'A' ? 'B' : 'A');
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('A');
    setWinner(null);
    setHistory([]);
    setLastMove(null);
    setSelectedPos(null);
    setValidMoves([]);
    
    // Increment game count
    gameCountRef.current += 1;
    
    // Show interstitial every 3 games (optional - you can adjust this frequency)
    // This is in addition to showing after game ends
    if (Capacitor.isNativePlatform() && gameCountRef.current > 0 && gameCountRef.current % 3 === 0) {
      // Small delay to let game reset first
      setTimeout(() => {
        showInterstitial().catch(console.error);
      }, 500);
    }
  };

  const undoMove = () => {
    if (history.length === 0 || winner) return;
    
    // If AI is enabled, we need to undo 2 steps (AI + Player) usually, 
    // unless AI is currently thinking. For simplicity, just undo one state.
    // If it's AI turn, undoing goes back to Player turn.
    // If it's Player turn, undoing goes back to AI turn (which will immediately re-trigger AI).
    // To make undo usable vs AI, we should undo twice if it's Player's turn and AI is enabled.
    
    const prevBoard = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    if (isAIEnabled && currentPlayer === 'A' && newHistory.length > 0) {
      // Undo AI move as well
      const prevPrevBoard = newHistory[newHistory.length - 1];
      setBoard(prevPrevBoard);
      setHistory(newHistory.slice(0, -1));
      setCurrentPlayer('A'); // Still player's turn
    } else {
      setBoard(prevBoard);
      setHistory(newHistory);
      setCurrentPlayer(prev => prev === 'A' ? 'B' : 'A');
    }
    
    setWinner(null);
    setLastMove(null);
  };

  return (
    <div className="min-h-screen max-h-screen bg-slate-900 flex flex-col items-center justify-start px-2 sm:px-4 relative overflow-hidden">
      
      {/* AdMob Banner - Top (Mobile only) */}
      {Capacitor.isNativePlatform() && (
        <div className="w-full z-50">
          <AdMobBanner 
            adUnitId="ca-app-pub-8396981938969998/8850377981"
            position="top"
          />
        </div>
      )}
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Game Layout - Board takes priority */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-6 items-center justify-center z-10 w-full max-w-7xl mx-auto flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pb-4 sm:pb-6 safe-area-bottom custom-scrollbar">
        
        {/* Left: AdSense Ad - Only on desktop, doesn't interfere with board */}
        <div className="hidden lg:flex w-48 xl:w-64 flex-shrink-0 justify-center items-start pt-8">
          <div className="w-full">
            <AdSense 
              adSlot="9296977491"
              adFormat="auto"
              fullWidthResponsive={true}
              className="min-h-[250px]"
            />
          </div>
        </div>

        {/* Center: Game Board area - Always fully visible */}
        <div className="flex flex-col items-center w-full max-w-md flex-shrink-0 min-w-0">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tight">
              Tic Tac Toe Toe
            </h1>
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 transition-colors"
              title="Play Rules"
            >
              <Info size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="flex justify-between w-full max-w-sm mb-2 sm:mb-4 px-1 sm:px-2">
            <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border", 
              currentPlayer === 'B' ? "bg-sky-900/30 border-sky-500/50 text-sky-200" : "border-transparent text-slate-500 opacity-60")}>
              <Cpu size={18} />
              <span className="font-semibold">{isAIEnabled ? "AI (Blue)" : "P2 (Blue)"}</span>
              <span className="bg-slate-800 px-2 rounded ml-1 text-xs">{pieceCounts.B}</span>
            </div>
            
            <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border", 
              currentPlayer === 'A' ? "bg-rose-900/30 border-rose-500/50 text-rose-200" : "border-transparent text-slate-500 opacity-60")}>
              <span className="bg-slate-800 px-2 rounded mr-1 text-xs">{pieceCounts.A}</span>
              <span className="font-semibold">You (Red)</span>
              <User size={18} />
            </div>
          </div>

          <Board 
            board={board} 
            currentPlayer={currentPlayer}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onCellClick={handleCellClick}
            isAiThinking={isAiThinking}
            lastMove={lastMove}
          />

          {/* Controls - Always visible */}
          <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-4 flex-wrap justify-center flex-shrink-0 w-full z-20">
             <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 font-medium text-sm"
            >
              <RefreshCw size={16} /> Restart
            </button>
            <button 
              onClick={undoMove}
              disabled={history.length === 0 || winner !== null}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg transition-colors border border-slate-700 font-medium text-sm"
            >
              <Undo2 size={16} /> Undo
            </button>
            <button 
              onClick={() => setIsAIEnabled(!isAIEnabled)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border font-medium text-sm",
                isAIEnabled 
                  ? "bg-indigo-900/40 border-indigo-500/50 text-indigo-200" 
                  : "bg-slate-800 border-slate-700 text-slate-400"
              )}
            >
              <Cpu size={16} /> {isAIEnabled ? "AI: On" : "AI: Off"}
            </button>
          </div>
        </div>

        {/* Right: AdSense Ad - Only on desktop web, doesn't interfere with board */}
        {!Capacitor.isNativePlatform() && (
          <div className="hidden lg:flex w-48 xl:w-64 flex-shrink-0 justify-center items-start pt-8">
            <div className="w-full">
              <AdSense 
                adSlot="9296977491"
                adFormat="auto"
                fullWidthResponsive={true}
                className="min-h-[250px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm safe-area"
          onClick={() => setShowRulesModal(false)}
        >
          <div 
            className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
                <Info size={24} /> Play Rules
              </h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-sm text-slate-300 pr-2 pb-4 custom-scrollbar overflow-y-auto flex-1">
              <div className="space-y-3">
                <p className="text-slate-400">The game uses a <strong className="text-slate-200">4×4 board</strong>.</p>
                <p className="text-slate-400">Each side has <strong className="text-slate-200">4 pieces</strong>.</p>
                <p className="text-slate-400">Players <strong className="text-slate-200">take turns</strong>.</p>
                <p className="text-slate-400">On your turn, you <strong className="text-slate-200">move one piece</strong> to an <strong className="text-slate-200">adjacent empty cell</strong> (up, down, left, right only).</p>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <strong className="text-indigo-300 block mb-2">Capture Rule</strong>
                <p className="mb-2 text-slate-400">After moving a piece, check the <strong className="text-slate-200">row and column</strong> of the moved piece.</p>
                <p className="mb-2 text-slate-400">If in that row or column you have:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2 mb-2">
                  <li>Two of your pieces <strong className="text-slate-200">adjacent</strong> to each other, and</li>
                  <li>Immediately next to them there is <strong className="text-slate-200">one opponent piece</strong>,</li>
                </ul>
                <p className="mb-2 text-slate-400">then that opponent piece is <strong className="text-rose-400">captured and removed</strong>.</p>
                <p className="text-xs text-slate-500 italic mt-2">⚠️ If a row or column contains 4 pieces (full line), then no capture can occur on that line.</p>
                <p className="text-xs text-slate-500 italic">💡 Multiple captures in the same turn are possible (row and column separately).</p>
              </div>

              <div className="bg-rose-900/20 p-4 rounded-lg border border-rose-700/50">
                <strong className="text-rose-300 block mb-2">Winning Rules</strong>
                <p className="text-slate-400">When a player has <strong className="text-rose-200">fewer than 2 pieces</strong>, that player <strong className="text-rose-200">loses immediately</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm safe-area">
          <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-600 text-center max-w-sm w-full mx-2 sm:mx-4 transform transition-all scale-100">
            <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === 'A' ? "You Won!" : "Opponent Won!"}
            </h2>
            <p className="text-slate-400 mb-6">
              {winner === 'A' 
                ? "Great strategy! You eliminated the opponent." 
                : "Better luck next time."}
            </p>
            <button 
              onClick={resetGame}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* AdMob Banner - Bottom (Mobile only) */}
      {Capacitor.isNativePlatform() && (
        <div className="w-full z-50">
          <AdMobBanner 
            adUnitId="ca-app-pub-8396981938969998/8850377981"
            position="bottom"
          />
        </div>
      )}

    </div>
  );
};

export default App;
