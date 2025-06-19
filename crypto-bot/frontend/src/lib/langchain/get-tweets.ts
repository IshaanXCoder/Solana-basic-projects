import axios from "axios";

const TWEET_MAX_TIME_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export interface Tweet {
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
}

export interface TweetResponse {
  count: number;
  tweets: Tweet[];
}

export async function getTweets(userId: string, userName: string): Promise<TweetResponse> {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.twitterapi.io/twitter/user/last_tweets?userId=${userId}&userName=${userName}`,
    headers: { 
      'X-API-Key': process.env.NEXT_PUBLIC_TWITTER_API_KEY
    }
  };

  try {
    const response = await axios.request(config);
    const currentTime = new Date().getTime();
    
    // Filter tweets within the specified time window
    const recentTweets = response.data.data.tweets.filter((tweet: any) => {
      const tweetTime = new Date(tweet.createdAt).getTime();
      return (currentTime - tweetTime) <= TWEET_MAX_TIME_MS;
    });

    return {
      count: recentTweets.length,
      tweets: recentTweets.map((tweet: any) => ({
        text: tweet.text,
        createdAt: tweet.createdAt,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount
      }))
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
} 