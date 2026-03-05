#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { LeetCodeAPI } from "./leetcode-api.js";
import { PracticeHistory } from "./practice-history.js";
import { TOOLS, PROMPTS } from "./definitions.js";

const api = new LeetCodeAPI();
const history = new PracticeHistory();

// Graceful error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const server = new Server(
  {
    name: "mcp-leetcode-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS,
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "daily-practice") {
    const daily = await api.getDailyChallenge();
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# Daily Practice Session\n\n## Today's Challenge\n${(daily as any).title} (${(daily as any).difficulty})\n\nLet's start with a warm-up, then tackle the daily challenge, and finish with review.`,
          },
        },
      ],
    };
  }

  if (name === "topic-deep-dive") {
    const topic = args?.topic as string || "dynamic-programming";
    const roadmap = await api.getTopicRoadmap(topic);
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# ${topic} Deep Dive\n\nHere's your learning path with ${roadmap.length} problems from easy to hard. Let's master this topic!`,
          },
        },
      ],
    };
  }

  if (name === "interview-prep") {
    const company = args?.company as string || "google";
    const problems = await api.getCompanyProblems(company);
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `# Interview Prep: ${company}\n\nPractice set of ${problems.length} problems commonly asked at ${company}. Simulate interview conditions!`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "get_problem": {
        const problem: any = await api.getProblem(args.identifier as string);
        history.recordAttempt(problem.titleSlug);
        return { content: [{ type: "text", text: JSON.stringify(problem, null, 2) }] };
      }

      case "get_random_problem": {
        const problem = await api.getRandomProblem(
          args.difficulty as string,
          args.tag as string,
          args.status as string
        );
        return { content: [{ type: "text", text: JSON.stringify(problem, null, 2) }] };
      }

      case "search_problems": {
        const results = await api.searchProblems(
          args.query as string,
          args.difficulty as string,
          args.tag as string,
          args.limit as number
        );
        return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
      }

      case "get_daily_challenge": {
        const daily = await api.getDailyChallenge();
        return { content: [{ type: "text", text: JSON.stringify(daily, null, 2) }] };
      }

      case "get_problem_hints": {
        const hints = await api.getProblemHints(args.problemSlug as string);
        return { content: [{ type: "text", text: JSON.stringify(hints, null, 2) }] };
      }

      case "validate_approach": {
        const validation = await api.validateApproach(
          args.problemSlug as string,
          args.approach as string
        );
        return { content: [{ type: "text", text: JSON.stringify(validation, null, 2) }] };
      }

      case "get_similar_problems": {
        const similar = await api.getSimilarProblems(args.problemSlug as string);
        return { content: [{ type: "text", text: JSON.stringify(similar, null, 2) }] };
      }

      case "get_topic_roadmap": {
        const roadmap = await api.getTopicRoadmap(args.topic as string);
        return { content: [{ type: "text", text: JSON.stringify(roadmap, null, 2) }] };
      }

      case "explain_solution": {
        const explanation = await api.explainSolution(
          args.problemSlug as string,
          args.solutionCode as string
        );
        return { content: [{ type: "text", text: JSON.stringify(explanation, null, 2) }] };
      }

      case "get_company_problems": {
        const problems = await api.getCompanyProblems(args.company as string);
        return { content: [{ type: "text", text: JSON.stringify(problems, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP LeetCode Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
