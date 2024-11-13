import { useState } from 'react';
import { Startup } from '../types';
import { History, Flame, Snowflake, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface UserRatingsProps {
  startups: Startup[];
}

export function UserRatings({ startups }: UserRatingsProps) {
  const [filter, setFilter] = useState<'ALL' | 'CRACKED' | 'COOKED'>('ALL');
  const userVotesQuery = useQuery(api.votes.listByUser) || [];
  const userVotes= userVotesQuery.reduce((acc, vote) => ({
    ...acc,
    [vote.startupName]: vote.vote
  }), {} as Record<string, 'CRACKED' | 'COOKED'>);

  const votedStartups = startups.filter(startup => userVotes[startup.name]);
  
  const filteredStartups = votedStartups.filter(startup => {
    if (filter === 'ALL') return true;
    return userVotes[startup.name] === filter;
  });

  const stats = {
    total: votedStartups.length,
    cracked: votedStartups.filter(s => userVotes[s.name] === 'CRACKED').length,
    cooked: votedStartups.filter(s => userVotes[s.name] === 'COOKED').length,
  };

  if (!votedStartups.length) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900">No ratings yet</h3>
        <p className="text-gray-600">Start rating startups to build your profile!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Ratings</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-[#FF4F00]">{stats.cracked}</div>
          <div className="text-sm text-gray-600">Cracked</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.cooked}</div>
          <div className="text-sm text-gray-600">Cooked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'ALL'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('CRACKED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'CRACKED'
              ? 'bg-[#FF4F00] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cracked
        </button>
        <button
          onClick={() => setFilter('COOKED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'COOKED'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cooked
        </button>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {filteredStartups.map(startup => {
          const total = startup.crackedCount + startup.cookedCount;
          const crackedPercentage = total > 0 ? (startup.crackedCount / total) * 100 : 0;
          const isHot = crackedPercentage >= 60;
          const isCold = crackedPercentage <= 40;

          return (
            <div key={startup._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{startup.name}</h3>
                  {isHot && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {isCold && <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                {userVotes[startup.name] === 'CRACKED' ? (
                  <div className="flex items-center gap-1 text-[#FF4F00]">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">Cracked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-900">
                    <Snowflake className="w-4 h-4" />
                    <span className="text-sm font-medium">Cooked</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{startup.description}</p>
              
              {/* Rating Progress */}
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4F00]"
                    style={{ width: `${crackedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{startup.crackedCount} cracked</span>
                  <span>{startup.cookedCount} cooked</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
