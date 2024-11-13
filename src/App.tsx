import React from 'react';
import { SignIn, SignOutButton, useUser } from '@clerk/clerk-react';
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { StartupCard, StartupsLoggedIn, StartupsLoggedOut } from './components/StartupCard';
import { Leaderboard, LeaderboardWithUserVotes } from './components/Leaderboard';
import { UserRatings } from './components/UserRatings';
import { Rocket, History, Trophy } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import toast, { Toaster } from 'react-hot-toast';

type View = 'RATE' | 'LEADERBOARD' | 'PROFILE';

function App() {
    const { isSignedIn, } = useUser();
    const [currentView, setCurrentView] = React.useState<View>('RATE');

    const startups = useQuery(api.startups.list) || [];

    if (!isSignedIn && currentView === 'PROFILE') {
        setCurrentView('RATE');
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
        <Rocket className="h-8 w-8 text-[#FF4F00]" />
        <h1 className="text-2xl font-bold text-gray-900">Cracked or Cooked</h1>
        </div>
        <div className="flex items-center gap-4">
        <nav className="flex gap-1">
        <button
        onClick={() => setCurrentView('RATE')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'RATE'
                ? 'bg-[#FF4F00] text-white'
                : 'text-gray-600 hover:bg-gray-100'
        }`}
        >
        Rate
        </button>
        <button
        onClick={() => setCurrentView('LEADERBOARD')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentView === 'LEADERBOARD'
                ? 'bg-[#FF4F00] text-white'
                : 'text-gray-600 hover:bg-gray-100'
        }`}
        >
        <span className="flex items-center gap-1">
        <Trophy className="w-4 h-4" />
        Leaderboard
        </span>
        </button>
        {isSignedIn && (
            <button
            onClick={() => setCurrentView('PROFILE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'PROFILE'
                    ? 'bg-[#FF4F00] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            <span className="flex items-center gap-1">
            <History className="w-4 h-4" />
            My Ratings
            </span>
            </button>
        )}
        </nav>
        {isSignedIn ? (
            <SignOutButton>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
            Sign Out
            </button>
            </SignOutButton>
        ) : (
        <SignIn />
        )}
        </div>
        </div>
        </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {currentView === 'RATE' && (
            <>
            <Unauthenticated>
            <StartupsLoggedOut />
            </Unauthenticated>
            <Authenticated>
            <StartupsLoggedIn />
            </Authenticated>
            </>
        )}

        {currentView === 'LEADERBOARD' && (
            <div className="max-w-3xl mx-auto">
            <Unauthenticated>
            <Leaderboard startups={startups} />
            </Unauthenticated>
            <Authenticated>
            <LeaderboardWithUserVotes startups={startups} />
            </Authenticated>
            </div>
        )}

        {currentView === 'PROFILE' && isSignedIn && (
            <div className="max-w-3xl mx-auto">
            <UserRatings startups={startups} />
            </div>
        )}
        </main>
        </div>
    );
}

export default App;
