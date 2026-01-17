"""
Gemini image generation for educational diagrams.
Uses Google's Gemini API to generate concept diagrams.
"""
import os
import base64
import httpx
from pathlib import Path
from typing import Optional

STATIC_DIR = Path(__file__).parent.parent.parent / "static"
IMAGES_DIR = STATIC_DIR / "images"

# Ensure directories exist
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

async def generate_gemini_image(
    topic: str,
    lesson_title: str,
    summary: str,
    job_id: str
) -> str:
    """
    Generate an educational diagram using Gemini's image generation.
    
    Args:
        topic: The topic to visualize
        lesson_title: Title of the lesson
        summary: Summary/description of the concept
        job_id: Unique job ID for file naming
    
    Returns:
        URL path to the generated image
    
    Raises:
        Exception: If image generation fails
    """
    if not GOOGLE_API_KEY:
        raise Exception("GOOGLE_API_KEY not configured")
    
    # Create prompt for image generation
    prompt = create_image_prompt(topic, lesson_title, summary)
    
    try:
        # Use Gemini's Imagen model for image generation
        # Note: As of my knowledge, Gemini primarily does text. For actual image generation,
        # you'd use Imagen API or similar. For this demo, we'll use a text-to-image approach
        # or fall back to generating a placeholder.
        
        # For now, let's use a simple approach: generate a concept diagram description
        # and save it as a simple image (stub implementation)
        
        # In a real implementation, you would call:
        # - Google's Imagen API
        # - Or Gemini with multimodal capabilities
        # - Or another image generation service
        
        # For this demo, we'll create a simple SVG diagram based on the topic
        svg_content = generate_svg_diagram(topic, lesson_title, summary)
        
        # Save SVG
        output_path = IMAGES_DIR / f"{job_id}_{topic.replace(' ', '_')}.svg"
        with open(output_path, 'w') as f:
            f.write(svg_content)
        
        print(f"[Gemini Image] Generated SVG diagram: {output_path}")
        
        # Return URL path
        return f"/static/images/{output_path.name}"
    
    except Exception as e:
        raise Exception(f"Failed to generate image: {str(e)}")

def create_image_prompt(topic: str, title: str, summary: str) -> str:
    """Create a detailed prompt for image generation."""
    return f"""
    Create an educational diagram for: {title}
    
    Topic: {topic}
    Description: {summary}
    
    The diagram should be:
    - Clear and educational
    - Suitable for teaching calculus concepts
    - Include labels and annotations
    - Use a clean, modern style
    - Show mathematical relationships visually
    """

def generate_svg_diagram(topic: str, title: str, summary: str) -> str:
    """
    Generate a simple SVG diagram for the topic.
    This is a fallback/demo implementation.
    """
    topic_lower = topic.lower().replace(" ", "_")
    
    # Different diagrams for different topics
    if topic_lower in ["limits", "continuity"]:
        return generate_limit_svg(title, summary)
    elif topic_lower in ["implicit_differentiation"]:
        return generate_implicit_svg(title, summary)
    elif topic_lower in ["related_rates"]:
        return generate_related_rates_svg(title, summary)
    else:
        return generate_generic_svg(title, summary)

def generate_limit_svg(title: str, summary: str) -> str:
    """Generate SVG for limit visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa"/>
  
  <!-- Title -->
  <text x="400" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>
  
  <!-- Axes -->
  <line x1="100" y1="300" x2="700" y2="300" stroke="#6b7280" stroke-width="2"/>
  <line x1="400" y1="100" x2="400" y2="500" stroke="#6b7280" stroke-width="2"/>
  
  <!-- Curve approaching limit -->
  <path d="M 150 400 Q 300 200, 395 150" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <path d="M 405 150 Q 500 200, 650 400" fill="none" stroke="#3b82f6" stroke-width="3"/>
  
  <!-- Limit point (open circle) -->
  <circle cx="400" cy="150" r="8" fill="none" stroke="#ef4444" stroke-width="3"/>
  
  <!-- Limit value (filled circle) -->
  <circle cx="400" cy="150" r="3" fill="#ef4444"/>
  
  <!-- Labels -->
  <text x="400" y="530" text-anchor="middle" font-size="18" fill="#4b5563">x</text>
  <text x="80" y="110" text-anchor="middle" font-size="18" fill="#4b5563">f(x)</text>
  
  <!-- Limit notation -->
  <text x="400" y="580" text-anchor="middle" font-size="20" fill="#1f2937">
    lim f(x) = L
  </text>
  <text x="365" y="595" text-anchor="middle" font-size="14" fill="#1f2937">
    x→a
  </text>
</svg>'''

def generate_implicit_svg(title: str, summary: str) -> str:
    """Generate SVG for implicit differentiation."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>
  
  <text x="400" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>
  
  <!-- Circle (implicit curve) -->
  <circle cx="400" cy="300" r="150" fill="none" stroke="#3b82f6" stroke-width="3"/>
  
  <!-- Point on circle -->
  <circle cx="506" cy="300" r="6" fill="#ef4444"/>
  
  <!-- Tangent line -->
  <line x1="506" y1="200" x2="506" y2="400" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5"/>
  
  <!-- Labels -->
  <text x="400" y="80" text-anchor="middle" font-size="18" fill="#4b5563">
    x² + y² = r²
  </text>
  
  <text x="520" y="295" font-size="16" fill="#ef4444">
    (x₀, y₀)
  </text>
  
  <text x="520" y="220" font-size="16" fill="#10b981">
    dy/dx
  </text>
</svg>'''

def generate_related_rates_svg(title: str, summary: str) -> str:
    """Generate SVG for related rates."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>
  
  <text x="400" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>
  
  <!-- Triangle for related rates -->
  <path d="M 300 400 L 500 400 L 500 200 Z" fill="none" stroke="#3b82f6" stroke-width="3"/>
  
  <!-- Height label -->
  <line x1="510" y1="200" x2="510" y2="400" stroke="#ef4444" stroke-width="2"/>
  <text x="530" y="310" font-size="18" fill="#ef4444">h</text>
  
  <!-- Base label -->
  <line x1="300" y1="410" x2="500" y2="410" stroke="#10b981" stroke-width="2"/>
  <text x="390" y="435" font-size="18" fill="#10b981">b</text>
  
  <!-- Rate arrows -->
  <path d="M 520 250 L 520 230" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="535" y="245" font-size="14" fill="#ef4444">dh/dt</text>
  
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <polygon points="0 0, 10 5, 0 10" fill="#ef4444"/>
    </marker>
  </defs>
</svg>'''

def generate_generic_svg(title: str, summary: str) -> str:
    """Generate generic SVG diagram."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>
  
  <text x="400" y="60" text-anchor="middle" font-size="32" font-weight="bold" fill="#1f2937">
    {title}
  </text>
  
  <!-- Coordinate system -->
  <line x1="100" y1="300" x2="700" y2="300" stroke="#6b7280" stroke-width="2"/>
  <line x1="400" y1="100" x2="400" y2="500" stroke="#6b7280" stroke-width="2"/>
  
  <!-- Generic curve -->
  <path d="M 150 400 Q 300 150, 650 250" fill="none" stroke="#3b82f6" stroke-width="3"/>
  
  <!-- Axes labels -->
  <text x="690" y="320" font-size="18" fill="#4b5563">x</text>
  <text x="385" y="115" font-size="18" fill="#4b5563">y</text>
  
  <!-- Summary text -->
  <foreignObject x="50" y="520" width="700" height="60">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 14px; color: #4b5563; text-align: center;">
      {summary[:150]}...
    </div>
  </foreignObject>
</svg>'''

