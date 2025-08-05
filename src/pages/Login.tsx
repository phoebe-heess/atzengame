import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmailLoginForm from '../components/EmailLoginForm';
import SocialAuth from '../components/SocialAuth';
import { useSwipeDown } from '../hooks/useSwipeDown';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300);
  };

  const handleSuccess = () => {
    handleClose();
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeDown({
    onSwipeDown: handleClose
  });

  if (!isVisible) return null;

  return (
    <>
      {/* Grey overlay background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      
      {/* Card overlay */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-x-12 top-16 bottom-4 bg-white rounded-t-3xl shadow-2xl z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
          {/* Green handle */}
          <div 
            className="bg-green-500 h-2 w-full cursor-pointer flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1 bg-white rounded-full opacity-60"></div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Willkommen zurück!</h1>
              <p className="text-gray-600">Melde dich an, um weiterzuspielen</p>
            </div>

            <EmailLoginForm 
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">oder</span>
                </div>
              </div>
              
              <div className="mt-6">
                <SocialAuth 
                  atzencoins={0}
                  onSuccess={handleSuccess}
                  onError={(error) => console.error('Social auth error:', error)}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Noch kein Konto?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Jetzt registrieren
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Login; 