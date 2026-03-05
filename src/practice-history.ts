import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface PracticeRecord {
  problemSlug: string;
  timestamp: number;
  success?: boolean;
}

interface HistoryData {
  records: PracticeRecord[];
}

export class PracticeHistory {
  private historyFile: string;
  private data: HistoryData;

  constructor() {
    this.historyFile = join(process.cwd(), "practice-history.json");
    this.data = this.load();
  }

  private load(): HistoryData {
    if (!existsSync(this.historyFile)) {
      return { records: [] };
    }

    try {
      const content = readFileSync(this.historyFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return { records: [] };
    }
  }

  private save(): void {
    try {
      writeFileSync(this.historyFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("Failed to save practice history:", error);
    }
  }

  recordAttempt(problemSlug: string, success?: boolean): void {
    this.data.records.push({
      problemSlug,
      timestamp: Date.now(),
      success,
    });
    this.save();
  }

  getHistory(): PracticeRecord[] {
    return this.data.records;
  }

  getAttemptedProblems(): string[] {
    return [...new Set(this.data.records.map((r) => r.problemSlug))];
  }

  getProblemStats(problemSlug: string) {
    const attempts = this.data.records.filter((r) => r.problemSlug === problemSlug);
    return {
      totalAttempts: attempts.length,
      lastAttempt: attempts[attempts.length - 1]?.timestamp,
      successes: attempts.filter((a) => a.success).length,
    };
  }
}
