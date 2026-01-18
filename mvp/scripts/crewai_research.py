#!/usr/bin/env python3
"""
CrewAI Market Research Agent
Performs competitive analysis and market research using AI agents

Usage:
    echo '{"companyName": "Acme", "industry": "SaaS", "competitors": ["Competitor1"]}' | python crewai_research.py

Requires:
    pip install crewai crewai-tools openai
"""

import json
import sys
import os
from typing import Optional

# Check for CrewAI installation
try:
    from crewai import Agent, Task, Crew, Process
    from crewai_tools import SerperDevTool
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False


def create_research_crew(
    company_name: str,
    industry: str,
    competitors: list[str],
    target_audience: Optional[str] = None
) -> dict:
    """
    Create and run a CrewAI crew for market research
    """
    if not CREWAI_AVAILABLE:
        return {
            "success": False,
            "error": "CrewAI not installed. Run: pip install crewai crewai-tools openai"
        }

    # Check for API keys
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "success": False,
            "error": "OPENAI_API_KEY environment variable not set"
        }

    # Initialize search tool (optional - works without Serper API key)
    search_tool = None
    if os.getenv("SERPER_API_KEY"):
        search_tool = SerperDevTool()

    # Define agents
    market_researcher = Agent(
        role="Market Research Analyst",
        goal=f"Conduct thorough market research for {company_name} in the {industry} industry",
        backstory="""You are an experienced market research analyst with expertise in
        competitive analysis, market sizing, and trend identification. You excel at
        synthesizing information into actionable insights.""",
        verbose=False,
        allow_delegation=False,
        tools=[search_tool] if search_tool else [],
    )

    competitive_analyst = Agent(
        role="Competitive Intelligence Analyst",
        goal=f"Analyze competitors of {company_name} and identify strategic opportunities",
        backstory="""You are a strategic competitive analyst who specializes in
        understanding competitor strengths, weaknesses, and market positioning.
        You provide clear, actionable competitive intelligence.""",
        verbose=False,
        allow_delegation=False,
        tools=[search_tool] if search_tool else [],
    )

    strategy_advisor = Agent(
        role="Business Strategy Advisor",
        goal=f"Synthesize research into strategic recommendations for {company_name}",
        backstory="""You are a senior business strategist who translates market research
        and competitive intelligence into clear strategic recommendations. You focus on
        actionable insights that drive business growth.""",
        verbose=False,
        allow_delegation=False,
    )

    # Define tasks
    market_research_task = Task(
        description=f"""Research the {industry} market for {company_name}.

        Focus on:
        1. Current market size and growth projections
        2. Key market trends and drivers
        3. Target customer segments{f' (especially: {target_audience})' if target_audience else ''}
        4. Common pain points in the market
        5. Emerging opportunities

        Provide specific data points and insights where possible.""",
        expected_output="""A comprehensive market research report with:
        - Market overview and size
        - Key trends (3-5 trends)
        - Customer segments and pain points
        - Market opportunities""",
        agent=market_researcher,
    )

    competitive_analysis_task = Task(
        description=f"""Analyze the competitive landscape for {company_name}.

        Key competitors to analyze: {', '.join(competitors) if competitors else 'Identify top 3-5 competitors'}

        For each competitor, analyze:
        1. Market positioning and value proposition
        2. Key strengths and weaknesses
        3. Pricing strategy (if available)
        4. Target customer focus
        5. Differentiating features

        Identify gaps and opportunities for {company_name}.""",
        expected_output="""A competitive analysis report with:
        - Competitor profiles (positioning, strengths, weaknesses)
        - Competitive matrix summary
        - Market gaps and opportunities
        - Recommended differentiation strategies""",
        agent=competitive_analyst,
    )

    strategy_task = Task(
        description=f"""Based on the market research and competitive analysis,
        develop strategic recommendations for {company_name}.

        Focus on:
        1. Unique value proposition recommendations
        2. Target market prioritization
        3. Competitive positioning strategy
        4. Key success factors
        5. Potential risks and mitigation strategies""",
        expected_output="""Strategic recommendations including:
        - Recommended positioning statement
        - Priority target markets
        - Competitive strategy (3-5 key actions)
        - Risk assessment""",
        agent=strategy_advisor,
        context=[market_research_task, competitive_analysis_task],
    )

    # Create and run crew
    crew = Crew(
        agents=[market_researcher, competitive_analyst, strategy_advisor],
        tasks=[market_research_task, competitive_analysis_task, strategy_task],
        process=Process.sequential,
        verbose=False,
    )

    try:
        result = crew.kickoff()

        return {
            "success": True,
            "companyName": company_name,
            "industry": industry,
            "competitors": competitors,
            "research": {
                "marketResearch": str(market_research_task.output) if market_research_task.output else None,
                "competitiveAnalysis": str(competitive_analysis_task.output) if competitive_analysis_task.output else None,
                "strategicRecommendations": str(strategy_task.output) if strategy_task.output else None,
            },
            "summary": str(result),
            "generatedBy": "crewai",
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def main():
    """Main entry point - reads JSON from stdin, outputs research results"""
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()

        if not input_data.strip():
            print(json.dumps({
                "success": False,
                "error": "No input provided. Expected JSON with companyName, industry, competitors"
            }))
            sys.exit(1)

        data = json.loads(input_data)

        # Validate required fields
        company_name = data.get("companyName")
        industry = data.get("industry")
        competitors = data.get("competitors", [])
        target_audience = data.get("targetAudience")

        if not company_name or not industry:
            print(json.dumps({
                "success": False,
                "error": "Missing required fields: companyName and industry"
            }))
            sys.exit(1)

        # Run research
        result = create_research_crew(
            company_name=company_name,
            industry=industry,
            competitors=competitors,
            target_audience=target_audience,
        )

        print(json.dumps(result, indent=2))

    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
