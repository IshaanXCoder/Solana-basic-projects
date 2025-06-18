import axios from "axios";

const TWEET_MAX_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getTweets(userId: string, userName: string) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.twitterapi.io/twitter/user/last_tweets?userId=${userId}&userName=${userName}`,
    headers: { 
      'X-API-Key': '39a3ba39e7374170b581896ba808afeb'
    }
  };

  try {
    const response = await axios.request(config);
    const currentTime = new Date().getTime();
    
    // Filter tweets within the last hour
    const recentTweets = response.data.data.tweets.filter((tweet: any) => {
      const tweetTime = new Date(tweet.createdAt).getTime();
      return (currentTime - tweetTime) <= TWEET_MAX_TIME_MS;
    });

    return {
      count: recentTweets.length,
      tweets: recentTweets
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
}