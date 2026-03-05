# MCP LeetCode Server

An MCP (Model Context Protocol) server that connects LLMs to LeetCode, enabling AI-powered coding practice with intelligent problem selection, hints, solution validation, and personalized recommendations.

## Features

### Tools

1. **get_problem** - Fetch a specific LeetCode problem by slug or number
   - Returns: title, description (converted to markdown), difficulty, tags, examples, acceptance rate

2. **get_random_problem** - Get a random problem with filters
   - Filter by: difficulty (easy/medium/hard), tag (arrays, dp, trees, graphs, etc.), status (solved/unsolved)

3. **search_problems** - Search problems by keyword, tag, or difficulty
   - Returns paginated results with title, difficulty, acceptance rate, and tags

4. **get_daily_challenge** - Fetch today's LeetCode daily challenge

5. **get_problem_hints** - Progressive hints without spoilers
   - Hint 1: Approach category
   - Hint 2: Specific technique
   - Hint 3: Pseudocode outline

6. **validate_approach** - Analyze a proposed solution approach
   - Evaluates correctness, time/space complexity, and edge cases

7. **get_similar_problems** - Find related problems
   - Based on tags and difficulty level

8. **get_topic_roadmap** - Curated learning path for a topic
   - Returns problems ordered from easy to hard for systematic practice

9. **explain_solution** - Detailed solution explanation
   - Approach analysis, complexity breakdown, and alternative methods

10. **get_company_problems** - Problems frequently asked by specific companies
    - Supports: Google, Meta, Amazon, Microsoft, Apple, and more

### Prompts

The server includes MCP prompt templates for structured practice sessions:

- **daily-practice** - Structured daily practice session with warm-up, main problem, and review
- **topic-deep-dive** - Focused practice on a specific topic with progressive difficulty
- **interview-prep** - Simulated interview problem set with time constraints

## Installation

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd mcp-leetcode-server

# Install dependencies
npm install

# Build the project
npm run build
```

### From npm (when published)

```bash
npm install -g mcp-leetcode-server
```

## Usage

### With MCP Client (Kiro, Claude Desktop, etc.)

Add to your MCP client configuration file (e.g., `~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "leetcode": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-leetcode-server/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `/absolute/path/to/mcp-leetcode-server` with the actual path to your installation.

### Standalone Testing

```bash
node build/index.js
```

### Example Usage

See [examples/usage-examples.md](examples/usage-examples.md) for detailed usage patterns and workflows.

## Quick Start

1. Install and configure the server
2. Ask your LLM: "Get me today's LeetCode daily challenge"
3. Use progressive hints: "Give me hints for this problem"
4. Validate your approach: "Would using a hash map work for this problem?"
5. Track your progress automatically via practice history

## Implementation Details

- Uses LeetCode's GraphQL API (https://leetcode.com/graphql)
- Aggressive caching to handle rate limiting
- HTML to Markdown conversion for clean problem descriptions
- Local practice history tracking (stored in `practice-history.json`)
- TypeScript with `@modelcontextprotocol/sdk`
- stdio transport for MCP communication

## Practice History

The server maintains a local practice history file to provide personalized recommendations. This includes:
- Problems attempted
- Success/failure status
- Timestamps
- Topics practiced

## Rate Limiting

The server implements intelligent caching to minimize API calls:
- Problem data cached for 24 hours
- Daily challenge cached until next day
- Search results cached for 1 hour

## Troubleshooting

### Server Not Connecting

- Verify the path in your MCP config is absolute and correct
- Check that `build/index.js` exists (run `npm run build`)
- Look for errors in your MCP client logs

### API Rate Limiting

- The server caches aggressively to minimize API calls
- If you hit rate limits, wait a few minutes
- Cached data: problems (24h), daily challenge (until midnight), searches (1h)

### Practice History Not Saving

- Ensure write permissions in the server directory
- Check for `practice-history.json` file creation
- File is created automatically on first problem attempt

### Problems Not Loading

- Verify internet connection
- Check if LeetCode.com is accessible
- Some problems may require LeetCode premium (server will indicate this)

## Development

### Watch Mode

```bash
npm run watch
```

### Project Structure

```
mcp-leetcode-server/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── leetcode-api.ts    # LeetCode GraphQL API client
│   ├── definitions.ts     # Tool and prompt definitions
│   └── practice-history.ts # Local practice tracking
├── examples/              # Usage examples and configs
├── build/                 # Compiled JavaScript (generated)
└── practice-history.json  # Local practice data (generated)
```

## Roadmap

- [ ] Add submission and testing capabilities
- [ ] Enhanced company problem filtering (requires premium)
- [ ] Code execution and validation
- [ ] Statistics and progress visualization
- [ ] Multi-language solution templates
- [ ] Integration with local code editors

## License

Apache License 2.0 - See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Disclaimer

This is an unofficial tool and is not affiliated with LeetCode. Please respect LeetCode's terms of service and rate limits.
