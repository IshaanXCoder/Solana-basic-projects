import axios from "axios";

const TWEET_MAX_TIME_MS = 6*60 * 60 * 1000; // 1 hour in milliseconds

export async function getTweets(userId: string, userName: string) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.twitterapi.io/twitter/user/last_tweets?userId=${userId}&userName=${userName}`,
    headers: { 
      'X-API-Key': process.env.TWITTER_API_KEY
    }
  };

  try {
    const response = await axios.request(config);
    const currentTime = new Date().getTime();
    
    // Filter tweets within the last hour and log timestamps for debugging
    const recentTweets = response.data.data.tweets.filter((tweet: any) => {
      const tweetTime = new Date(tweet.createdAt).getTime();
      console.log(`Tweet time: ${new Date(tweetTime).toISOString()}`);
      console.log(`Time difference: ${(currentTime - tweetTime) / 1000 / 60} minutes`);
      return (currentTime - tweetTime) <= TWEET_MAX_TIME_MS;
    });

    console.log(`Total tweets: ${response.data.data.tweets.length}`);
    console.log(`Recent tweets: ${recentTweets.length}`);

    return {
      count: recentTweets.length,
      tweets: recentTweets
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
}