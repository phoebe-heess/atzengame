import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import atzengoldLogo from '../assets/atzengold-logo.png';
import BurgerMenu from '../components/BurgerMenu';
import { pointsService } from '../services/pointsService';

interface ScoreboardEntry {
  userId: string;
  points: number;
  pendingPoints?: number;
  totalPoints?: number;
  walletAddress?: string;
}

export default function Scoreboard() {
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const handleShowLoginRegister = () => {
    // Handle login/register display
    console.log('Show login/register');
  };

  const fetchScoreboard = async () => {
    try {
      setLoading(true);
      // For demo, we'll use the test user
      const testUser = 'test@example.com';
      
      // Get user points
      const points = await pointsService.getCurrentPoints(testUser);
      
      // Get wallet address
      const walletResponse = await fetch(`http://localhost:3000/api/user-wallet/${testUser}`);
      const walletData = await walletResponse.json();
      
      // Get detailed points info
      const detailedResponse = await fetch(`http://localhost:3000/api/user-points/${testUser}`);
      const detailedData = await detailedResponse.json();
      
      const entry: ScoreboardEntry = {
        userId: testUser,
        points: detailedData.points || points,
        pendingPoints: detailedData.pendingPoints || 0,
        totalPoints: detailedData.totalPoints || points,
        walletAddress: walletData.walletAddress
      };
      
      setScoreboard([entry]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      setError('Failed to load scoreboard');
    } finally {
      setLoading(false);
    }
  };

  const copyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading scoreboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-green-600">
      <BurgerMenu onShowLoginRegister={handleShowLoginRegister} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <img src={atzengoldLogo} alt="Atzengold Logo" className="h-16" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Your Points
          </h1>
          
          <div className="space-y-4">
            {scoreboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="text-6xl font-bold text-orange-600 mb-2">
                    {entry.totalPoints}
                  </div>
                  <div className="text-lg text-gray-600">
                    Total Points
                  </div>
                </div>
                
                {entry.walletAddress && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Your ID (for verification):</div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-hidden text-ellipsis">
                        {entry.walletAddress}
                      </code>
                      <button
                        onClick={() => copyWalletAddress(entry.walletAddress!)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                      >
                        {copiedAddress === entry.walletAddress ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 Copy your ID to send for special rewards</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 