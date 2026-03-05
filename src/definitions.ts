export const TOOLS = [
  {
    name: "get_problem",
    description: "Fetch a LeetCode problem by slug or number. Returns title, description (markdown), difficulty, tags, examples, acceptance rate.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "Problem slug (e.g., 'two-sum') or number (e.g., '1')",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "get_random_problem",
    description: "Get a random problem filtered by difficulty, tag, and status.",
    inputSchema: {
      type: "object",
      properties: {
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          description: "Problem difficulty level",
        },
        tag: {
          type: "string",
          description: "Topic tag (e.g., 'array', 'dynamic-programming', 'tree')",
        },
        status: {
          type: "string",
          enum: ["solved", "unsolved", "any"],
          description: "Problem status filter",
        },
      },
    },
  },
  {
    name: "search_problems",
    description: "Search problems by keyword, tag, or difficulty. Returns paginated list.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword",
        },
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          description: "Filter by difficulty",
        },
        tag: {
          type: "string",
          description: "Filter by topic tag",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 20)",
          default: 20,
        },
      },
    },
  },
  {
    name: "get_daily_challenge",
    description: "Fetch today's LeetCode daily challenge.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_problem_hints",
    description: "Return progressive hints for a problem without giving the full solution.",
    inputSchema: {
      type: "object",
      properties: {
        problemSlug: {
          type: "string",
          description: "Problem slug (e.g., 'two-sum')",
        },
      },
      required: ["problemSlug"],
    },
  },
  {
    name: "validate_approach",
    description: "Analyze if a described approach would work, including time/space complexity and edge cases.",
    inputSchema: {
      type: "object",
      properties: {
        problemSlug: {
          type: "string",
          description: "Problem slug",
        },
        approach: {
          type: "string",
          description: "Description of the proposed solution approach",
        },
      },
      required: ["problemSlug", "approach"],
    },
  },
  {
    name: "get_similar_problems",
    description: "Find problems similar to a given one (same tags, similar difficulty).",
    inputSchema: {
      type: "object",
      properties: {
        problemSlug: {
          type: "string",
          description: "Problem slug",
        },
      },
      required: ["problemSlug"],
    },
  },
  {
    name: "get_topic_roadmap",
    description: "Get a curated list of problems for a topic, ordered from easy to hard for systematic practice.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic name (e.g., 'dynamic-programming', 'graphs', 'binary-search')",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "explain_solution",
    description: "Explain a solution's approach, time/space complexity, and alternative methods.",
    inputSchema: {
      type: "object",
      properties: {
        problemSlug: {
          type: "string",
          description: "Problem slug",
        },
        solutionCode: {
          type: "string",
          description: "Solution code to explain",
        },
      },
      required: ["problemSlug", "solutionCode"],
    },
  },
  {
    name: "get_company_problems",
    description: "Fetch problems frequently asked by a specific company.",
    inputSchema: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description: "Company name (e.g., 'google', 'meta', 'amazon', 'microsoft')",
        },
      },
      required: ["company"],
    },
  },
];

export const PROMPTS = [
  {
    name: "daily-practice",
    description: "Structured daily practice session with warm-up, main problem, and review",
    arguments: [],
  },
  {
    name: "topic-deep-dive",
    description: "Focused practice on a specific topic with progressive difficulty",
    arguments: [
      {
        name: "topic",
        description: "Topic to practice (e.g., 'dynamic-programming', 'graphs')",
        required: true,
      },
    ],
  },
  {
    name: "interview-prep",
    description: "Simulated interview problem set with time constraints",
    arguments: [
      {
        name: "company",
        description: "Target company (e.g., 'google', 'meta', 'amazon')",
        required: true,
      },
    ],
  },
];
