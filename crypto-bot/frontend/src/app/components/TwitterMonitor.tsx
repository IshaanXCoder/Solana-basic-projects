'use client';

import { useState, useEffect } from 'react';
import { Tweet, TweetResponse } from '@/lib/langchain/get-tweets';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export default function TwitterMonitor() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startMonitoring = async () => {
    if (!userId || !username) {
      setError('Please enter both User ID and Username');
      return;
    }

    setIsMonitoring(true);
    setError(null);
    await fetchTweets();
  };

  const fetchTweets = async () => {
    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userName: username }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tweets');
      }

      const data: TweetResponse = await response.json();
      setTweets(data.tweets);

      // Analyze each tweet
      for (const tweet of data.tweets) {
        analyzeTweet(tweet);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsMonitoring(false);
    }
  };

  const analyzeTweet = async (tweet: Tweet) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetContent: tweet.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze tweet');
      }

      const { tokenAddress } = await response.json();
      if (tokenAddress) {
        // Token found, initiate swap
        await initiateSwap(tokenAddress);
      }
    } catch (err) {
      console.error('Error analyzing tweet:', err);
    }
  };

  const initiateSwap = async (tokenAddress: string) => {
    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate swap');
      }

      const { result } = await response.json();
      console.log('Swap completed:', result);
    } catch (err) {
      console.error('Error initiating swap:', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(fetchTweets, 60000); // Check every minute
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring, userId, username]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="userId" className="text-sm font-medium text-slate-200">
          Twitter User ID
        </label>
        <Input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-slate-100"
          placeholder="Enter Twitter User ID"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-slate-200">
          Username
        </label>
        <Input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-slate-100"
          placeholder="Enter username"
        />
      </div>
      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}
      <Button
        onClick={startMonitoring}
        disabled={isMonitoring}
        className="w-full"
        variant={isMonitoring ? "secondary" : "default"}
      >
        {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
      </Button>
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3 text-slate-100">Recent Tweets</h3>
        <div className="space-y-3">
          {tweets.map((tweet, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-200">{tweet.text}</p>
              <div className="mt-2 flex items-center space-x-3">
                <Badge variant="secondary" className="text-xs">
                  {new Date(tweet.createdAt).toLocaleString()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ❤️ {tweet.likeCount}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🔄 {tweet.retweetCount}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 