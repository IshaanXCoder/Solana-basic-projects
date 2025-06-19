import { getTokenFromLLM } from './get-token-from-llm';
import { getTweets } from './get-tweets';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { swap } from './swap';
import promptSync from 'prompt-sync';
const SOL_AMOUNT = 0.001 * LAMPORTS_PER_SOL;
//the purpose of the above 

//COLOURS FOR THE TERMINAL
const colors = {
  success: '\x1b[42m\x1b[30m',
  error: '\x1b[41m\x1b[37m',  
  reset: '\x1b[0m'            
};

const prompt = promptSync();





async function main1(userId: string, userName: string, SOL_AMOUNT: number) {
  try {
    // Get tweets from the last hourc
    const tweetResult = await getTweets(userId, userName);
    console.log(`Analyzing ${tweetResult.count} tweets from the last hour...`);

    for (const tweet of tweetResult.tweets) {
      console.log('\nAnalyzing tweet:', tweet.text);
      
      // Get token address from LLM analysis
      const tokenAddress = await getTokenFromLLM(tweet.text);
      
      if (tokenAddress) {
        console.log(`${colors.success} 🚨 Potential token found! ${colors.reset}`);
        // console.log('Username is :');
        console.log('Token Address:', tokenAddress);
        console.log('Tweet timestamp:', new Date(tweet.createdAt).toLocaleString());
        console.log('Tweet metrics - Likes:', tweet.likeCount, 'Retweets:', tweet.retweetCount);
        await swap(tokenAddress, SOL_AMOUNT);
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
console.log("gm gm!");
console.log("you've three options, 1. nothing, 2. swap, 3. exit");
const option = prompt("enter your option: ");
if (option === "1") {
  console.log("ngmi");
} else if (option === "2") {
  
  main1("828501278393196545", "0xRandommech", SOL_AMOUNT)

} else if (option === "3") {
  console.log("exiting...");
  process.exit(0);
} else {
  console.log("invalid option");
}