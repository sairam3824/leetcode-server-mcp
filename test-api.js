import { LeetCodeAPI } from "./build/leetcode-api.js";

async function run() {
  const api = new LeetCodeAPI();
  try {
    const daily = await api.getDailyChallenge();
    console.log("Daily problem:", daily.title);
  } catch (err) {
    console.error("getDailyChallenge Error:", err);
  }
}
run();
