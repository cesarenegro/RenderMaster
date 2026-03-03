import React from 'react';
import { HomeIcon, LogoutIcon } from './icons';
import { User } from '../types';

interface HeaderProps {
  onGoHome: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, user, onLogout }) => {
  return (
    <header className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
       <div className="flex items-center cursor-pointer" onClick={onGoHome}>
         <img src="https://i.imgur.com/OXqK4w1.png" alt="Render Master AI logo" className="w-8 h-8 mr-3" referrerPolicy="no-referrer"/>
         <h1 className="text-xl font-bold text-gray-900 tracking-wider">
           Render Master AI
         </h1>
       </div>
       
       <div className="ml-auto flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4 border-r border-gray-200 pr-4 mr-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.name}</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  user.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.plan}
                </span>
                {user.plan === 'free' && (
                  <span className="text-[10px] text-gray-500">{user.credits} credits left</span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-indigo-100 shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all text-sm"
          title="Log Out"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="hidden md:inline">Log Out</span>
        </button>
       </div>
    </header>
  );
};