import { getTokenFromLLM } from './get-token-from-llm';
import { getTweets } from './get-tweets';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
const SOL_AMOUNT = 1 * LAMPORTS_PER_SOL;
//the purpose of the above 

//COLOURS FOR THE TERMINAL
const colors = {
  success: '\x1b[42m\x1b[30m',
  error: '\x1b[41m\x1b[37m',  
  reset: '\x1b[0m'            
};

async function main(userId: string, userName: string) {
  try {
    // Get tweets from the last hour
    const tweetResult = await getTweets(userId, userName);
    console.log(`Analyzing ${tweetResult.count} tweets from the last hour...`);

    for (const tweet of tweetResult.tweets) {
      console.log('\nAnalyzing tweet:', tweet.text);
      
      // Get token address from LLM analysis
      const tokenAddress = await getTokenFromLLM(tweet.text);
      
      if (tokenAddress) {
        console.log(`${colors.success} 🚨 Potential token found! ${colors.reset}`);
        console.log('Token Address:', tokenAddress);
        console.log('Tweet timestamp:', new Date(tweet.createdAt).toLocaleString());
        console.log('Tweet metrics - Likes:', tweet.likeCount, 'Retweets:', tweet.retweetCount);
        
        // Here you would add your token validation and swap logic
        // For example:
        // const isToken = await validateToken(tokenAddress);
        // if (isToken) {
        //   await swap(tokenAddress, SOL_AMOUNT);
        // }
      } else {
        console.log(`${colors.error} No relevant token found in this tweet ${colors.reset}`);
      }
    }

    if (tweetResult.count === 0) {
      console.log(`${colors.error} No tweets found in the last hour. ${colors.reset}`);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Start monitoring tweets for a specific user
main("1289036187542290432", "0xIshaanK06");