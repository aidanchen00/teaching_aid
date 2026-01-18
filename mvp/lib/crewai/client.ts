import { spawn } from "child_process";
import path from "path";

export interface CrewAIResearchInput {
  companyName: string;
  industry: string;
  competitors?: string[];
  targetAudience?: string;
}

export interface CrewAIResearchOutput {
  success: boolean;
  companyName?: string;
  industry?: string;
  competitors?: string[];
  research?: {
    marketResearch: string | null;
    competitiveAnalysis: string | null;
    strategicRecommendations: string | null;
  };
  summary?: string;
  generatedBy?: string;
  error?: string;
}

/**
 * Run CrewAI market research using Python script
 * Requires: pip install crewai crewai-tools openai
 */
export async function runCrewAIResearch(
  input: CrewAIResearchInput
): Promise<CrewAIResearchOutput> {
  const scriptPath = path.join(process.cwd(), "scripts", "crewai_research.py");

  return new Promise((resolve) => {
    const python = spawn("python3", [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Send input JSON to stdin
    python.stdin.write(JSON.stringify(input));
    python.stdin.end();

    python.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr || `Process exited with code ${code}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch {
        resolve({
          success: false,
          error: `Failed to parse output: ${stdout}`,
        });
      }
    });

    python.on("error", (err) => {
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${err.message}. Make sure Python 3 and CrewAI are installed.`,
      });
    });

    // Timeout after 5 minutes (CrewAI can take a while)
    setTimeout(() => {
      python.kill();
      resolve({
        success: false,
        error: "CrewAI research timed out after 5 minutes",
      });
    }, 5 * 60 * 1000);
  });
}

/**
 * Check if CrewAI is available
 */
export async function checkCrewAIAvailability(): Promise<{
  available: boolean;
  message: string;
}> {
  return new Promise((resolve) => {
    const python = spawn("python3", ["-c", "import crewai; print('ok')"]);

    let stdout = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0 && stdout.includes("ok")) {
        resolve({
          available: true,
          message: "CrewAI is available",
        });
      } else {
        resolve({
          available: false,
          message: "CrewAI not installed. Run: pip install crewai crewai-tools openai",
        });
      }
    });

    python.on("error", () => {
      resolve({
        available: false,
        message: "Python 3 not found or not accessible",
      });
    });

    // Quick timeout for availability check
    setTimeout(() => {
      python.kill();
      resolve({
        available: false,
        message: "Timeout checking CrewAI availability",
      });
    }, 10000);
  });
}
