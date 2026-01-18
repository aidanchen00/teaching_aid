"""
Gemini image generation for educational diagrams.
Uses Google's Gemini API to generate SVG visualizations.
"""
import os
import re
from pathlib import Path
from typing import Optional
import google.generativeai as genai

STATIC_DIR = Path(__file__).parent.parent.parent / "static"
IMAGES_DIR = STATIC_DIR / "images"
VIZ_CACHE_DIR = STATIC_DIR / "viz"

# Ensure directories exist
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
VIZ_CACHE_DIR.mkdir(parents=True, exist_ok=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Pre-generated visualization categories for topic-based nodes
# Also includes tool node IDs to map them to appropriate categories
PRE_GENERATED_CATEGORIES = {
    # Calculus - also includes "threejs" and "nano-banana-pro" tool nodes to show math visualizations
    "calculus": ["calculus", "derivative", "integral", "limit", "differentiat", "function", "curve", "tangent", "slope", "math", "threejs", "nano-banana-pro"],
    "chemistry": ["chemistry", "chemical", "atom", "molecule", "element", "periodic", "bond", "reaction", "compound", "electron"],
    "social": ["social", "society", "culture", "psychology", "sociology", "behavior", "community", "network", "interaction", "human"],
}


def find_cached_svg(topic: str, label: str, viz_type: str) -> Optional[str]:
    """
    Check if a pre-generated SVG exists for this topic.

    Returns:
        SVG content if cached, None otherwise
    """
    # Check category-based matching using keywords
    search_text = f"{topic} {label}".lower()

    for category, keywords in PRE_GENERATED_CATEGORIES.items():
        if any(keyword in search_text for keyword in keywords):
            cache_path = VIZ_CACHE_DIR / f"{category}-{viz_type}.svg"
            if cache_path.exists():
                print(f"[GeminiImage] Category cache hit: {cache_path}")
                return cache_path.read_text()

    return None


def get_prompt_for_viz_type(viz_type: str, label: str, summary: str) -> str:
    """Generate appropriate prompt based on visualization type."""
    base_style = """
- Be exactly 800x600 pixels
- Have a dark background (#0f172a)
- Use these colors: #6366f1 (indigo), #10b981 (emerald), #f59e0b (amber), #ef4444 (red), white for text
- Include a title at the top"""

    if viz_type == "three":
        return f"""Create a detailed SVG visualization that represents a 3D-style interactive diagram for: "{label}".

Description: {summary}

Return ONLY valid SVG code (no markdown, no explanation, no code blocks). The SVG should:
{base_style}
- Use perspective and depth cues to create a 3D appearance (gradients, shadows, overlapping shapes)
- Show the concept as if it were a 3D model or graph that could be rotated
- Include axes if showing mathematical concepts, with 3D perspective
- Use gradients and lighting effects to enhance depth perception
- For math topics: show 3D coordinate systems, surfaces, or shapes
- For CS topics: show layered architectures, network diagrams with depth
- Make it look like a sophisticated 3D visualization
- Include relevant labels and annotations

Start your response with <svg and end with </svg>. Nothing else."""

    elif viz_type == "video":
        return f"""Create an SVG with CSS/SMIL animations that explains step-by-step: "{label}".

Description: {summary}

Return ONLY valid SVG code (no markdown, no explanation, no code blocks). The SVG should:
{base_style}
- Include <animate>, <animateTransform>, or <animateMotion> elements for animation
- Show a step-by-step process or transformation
- Animate key elements to demonstrate the concept over time
- Include numbered steps or a progress indicator
- Use motion to show how things change, transform, or flow
- For math: animate curves being drawn, integrals filling, derivatives showing tangent lines
- For algorithms: animate data moving, sorting, or transforming
- Make the animation loop smoothly (use repeatCount="indefinite")
- Include timing that makes the animation educational (not too fast)

Start your response with <svg and end with </svg>. Nothing else."""

    else:  # "image" - static educational diagram
        return f"""Create a simple, clean SVG educational diagram for the topic: "{label}".

Description: {summary}

Return ONLY valid SVG code (no markdown, no explanation, no code blocks). The SVG should:
{base_style}
- Show the key concept visually with relevant shapes, graphs, or diagrams
- Include formulas or equations if relevant to the topic
- Be educational and informative
- Use clear visual hierarchy
- Include annotations and labels

Start your response with <svg and end with </svg>. Nothing else."""


def extract_svg(text: str) -> Optional[str]:
    """Extract SVG content from text response."""
    # Try to find SVG tags
    svg_match = re.search(r'<svg[\s\S]*?</svg>', text, re.IGNORECASE)
    if svg_match:
        return svg_match.group(0)
    return None


async def generate_gemini_svg(
    topic: str,
    lesson_title: str,
    summary: str,
    viz_type: str = "image"
) -> str:
    """
    Generate an educational SVG diagram using Gemini.

    Args:
        topic: The topic ID to visualize
        lesson_title: Title of the lesson
        summary: Summary/description of the concept
        viz_type: Type of visualization ("three", "video", "image")

    Returns:
        SVG content as string

    Raises:
        Exception: If image generation fails
    """
    # Try Gemini API
    if not GOOGLE_API_KEY:
        print("[GeminiImage] No API key, using fallback")
        return generate_svg_diagram(topic, lesson_title, summary)

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = get_prompt_for_viz_type(viz_type, lesson_title, summary)

        response = model.generate_content(prompt)

        if not response.text:
            raise Exception("No response from Gemini")

        svg_content = extract_svg(response.text)
        if not svg_content:
            print(f"[GeminiImage] No valid SVG in response, using fallback")
            return generate_svg_diagram(topic, lesson_title, summary)

        print(f"[GeminiImage] Generated SVG via Gemini for: {lesson_title}")
        return svg_content

    except Exception as e:
        print(f"[GeminiImage] Gemini API error: {e}, using fallback")
        return generate_svg_diagram(topic, lesson_title, summary)


# Keep old function name for backwards compatibility
async def generate_gemini_image(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str,
    viz_type: str = "image"
) -> str:
    """Legacy function - returns URL. Use generate_gemini_svg for content."""
    svg_content = await generate_gemini_svg(topic, lesson_title, summary, viz_type)
    output_path = IMAGES_DIR / f"{job_id}_{topic.replace(' ', '_')}.svg"
    output_path.write_text(svg_content)
    return f"/static/images/{output_path.name}"


def generate_svg_diagram(topic: str, title: str, summary: str) -> str:
    """
    Generate a simple SVG diagram for the topic.
    This is a fallback implementation.
    """
    topic_lower = topic.lower().replace(" ", "_")

    # Different diagrams for different topics
    if "limit" in topic_lower:
        return generate_limit_svg(title)
    elif "continu" in topic_lower:
        return generate_continuity_svg(title)
    elif "implicit" in topic_lower:
        return generate_implicit_svg(title)
    elif "related" in topic_lower and "rate" in topic_lower:
        return generate_related_rates_svg(title)
    elif "derivative" in topic_lower:
        return generate_derivative_svg(title)
    elif "integral" in topic_lower:
        return generate_integral_svg(title)
    elif "probability" in topic_lower or "bayes" in topic_lower:
        return generate_probability_svg(title)
    elif "sequence" in topic_lower or "series" in topic_lower:
        return generate_sequence_svg(title)
    else:
        return generate_generic_svg(title, summary)


def generate_limit_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <line x1="100" y1="350" x2="700" y2="350" stroke="#475569" stroke-width="2"/>
  <line x1="400" y1="100" x2="400" y2="500" stroke="#475569" stroke-width="2"/>

  <path d="M 150 450 Q 300 250, 390 180" fill="none" stroke="#6366f1" stroke-width="3"/>
  <path d="M 410 180 Q 500 250, 650 450" fill="none" stroke="#6366f1" stroke-width="3"/>

  <circle cx="400" cy="180" r="12" fill="#0f172a" stroke="#ef4444" stroke-width="3"/>

  <path d="M 300 280 L 360 200" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
  <path d="M 500 280 L 440 200" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>

  <text x="400" y="550" text-anchor="middle" font-size="24" fill="white">lim f(x) = L</text>
  <text x="400" y="580" text-anchor="middle" font-size="16" fill="#94a3b8">x → a</text>
  <text x="420" y="160" font-size="18" fill="#ef4444">L</text>
  <text x="400" y="380" text-anchor="middle" font-size="16" fill="#94a3b8">a</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#10b981"/>
    </marker>
  </defs>
</svg>'''


def generate_continuity_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <text x="200" y="120" font-size="18" fill="#10b981">Continuous</text>
  <line x1="100" y1="280" x2="350" y2="280" stroke="#475569" stroke-width="1"/>
  <path d="M 100 350 Q 180 200, 250 280 Q 320 360, 350 250" fill="none" stroke="#10b981" stroke-width="3"/>

  <text x="550" y="120" font-size="18" fill="#ef4444">Discontinuous</text>
  <line x1="450" y1="280" x2="700" y2="280" stroke="#475569" stroke-width="1"/>
  <path d="M 450 350 Q 520 200, 560 280" fill="none" stroke="#ef4444" stroke-width="3"/>
  <circle cx="560" cy="280" r="8" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <circle cx="560" cy="200" r="8" fill="#ef4444"/>
  <path d="M 560 200 Q 620 280, 700 250" fill="none" stroke="#ef4444" stroke-width="3"/>

  <text x="400" y="450" text-anchor="middle" font-size="20" fill="white">f is continuous at a if:</text>
  <text x="400" y="490" text-anchor="middle" font-size="18" fill="#6366f1">1. f(a) exists</text>
  <text x="400" y="520" text-anchor="middle" font-size="18" fill="#6366f1">2. lim f(x) exists</text>
  <text x="400" y="550" text-anchor="middle" font-size="18" fill="#6366f1">3. lim f(x) = f(a)</text>
</svg>'''


def generate_implicit_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <circle cx="400" cy="300" r="150" fill="none" stroke="#6366f1" stroke-width="3"/>
  <circle cx="506" cy="300" r="6" fill="#ef4444"/>
  <line x1="506" y1="200" x2="506" y2="400" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5"/>

  <text x="400" y="100" text-anchor="middle" font-size="20" fill="white">x² + y² = r²</text>
  <text x="530" y="295" font-size="16" fill="#ef4444">(x₀, y₀)</text>
  <text x="530" y="220" font-size="16" fill="#10b981">dy/dx = -x/y</text>
</svg>'''


def generate_related_rates_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <path d="M 300 400 L 500 400 L 500 200 Z" fill="none" stroke="#6366f1" stroke-width="3"/>

  <line x1="510" y1="200" x2="510" y2="400" stroke="#ef4444" stroke-width="2"/>
  <text x="530" y="310" font-size="18" fill="#ef4444">h</text>

  <line x1="300" y1="410" x2="500" y2="410" stroke="#10b981" stroke-width="2"/>
  <text x="390" y="435" font-size="18" fill="#10b981">b</text>

  <path d="M 520 250 L 520 230" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="535" y="245" font-size="14" fill="#f59e0b">dh/dt</text>

  <text x="400" y="520" text-anchor="middle" font-size="18" fill="white">Related rates connect derivatives</text>
  <text x="400" y="550" text-anchor="middle" font-size="18" fill="#94a3b8">through implicit differentiation</text>

  <defs>
    <marker id="arrow2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <polygon points="0 0, 10 5, 0 10" fill="#f59e0b"/>
    </marker>
  </defs>
</svg>'''


def generate_derivative_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <line x1="100" y1="400" x2="700" y2="400" stroke="#475569" stroke-width="2"/>
  <line x1="150" y1="100" x2="150" y2="500" stroke="#475569" stroke-width="2"/>

  <path d="M 150 450 Q 350 100, 650 350" fill="none" stroke="#6366f1" stroke-width="3"/>

  <circle cx="400" cy="250" r="6" fill="#ef4444"/>
  <line x1="280" y1="350" x2="520" y2="150" stroke="#10b981" stroke-width="2"/>

  <text x="420" y="240" font-size="16" fill="#ef4444">Point (a, f(a))</text>
  <text x="530" y="170" font-size="16" fill="#10b981">Tangent line</text>
  <text x="650" y="380" font-size="16" fill="#6366f1">f(x)</text>

  <text x="400" y="520" text-anchor="middle" font-size="20" fill="white">f'(a) = slope of tangent at x = a</text>
  <text x="400" y="560" text-anchor="middle" font-size="16" fill="#94a3b8">The derivative measures instantaneous rate of change</text>
</svg>'''


def generate_integral_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <line x1="100" y1="400" x2="700" y2="400" stroke="#475569" stroke-width="2"/>
  <line x1="150" y1="100" x2="150" y2="450" stroke="#475569" stroke-width="2"/>

  <path d="M 200 350 Q 350 150, 600 300" fill="none" stroke="#6366f1" stroke-width="3"/>

  <rect x="200" y="300" width="50" height="100" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="250" y="250" width="50" height="150" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="300" y="200" width="50" height="200" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="350" y="180" width="50" height="220" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="400" y="200" width="50" height="200" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="450" y="230" width="50" height="170" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="500" y="260" width="50" height="140" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>
  <rect x="550" y="280" width="50" height="120" fill="#10b981" fill-opacity="0.3" stroke="#10b981"/>

  <text x="200" y="430" font-size="14" fill="#94a3b8">a</text>
  <text x="600" y="430" font-size="14" fill="#94a3b8">b</text>
  <text x="620" y="320" font-size="16" fill="#6366f1">f(x)</text>

  <text x="400" y="520" text-anchor="middle" font-size="20" fill="white">∫ f(x) dx = Area under curve</text>
  <text x="400" y="560" text-anchor="middle" font-size="16" fill="#94a3b8">Riemann sum approximation shown</text>
</svg>'''


def generate_probability_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <circle cx="150" cy="300" r="30" fill="#6366f1" fill-opacity="0.3" stroke="#6366f1" stroke-width="2"/>
  <text x="150" y="305" text-anchor="middle" font-size="14" fill="white">Start</text>

  <line x1="180" y1="280" x2="350" y2="180" stroke="#10b981" stroke-width="2"/>
  <text x="250" y="210" font-size="14" fill="#10b981">P(A)=0.6</text>
  <circle cx="380" cy="180" r="25" fill="#10b981" fill-opacity="0.3" stroke="#10b981" stroke-width="2"/>
  <text x="380" y="185" text-anchor="middle" font-size="14" fill="white">A</text>

  <line x1="180" y1="320" x2="350" y2="420" stroke="#ef4444" stroke-width="2"/>
  <text x="250" y="390" font-size="14" fill="#ef4444">P(B)=0.4</text>
  <circle cx="380" cy="420" r="25" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="2"/>
  <text x="380" y="425" text-anchor="middle" font-size="14" fill="white">B</text>

  <line x1="405" y1="170" x2="550" y2="120" stroke="#f59e0b" stroke-width="2"/>
  <line x1="405" y1="190" x2="550" y2="240" stroke="#f59e0b" stroke-width="2"/>

  <text x="400" y="520" text-anchor="middle" font-size="20" fill="white">P(A|B) = P(B|A) × P(A) / P(B)</text>
  <text x="400" y="560" text-anchor="middle" font-size="16" fill="#94a3b8">Bayes' Theorem</text>
</svg>'''


def generate_sequence_svg(title: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <line x1="100" y1="350" x2="700" y2="350" stroke="#475569" stroke-width="2"/>
  <line x1="100" y1="100" x2="100" y2="400" stroke="#475569" stroke-width="2"/>

  <circle cx="150" cy="150" r="8" fill="#6366f1"/>
  <circle cx="220" cy="220" r="8" fill="#6366f1"/>
  <circle cx="290" cy="260" r="8" fill="#6366f1"/>
  <circle cx="360" cy="285" r="8" fill="#6366f1"/>
  <circle cx="430" cy="300" r="8" fill="#6366f1"/>
  <circle cx="500" cy="308" r="8" fill="#6366f1"/>
  <circle cx="570" cy="312" r="8" fill="#6366f1"/>
  <circle cx="640" cy="315" r="8" fill="#6366f1"/>

  <line x1="100" y1="320" x2="700" y2="320" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="720" y="325" font-size="16" fill="#10b981">L</text>

  <text x="150" y="420" font-size="14" fill="#94a3b8">a₁</text>
  <text x="290" y="420" font-size="14" fill="#94a3b8">a₃</text>
  <text x="430" y="420" font-size="14" fill="#94a3b8">a₅</text>
  <text x="570" y="420" font-size="14" fill="#94a3b8">aₙ</text>

  <text x="400" y="520" text-anchor="middle" font-size="20" fill="white">lim aₙ = L as n → ∞</text>
  <text x="400" y="560" text-anchor="middle" font-size="16" fill="#94a3b8">Convergent Sequence</text>
</svg>'''


def generate_generic_svg(title: str, summary: str) -> str:
    return f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#0f172a"/>
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="white">{title}</text>

  <circle cx="400" cy="280" r="80" fill="#6366f1" fill-opacity="0.2" stroke="#6366f1" stroke-width="3"/>
  <text x="400" y="290" text-anchor="middle" font-size="20" fill="white">{title[:20]}</text>

  <line x1="320" y1="280" x2="180" y2="180" stroke="#10b981" stroke-width="2"/>
  <circle cx="150" cy="160" r="40" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
  <text x="150" y="165" text-anchor="middle" font-size="12" fill="white">Theory</text>

  <line x1="480" y1="280" x2="620" y2="180" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="650" cy="160" r="40" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="2"/>
  <text x="650" y="165" text-anchor="middle" font-size="12" fill="white">Practice</text>

  <line x1="400" y1="360" x2="400" y2="450" stroke="#ef4444" stroke-width="2"/>
  <circle cx="400" cy="480" r="40" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="2"/>
  <text x="400" y="485" text-anchor="middle" font-size="12" fill="white">Applications</text>

  <text x="400" y="570" text-anchor="middle" font-size="16" fill="#94a3b8">{summary[:80]}...</text>
</svg>'''
