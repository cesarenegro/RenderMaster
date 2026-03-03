import React from 'react';
import { UserProfile } from '../types';
import { InteriorIcon, HomeIcon } from './icons'; 

interface HomeScreenProps {
  onProfileSelect: (profile: UserProfile) => void;
}

interface ProfileOption {
  id: UserProfile;
  title: string;
  description: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const profileOptions: ProfileOption[] = [
  {
    id: 'user',
    title: 'User',
    description: 'Free access. Explore design ideas and visualize changes for your own space.',
    Icon: HomeIcon,
  },
  {
    id: 'arkitecna',
    title: 'Arkitecna',
    description: 'Professional Access. Advanced tools for architects and interior designers.',
    Icon: InteriorIcon,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onProfileSelect }) => {
  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[35%]"
        style={{ backgroundImage: "url('https://i.imgur.com/VsZ54Ec.jpeg')" }}
      />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-8">
          <img src="https://i.imgur.com/OXqK4w1.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" referrerPolicy="no-referrer"/>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-md">Welcome to Render Master AI</h1>
          <p className="mt-3 text-base md:text-lg text-gray-700 drop-shadow-sm">Your all-in-one solution for architectural and interior design visualization.</p>
          <p className="mt-2 text-lg md:text-xl font-semibold text-indigo-700 drop-shadow-sm">Please select your profile to continue.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onProfileSelect(option.id)}
              className="flex flex-col items-center p-6 text-center bg-white/80 backdrop-blur-sm rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <option.Icon className="w-10 h-10 md:w-12 md:h-12 mb-4 text-indigo-600" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">{option.title}</h2>
              <p className="mt-2 text-xs md:text-sm text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};