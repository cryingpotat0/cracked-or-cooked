import { Startup } from '../types';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface LeaderboardProps {
    startups: Startup[];
    userVotes?: Record<string, 'CRACKED' | 'COOKED'>;
}

export function LeaderboardWithUserVotes({ startups }: LeaderboardProps) {
    const userVotesQuery = useQuery(api.votes.listByUser) || [];

    return (
        <Leaderboard startups={startups} userVotes={userVotesQuery.reduce((acc, vote) => ({
            ...acc,
            [vote.startupId]: vote.vote
        }), {} as Record<string, 'CRACKED' | 'COOKED'>)} />
    );
}

export function Leaderboard({ startups, userVotes }: LeaderboardProps) {
    const sortedStartups = [...startups].sort((a, b) => {
        const aRatio = a.crackedCount / (a.crackedCount + a.cookedCount);
        const bRatio = b.crackedCount / (b.crackedCount + b.cookedCount);
        return bRatio - aRatio;
    });

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-[#FF4F00]" />
        <h2 className="text-xl font-bold text-gray-900">Global Leaderboard</h2>
        </div>

        <div className="space-y-4">
        {sortedStartups.map((startup, index) => {
            const total = startup.crackedCount + startup.cookedCount;
            const crackedPercentage = total > 0 ? (startup.crackedCount / total) * 100 : 0;
            const userVote = userVotes?.[startup._id];

            return (
                <div
                key={startup._id}
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                <span className="text-2xl font-bold text-gray-400 w-8">
                {index + 1}
                </span>

                <div className="flex-1">
                <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{startup.name}</h3>
                {userVote && (
                    <span className="text-sm text-gray-500">
                    (You voted {userVote.toLowerCase()})
                    </span>
                )}
                </div>

                <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                className="h-full bg-[#FF4F00]"
                style={{ width: `${crackedPercentage}%` }}
                />
                </div>
                <div className="flex justify-between mt-1 text-sm">
                <span className="text-[#FF4F00]">
                {startup.crackedCount} cracked
                </span>
                <span className="text-gray-600">
                {startup.cookedCount} cooked
                </span>
                </div>
                </div>
                </div>

                {crackedPercentage >= 60 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                ) : crackedPercentage <= 40 ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
                ) : null}
                </div>
            );
        })}
        </div>
        </div>
    );
}
