/**
 * Test script for Business Department slide generation
 * Run with: npx tsx scripts/test-business-slides.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

// Load .env file manually
const envPath = join(process.cwd(), ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
} catch {
  console.warn("Could not load .env file");
}

import { writeFileSync } from "fs";
import { executeBusinessDepartment, type BusinessVariables, type BusinessArtifact } from "../lib/ai/agents/business";

async function main() {
  console.log("=== Testing Business Department Slide Generation ===\n");

  const testVariables: BusinessVariables = {
    companyName: "TestCorp",
    industry: "Technology",
    productDescription: "A SaaS platform for project management",
    targetAudience: "Small to medium businesses",
    fundingStage: "seed",
    revenueModel: "SaaS subscription",
    uniqueValue: "AI-powered automation",
    competitors: "Asana, Monday, Trello",
  };

  console.log("Test Variables:", testVariables);
  console.log("\n--- Starting Generation ---\n");

  const results: { type: string; success: boolean; slideCount?: number; error?: string }[] = [];

  try {
    const result = await executeBusinessDepartment(testVariables, {
      onAgentStart: (agentId) => {
        console.log(`[START] Agent: ${agentId}`);
      },
      onAgentComplete: (agentId) => {
        console.log(`[COMPLETE] Agent: ${agentId}`);
      },
      onStep: (agentId, step) => {
        if (step.type === "thinking") {
          console.log(`  [${agentId}] ${step.content}`);
        }
      },
      onArtifact: (artifact) => {
        const hasError = artifact.data.summary?.startsWith("Error:");
        const slideCount = artifact.data.slideCount;

        results.push({
          type: artifact.type,
          success: !hasError && !!slideCount,
          slideCount,
          error: hasError ? artifact.data.summary : undefined,
        });

        if (hasError) {
          console.log(`  [ARTIFACT] ${artifact.type}: FAILED - ${artifact.data.summary}`);
        } else {
          console.log(`  [ARTIFACT] ${artifact.type}: SUCCESS - ${slideCount} slides`);
        }
      },
    });

    console.log("\n=== Generation Complete ===");
    console.log(`Total artifacts: ${result.artifacts.length}`);
    console.log(`Message: ${result.message}`);

    // Summary
    console.log("\n=== Summary ===");
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(`Success: ${successCount}/${results.length}`);
    console.log(`Failed: ${failCount}/${results.length}`);

    if (failCount > 0) {
      console.log("\nFailed generators:");
      results.filter((r) => !r.success).forEach((r) => {
        console.log(`  - ${r.type}: ${r.error || "Unknown error"}`);
      });
      process.exit(1);
    }

    // Verify all 4 types were generated
    const expectedTypes = ["pitch_deck", "business_plan", "competitive_analysis", "go_to_market"];
    const generatedTypes = results.map((r) => r.type);
    const missingTypes = expectedTypes.filter((t) => !generatedTypes.includes(t));

    if (missingTypes.length > 0) {
      console.log(`\nMissing presentation types: ${missingTypes.join(", ")}`);
      process.exit(1);
    }

    console.log("\n✓ All 4 presentation types generated successfully!");

    // Save sample PPTX files for verification
    console.log("\n--- Saving Sample PPTX Files ---");
    for (const artifact of result.artifacts) {
      if (artifact.data.pptxBase64) {
        const filename = `sample_${artifact.type}.pptx`;
        const buffer = Buffer.from(artifact.data.pptxBase64, "base64");
        writeFileSync(filename, buffer);
        console.log(`Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      }
    }
    console.log("\nOpen the PPTX files to verify charts and visuals!");

    process.exit(0);
  } catch (error) {
    console.error("\n=== FATAL ERROR ===");
    console.error(error);
    process.exit(1);
  }
}

main();
