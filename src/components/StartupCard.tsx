import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Flame, Snowflake } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import toast from 'react-hot-toast';
import { Doc } from '../../convex/_generated/dataModel';


type SetVoteFn = (name: string, vote: 'CRACKED' | 'COOKED') => Promise<void>;

interface StartupCardProps {
  startup: Doc<'startups'>;
  userVote?: 'CRACKED' | 'COOKED';
  setVote: SetVoteFn
}
const userVoteData = (): Record<string, 'CRACKED' | 'COOKED'> => JSON.parse(localStorage.getItem('userVoteData') || '{}');


export function StartupsLoggedOut() {
    const [userVotes, setUserVotes] = useState(userVoteData());

    useEffect(() => {
        localStorage.setItem('userVoteData', JSON.stringify(userVotes));
            }, [userVotes]);

    return (
        <Startups
            setVote={(name, voteValue) => {
                console.log(name, voteValue);
                setUserVotes({
                    ...userVotes,
                    [name]: voteValue
                });
                return Promise.resolve();
            }}
            userVotes={userVotes}
        />
            )
}



export function StartupsLoggedIn() {
    const vote = useMutation(api.startups.vote);
    const setVote = async (name: string, voteValue: 'CRACKED' | 'COOKED') => { 
        await vote({ startupName: name, vote: voteValue })
        return
    };
    const userVotes = useQuery(api.votes.listByUser) || [];

    return (
        <Startups
            setVote={setVote}
            userVotes={userVotes.reduce((acc, vote) => ({
                ...acc,
                [vote.startupName]: vote.vote
            }), {} as Record<string, 'CRACKED' | 'COOKED'>)}
        />
    )

}

function Startups({
    userVotes,
    setVote,
} : {
    userVotes: Record<string, 'CRACKED' | 'COOKED'>;
    setVote: SetVoteFn;
}) {
    const startups = useQuery(api.startups.list) || [];
    const unvotedStartups = startups.filter(startup => !userVotes[startup.name]);
    console.log(startups, userVotes, unvotedStartups);
    // const [userVotes, setUserVotes] = useState(userVoteData());
    // useEffect(() => {
    //     localStorage.setItem('userVoteData', JSON.stringify(userVotes));
    // }, [userVotes]);

    return (
        <div className="flex flex-col items-center gap-8">
        <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rate Today's Startups</h2>
        <p className="text-gray-600">Help identify the next unicorn! Is it cracked or cooked?</p>
        </div>

        {unvotedStartups.length ? (
            <StartupCard
            startup={unvotedStartups[0]}
            userVote={userVotes[unvotedStartups[0].name]}
            setVote={setVote}
            />
        ) : (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">You're all caught up!</h3>
        <p className="text-gray-600">Come back tomorrow for more startups to rate.</p>
            </div>
        )}
        </div>
    )
}


export function StartupCard({ startup, userVote, setVote }: StartupCardProps) {
  const total = startup.crackedCount + startup.cookedCount;
  const crackedPercentage = total > 0 ? (startup.crackedCount / total) * 100 : 0;
  const { isSignedIn, } = useUser();
const [showedToast, setShowedToast] = useState(false);
// console.log(startup, userVote, setVote);

  const handleVote = async (type: 'CRACKED' | 'COOKED') => {
    if (!isSignedIn && !showedToast) {
      toast('Sign in to save your votes!', { icon: '👋' });
        setShowedToast(true);
        setTimeout(() => setShowedToast(false), 3000);
    }

    try {
        console.log(startup._id, type);
      await setVote(startup.name, type);
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to vote');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full">
      <img
        src={startup.imageUrl}
        alt={startup.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{startup.name}</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            {startup.category}
          </span>
        </div>
        <p className="text-gray-600 mb-6">{startup.description}</p>
        
        <div className="flex justify-between gap-4">
          <button
            onClick={() => handleVote('CRACKED')}
            disabled={!!userVote}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              userVote === 'CRACKED'
                ? 'bg-[#FF4F00] text-white cursor-default'
                : userVote
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-[#FF4F00] text-white hover:bg-[#E64800]'
            }`}
          >
            <Flame className="w-5 h-5" />
            Cracked
          </button>
          <button
            onClick={() => handleVote('COOKED')}
            disabled={!!userVote}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              userVote === 'COOKED'
                ? 'bg-gray-900 text-white cursor-default'
                : userVote
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Snowflake className="w-5 h-5" />
            Cooked
          </button>
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF4F00]"
                style={{ width: `${crackedPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{Math.round(crackedPercentage)}% Cracked</span>
              <span>{Math.round(100 - crackedPercentage)}% Cooked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
