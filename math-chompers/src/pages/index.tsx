// pages/index.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

let munchSound: HTMLAudioElement | null = null;
let errorSound: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  munchSound = new Audio('/munch.mp3');
  errorSound = new Audio('/error.mp3');
}

const GRID_SIZE = 5;

const generateGrid = (mode: string, ruleNumber: number) => {
  const grid = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    let value;
    if (mode === 'multiples') {
      value = Math.floor(Math.random() * 50 + 1);
    } else if (mode === 'factors') {
      value = Math.random() < 0.5 ? ruleNumber : Math.floor(Math.random() * ruleNumber + 1);
    } else if (mode === 'primes') {
      value = Math.floor(Math.random() * 50 + 1);
    } else if (mode === 'equality' || mode === 'inequality') {
      value = generateEquation(ruleNumber, mode === 'equality');
    } else {
      value = Math.floor(Math.random() * 50 + 1);
    }
    grid.push(value);
  }
  return grid;
};

const generateEquation = (target: number, isEquality: boolean) => {
  const ops = ['+', '-', '*', '/'];
  while (true) {
    const a = Math.floor(Math.random() * 12 + 1);
    const b = Math.floor(Math.random() * 12 + 1);
    const op = ops[Math.floor(Math.random() * ops.length)];
    const expr = `${a} ${op} ${b}`;
    try {
      const result = Math.round(eval(expr));
      if ((isEquality && result === target) || (!isEquality && result !== target)) {
        return expr;
      }
    } catch {
      continue;
    }
  }
};

const isCorrect = (mode: string, value: any, ruleNumber: number) => {
  const num = typeof value === 'number' ? value : eval(value);
  switch (mode) {
    case 'multiples':
      return num % ruleNumber === 0;
    case 'factors':
      return ruleNumber % num === 0;
    case 'primes':
      if (num < 2) return false;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
      }
      return true;
    case 'equality':
      return num === ruleNumber;
    case 'inequality':
      return num !== ruleNumber;
    default:
      return false;
  }
};

export default function Home() {
  const [muncherPos, setMuncherPos] = useState(12);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'multiples' | 'factors' | 'primes' | 'equality' | 'inequality'>('multiples');
  const [ruleNumber, setRuleNumber] = useState(2);
  const [grid, setGrid] = useState<any[]>([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const initialGrid = generateGrid(mode, ruleNumber);
    setGrid(initialGrid);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const row = Math.floor(muncherPos / GRID_SIZE);
      const col = muncherPos % GRID_SIZE;
      if (e.key === 'ArrowUp' && row > 0) setMuncherPos(muncherPos - GRID_SIZE);
      if (e.key === 'ArrowDown' && row < GRID_SIZE - 1) setMuncherPos(muncherPos + GRID_SIZE);
      if (e.key === 'ArrowLeft' && col > 0) setMuncherPos(muncherPos - 1);
      if (e.key === 'ArrowRight' && col < GRID_SIZE - 1) setMuncherPos(muncherPos + 1);
      if (e.key === 'Enter') {
        const value = grid[muncherPos];
        if (isCorrect(mode, value, ruleNumber)) {
          munchSound?.play();
          const newGrid = [...grid];
          newGrid[muncherPos] = generateGrid(mode, ruleNumber)[0];
          setGrid(newGrid);
          setScore(score + 1);
          setFlash(true);
          setTimeout(() => setFlash(false), 150);
        } else {
          errorSound?.play();
          setScore(score - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [muncherPos, grid, mode, ruleNumber, score]);

  const changeMode = (newMode: typeof mode) => {
    const num = newMode === 'multiples' ? 2 + Math.floor(Math.random() * 8)
               : newMode === 'factors' ? 4 + Math.floor(Math.random() * 10)
               : newMode === 'equality' || newMode === 'inequality' ? Math.floor(Math.random() * 20 + 1)
               : 0;
    setMode(newMode);
    setRuleNumber(num);
    setGrid(generateGrid(newMode, num));
    setScore(0);
    setMuncherPos(12);
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Math Chompers</title>
      </Head>
      <div className={`min-h-screen p-4 text-center transition ${flash ? 'bg-yellow-200' : 'bg-white'} text-gray-900`}> 
        <h1 className="text-3xl font-bold mb-4">Math Chompers</h1>
        <p className="mb-4 text-lg">Mode: {mode.toUpperCase()} | Rule: {ruleNumber} | Score: {score}</p>
        <div className="grid grid-cols-5 gap-2 w-max mx-auto">
          {grid.map((value, index) => (
            <AnimatePresence key={index}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`w-16 h-16 flex items-center justify-center border rounded text-sm text-center px-1 ${index === muncherPos ? 'bg-green-300' : 'bg-white'}`}
              >
                {value}
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
        <div className="mt-6 space-x-2 flex flex-wrap justify-center">
          <button onClick={() => changeMode('multiples')} className="border px-3 py-1 bg-gray-100 hover:bg-gray-200">Multiples</button>
          <button onClick={() => changeMode('factors')} className="border px-3 py-1 bg-gray-100 hover:bg-gray-200">Factors</button>
          <button onClick={() => changeMode('primes')} className="border px-3 py-1 bg-gray-100 hover:bg-gray-200">Primes</button>
          <button onClick={() => changeMode('equality')} className="border px-3 py-1 bg-gray-100 hover:bg-gray-200">Equalities</button>
          <button onClick={() => changeMode('inequality')} className="border px-3 py-1 bg-gray-100 hover:bg-gray-200">Inequalities</button>
        </div>
      </div>
    </>
  );
}
