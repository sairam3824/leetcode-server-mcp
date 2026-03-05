import fetch from "node-fetch";
import TurndownService from "turndown";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
const turndown = new TurndownService();

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class LeetCodeAPI {
  private cache = new Map<string, CacheEntry<any>>();

  private async graphqlQuery(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MCP-LeetCode-Server/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async getProblem(identifier: string) {
    const cacheKey = `problem:${identifier}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    const query = `
      query getQuestion($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          content
          difficulty
          topicTags { name slug }
          exampleTestcases
          stats
        }
      }
    `;

    const result = await this.graphqlQuery(query, { titleSlug: identifier });
    const q = result.data.question;

    const problem = {
      id: q.questionId,
      title: q.title,
      titleSlug: q.titleSlug,
      description: turndown.turndown(q.content),
      difficulty: q.difficulty,
      tags: q.topicTags.map((t: any) => t.name),
      examples: q.exampleTestcases,
      acceptanceRate: JSON.parse(q.stats).acRate,
    };

    this.setCache(cacheKey, problem, 24 * 60 * 60 * 1000); // 24 hours
    return problem;
  }

  async getRandomProblem(difficulty?: string, tag?: string, status?: string) {
    const query = `
      query problemsetQuestionList($categorySlug: String, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          filters: $filters
        ) {
          questions: data {
            questionId
            title
            titleSlug
            difficulty
          }
        }
      }
    `;

    const filters: any = {};
    if (difficulty) filters.difficulty = difficulty.toUpperCase();
    if (tag) filters.tags = [tag];

    const result = await this.graphqlQuery(query, { categorySlug: "", filters });
    const questions = result.data.problemsetQuestionList.questions;

    if (questions.length === 0) {
      throw new Error("No problems found matching criteria");
    }

    const random = questions[Math.floor(Math.random() * questions.length)];
    return this.getProblem(random.titleSlug);
  }

  async searchProblems(query?: string, difficulty?: string, tag?: string, limit = 20) {
    const graphqlQuery = `
      query problemsetQuestionList($categorySlug: String, $filters: QuestionListFilterInput, $limit: Int) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          filters: $filters
          limit: $limit
        ) {
          questions: data {
            questionId
            title
            titleSlug
            difficulty
            topicTags { name }
            stats
          }
        }
      }
    `;

    const filters: any = {};
    if (difficulty) filters.difficulty = difficulty.toUpperCase();
    if (tag) filters.tags = [tag];
    if (query) filters.searchKeywords = query;

    const result = await this.graphqlQuery(graphqlQuery, {
      categorySlug: "",
      filters,
      limit
    });

    return result.data.problemsetQuestionList.questions.map((q: any) => ({
      id: q.questionId,
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
      tags: q.topicTags.map((t: any) => t.name),
      acceptanceRate: JSON.parse(q.stats).acRate,
    }));
  }

  async getDailyChallenge() {
    const cacheKey = "daily-challenge";
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    const query = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            questionId
            title
            titleSlug
            difficulty
          }
        }
      }
    `;

    const result = await this.graphqlQuery(query);
    const daily = result.data.activeDailyCodingChallengeQuestion;
    const problem = await this.getProblem(daily.question.titleSlug);

    const ttl = new Date().setHours(24, 0, 0, 0) - Date.now(); // Cache until midnight
    this.setCache(cacheKey, problem, ttl);

    return problem;
  }

  async getProblemHints(problemSlug: string) {
    const problem = await this.getProblem(problemSlug);

    return {
      hint1: `This is a ${problem.difficulty} problem involving ${problem.tags.slice(0, 2).join(" and ")}. Consider what data structures would be most efficient.`,
      hint2: `For ${problem.tags[0]} problems, common techniques include: iteration, recursion, or using hash maps for O(1) lookups.`,
      hint3: `Pseudocode approach:\n1. Initialize necessary data structures\n2. Iterate through input\n3. Apply core algorithm logic\n4. Return result`,
    };
  }

  async validateApproach(problemSlug: string, approach: string) {
    const problem = await this.getProblem(problemSlug);

    return {
      problemTitle: problem.title,
      approach: approach,
      analysis: "Approach validation requires problem-specific logic. Consider: Does it handle all edge cases? What's the time complexity? Space complexity?",
      suggestedComplexity: "Analyze your loops and data structures to determine Big O notation",
      edgeCases: ["Empty input", "Single element", "Duplicate values", "Maximum constraints"],
    };
  }

  async getSimilarProblems(problemSlug: string) {
    const problem = await this.getProblem(problemSlug);
    const mainTag = problem.tags[0];

    const similar = await this.searchProblems(undefined, problem.difficulty, mainTag, 10);
    return similar.filter((p: any) => p.titleSlug !== problemSlug).slice(0, 5);
  }

  async getTopicRoadmap(topic: string) {
    const difficulties = ["easy", "medium", "hard"];
    const roadmap = [];

    for (const diff of difficulties) {
      const problems = await this.searchProblems(undefined, diff, topic, 5);
      roadmap.push(...problems);
    }

    return roadmap;
  }

  async explainSolution(problemSlug: string, solutionCode: string) {
    const problem = await this.getProblem(problemSlug);

    return {
      problemTitle: problem.title,
      approach: "Code analysis would require AST parsing. General explanation: Review the algorithm pattern used.",
      timeComplexity: "Analyze loops and recursive calls",
      spaceComplexity: "Consider auxiliary data structures used",
      alternatives: `For ${problem.tags[0]} problems, consider: brute force, optimized with hash maps, or dynamic programming approaches.`,
    };
  }

  async getCompanyProblems(company: string) {
    const cacheKey = `company:${company}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    // LeetCode's company tags require premium, so we return popular problems
    const problems = await this.searchProblems(undefined, undefined, undefined, 50);
    const filtered = problems.slice(0, 20);

    this.setCache(cacheKey, filtered, 7 * 24 * 60 * 60 * 1000); // 7 days
    return filtered;
  }
}
