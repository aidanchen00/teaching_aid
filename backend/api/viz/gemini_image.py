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

    # ==========================================================================
    # CALCULUS
    # ==========================================================================
    if topic_lower in ["limits", "continuity"]:
        return generate_limit_svg(title, summary)
    elif topic_lower in ["implicit_differentiation"]:
        return generate_implicit_svg(title, summary)
    elif topic_lower in ["related_rates"]:
        return generate_related_rates_svg(title, summary)
    elif topic_lower in ["fundamental_theorem", "sequences", "lhopitals_rule"]:
        return generate_calculus_concept_svg(title, summary)

    # ==========================================================================
    # NEURAL NETWORKS / ML
    # ==========================================================================
    elif topic_lower in ["loss_functions"]:
        return generate_loss_function_svg(title, summary)
    elif topic_lower in ["regularization"]:
        return generate_regularization_svg(title, summary)

    # ==========================================================================
    # LINEAR ALGEBRA
    # ==========================================================================
    elif topic_lower in ["determinants"]:
        return generate_determinant_svg(title, summary)
    elif topic_lower in ["inverse_matrix"]:
        return generate_matrix_inverse_svg(title, summary)
    elif topic_lower in ["vector_spaces"]:
        return generate_vector_space_svg(title, summary)

    # ==========================================================================
    # PHYSICS
    # ==========================================================================
    elif topic_lower in ["newtons_laws"]:
        return generate_newtons_laws_svg(title, summary)
    elif topic_lower in ["work"]:
        return generate_work_energy_svg(title, summary)
    elif topic_lower in ["rotation"]:
        return generate_rotation_svg(title, summary)

    # ==========================================================================
    # STATISTICS
    # ==========================================================================
    elif topic_lower in ["hypothesis_testing"]:
        return generate_hypothesis_svg(title, summary)
    elif topic_lower in ["confidence_intervals"]:
        return generate_confidence_interval_svg(title, summary)
    elif topic_lower in ["expected_value", "variance"]:
        return generate_statistics_concept_svg(title, summary)

    # ==========================================================================
    # DISCRETE MATH
    # ==========================================================================
    elif topic_lower in ["sets", "logic"]:
        return generate_venn_diagram_svg(title, summary)
    elif topic_lower in ["combinatorics", "permutations", "combinations"]:
        return generate_combinatorics_svg(title, summary)
    elif topic_lower in ["proofs"]:
        return generate_proof_svg(title, summary)

    # ==========================================================================
    # DEFAULT
    # ==========================================================================
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

# =============================================================================
# CALCULUS SVG GENERATORS
# =============================================================================

def generate_calculus_concept_svg(title: str, summary: str) -> str:
    """Generate SVG for general calculus concepts."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Function curve -->
  <path d="M 100 400 Q 200 100, 400 250 T 700 150" fill="none" stroke="#3b82f6" stroke-width="3"/>

  <!-- Integral symbol -->
  <text x="150" y="200" font-size="60" fill="#10b981">∫</text>

  <!-- Derivative notation -->
  <text x="550" y="200" font-size="36" fill="#ef4444">d/dx</text>

  <!-- Fundamental theorem arrow -->
  <path d="M 250 200 L 500 200" stroke="#6b7280" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="375" y="180" text-anchor="middle" font-size="14" fill="#4b5563">F(b) - F(a)</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#6b7280"/>
    </marker>
  </defs>

  <!-- Summary -->
  <text x="400" y="550" text-anchor="middle" font-size="16" fill="#4b5563">
    {summary[:80]}
  </text>
</svg>'''

# =============================================================================
# NEURAL NETWORKS / ML SVG GENERATORS
# =============================================================================

def generate_loss_function_svg(title: str, summary: str) -> str:
    """Generate SVG for loss function visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Axes -->
  <line x1="100" y1="450" x2="700" y2="450" stroke="#6b7280" stroke-width="2"/>
  <line x1="100" y1="100" x2="100" y2="450" stroke="#6b7280" stroke-width="2"/>

  <!-- MSE curve -->
  <path d="M 100 150 Q 300 400, 400 450 Q 500 400, 700 150" fill="none" stroke="#ef4444" stroke-width="3"/>
  <text x="720" y="150" font-size="14" fill="#ef4444">MSE</text>

  <!-- Cross-entropy curve -->
  <path d="M 100 200 Q 250 380, 400 420 Q 550 380, 700 200" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <text x="720" y="200" font-size="14" fill="#3b82f6">Cross-Entropy</text>

  <!-- Minimum point -->
  <circle cx="400" cy="430" r="8" fill="#10b981"/>
  <text x="400" y="480" text-anchor="middle" font-size="14" fill="#10b981">Optimal θ*</text>

  <!-- Labels -->
  <text x="720" y="470" font-size="16" fill="#4b5563">θ</text>
  <text x="80" y="80" font-size="16" fill="#4b5563">L(θ)</text>

  <!-- Equation -->
  <text x="400" y="550" text-anchor="middle" font-size="18" fill="#1f2937">
    MSE = (1/n) Σ(y - ŷ)²
  </text>
</svg>'''

def generate_regularization_svg(title: str, summary: str) -> str:
    """Generate SVG for regularization visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- L1 (Lasso) - Diamond -->
  <polygon points="200,250 300,150 400,250 300,350" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <text x="300" y="400" text-anchor="middle" font-size="16" fill="#3b82f6">L1 (Lasso)</text>
  <text x="300" y="420" text-anchor="middle" font-size="14" fill="#4b5563">|w₁| + |w₂| ≤ t</text>

  <!-- L2 (Ridge) - Circle -->
  <circle cx="550" cy="250" r="100" fill="none" stroke="#ef4444" stroke-width="3"/>
  <text x="550" y="400" text-anchor="middle" font-size="16" fill="#ef4444">L2 (Ridge)</text>
  <text x="550" y="420" text-anchor="middle" font-size="14" fill="#4b5563">w₁² + w₂² ≤ t</text>

  <!-- Contour lines (loss function) -->
  <ellipse cx="300" cy="200" rx="50" ry="30" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="5,5"/>
  <ellipse cx="550" cy="200" rx="50" ry="30" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="5,5"/>

  <!-- Equation -->
  <text x="400" y="520" text-anchor="middle" font-size="18" fill="#1f2937">
    Loss = L(w) + λR(w)
  </text>
</svg>'''

# =============================================================================
# LINEAR ALGEBRA SVG GENERATORS
# =============================================================================

def generate_determinant_svg(title: str, summary: str) -> str:
    """Generate SVG for determinant visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Original unit square -->
  <polygon points="200,400 300,400 300,300 200,300" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="2"/>
  <text x="250" y="450" text-anchor="middle" font-size="14" fill="#3b82f6">Original (Area = 1)</text>

  <!-- Transformed parallelogram -->
  <polygon points="500,400 650,380 700,280 550,300" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="2"/>
  <text x="600" y="450" text-anchor="middle" font-size="14" fill="#ef4444">Transformed (Area = |det(A)|)</text>

  <!-- Arrow -->
  <path d="M 350 350 L 450 350" stroke="#6b7280" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="400" y="330" text-anchor="middle" font-size="16" fill="#4b5563">A</text>

  <defs>
    <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#6b7280"/>
    </marker>
  </defs>

  <!-- Formula -->
  <text x="400" y="530" text-anchor="middle" font-size="20" fill="#1f2937">
    det(A) = ad - bc for A = [a b; c d]
  </text>
</svg>'''

def generate_matrix_inverse_svg(title: str, summary: str) -> str:
    """Generate SVG for matrix inverse visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Matrix A -->
  <rect x="100" y="200" width="120" height="120" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <text x="160" y="270" text-anchor="middle" font-size="24" fill="#3b82f6">A</text>

  <!-- Times symbol -->
  <text x="280" y="270" text-anchor="middle" font-size="36" fill="#4b5563">×</text>

  <!-- Matrix A^-1 -->
  <rect x="340" y="200" width="120" height="120" fill="none" stroke="#ef4444" stroke-width="3"/>
  <text x="400" y="270" text-anchor="middle" font-size="24" fill="#ef4444">A⁻¹</text>

  <!-- Equals symbol -->
  <text x="520" y="270" text-anchor="middle" font-size="36" fill="#4b5563">=</text>

  <!-- Identity matrix I -->
  <rect x="580" y="200" width="120" height="120" fill="none" stroke="#10b981" stroke-width="3"/>
  <text x="640" y="270" text-anchor="middle" font-size="24" fill="#10b981">I</text>

  <!-- Formula -->
  <text x="400" y="420" text-anchor="middle" font-size="18" fill="#1f2937">
    A⁻¹ = (1/det(A)) × adj(A)
  </text>

  <!-- Condition -->
  <text x="400" y="480" text-anchor="middle" font-size="16" fill="#4b5563">
    Exists only if det(A) ≠ 0
  </text>
</svg>'''

def generate_vector_space_svg(title: str, summary: str) -> str:
    """Generate SVG for vector space visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Coordinate system -->
  <line x1="400" y1="100" x2="400" y2="500" stroke="#6b7280" stroke-width="2"/>
  <line x1="100" y1="350" x2="700" y2="350" stroke="#6b7280" stroke-width="2"/>

  <!-- Basis vectors -->
  <line x1="400" y1="350" x2="550" y2="250" stroke="#3b82f6" stroke-width="3" marker-end="url(#arrow3)"/>
  <text x="560" y="240" font-size="16" fill="#3b82f6">v₁</text>

  <line x1="400" y1="350" x2="300" y2="200" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow3)"/>
  <text x="280" y="190" font-size="16" fill="#ef4444">v₂</text>

  <!-- Span region -->
  <polygon points="100,500 400,350 700,200 400,350" fill="#10b981" fill-opacity="0.2" stroke="none"/>
  <text x="500" y="450" font-size="16" fill="#10b981">span(v₁, v₂)</text>

  <defs>
    <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6"/>
    </marker>
  </defs>

  <!-- Properties -->
  <text x="400" y="540" text-anchor="middle" font-size="14" fill="#4b5563">
    Closed under addition and scalar multiplication
  </text>
</svg>'''

# =============================================================================
# PHYSICS SVG GENERATORS
# =============================================================================

def generate_newtons_laws_svg(title: str, summary: str) -> str:
    """Generate SVG for Newton's Laws visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- First Law box -->
  <rect x="50" y="100" width="220" height="150" rx="10" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="2"/>
  <text x="160" y="130" text-anchor="middle" font-size="16" font-weight="bold" fill="#3b82f6">First Law</text>
  <text x="160" y="160" text-anchor="middle" font-size="14" fill="#4b5563">Inertia</text>
  <text x="160" y="190" text-anchor="middle" font-size="12" fill="#4b5563">Object at rest stays</text>
  <text x="160" y="210" text-anchor="middle" font-size="12" fill="#4b5563">at rest unless acted</text>
  <text x="160" y="230" text-anchor="middle" font-size="12" fill="#4b5563">upon by a force</text>

  <!-- Second Law box -->
  <rect x="290" y="100" width="220" height="150" rx="10" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="2"/>
  <text x="400" y="130" text-anchor="middle" font-size="16" font-weight="bold" fill="#ef4444">Second Law</text>
  <text x="400" y="170" text-anchor="middle" font-size="24" fill="#ef4444">F = ma</text>
  <text x="400" y="210" text-anchor="middle" font-size="12" fill="#4b5563">Force equals mass</text>
  <text x="400" y="230" text-anchor="middle" font-size="12" fill="#4b5563">times acceleration</text>

  <!-- Third Law box -->
  <rect x="530" y="100" width="220" height="150" rx="10" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-width="2"/>
  <text x="640" y="130" text-anchor="middle" font-size="16" font-weight="bold" fill="#10b981">Third Law</text>
  <text x="640" y="160" text-anchor="middle" font-size="14" fill="#4b5563">Action-Reaction</text>
  <text x="640" y="190" text-anchor="middle" font-size="12" fill="#4b5563">Every action has an</text>
  <text x="640" y="210" text-anchor="middle" font-size="12" fill="#4b5563">equal and opposite</text>
  <text x="640" y="230" text-anchor="middle" font-size="12" fill="#4b5563">reaction</text>

  <!-- Illustration -->
  <rect x="300" y="350" width="100" height="60" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
  <line x1="350" y1="380" x2="500" y2="380" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow4)"/>
  <text x="450" y="360" font-size="14" fill="#ef4444">F</text>

  <defs>
    <marker id="arrow4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444"/>
    </marker>
  </defs>
</svg>'''

def generate_work_energy_svg(title: str, summary: str) -> str:
    """Generate SVG for work-energy visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Work diagram -->
  <rect x="150" y="280" width="80" height="80" fill="#3b82f6" fill-opacity="0.7"/>
  <line x1="230" y1="320" x2="380" y2="320" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow5)"/>
  <text x="305" y="300" font-size="16" fill="#ef4444">F</text>

  <!-- Displacement arrow -->
  <line x1="150" y1="400" x2="550" y2="400" stroke="#10b981" stroke-width="2" marker-end="url(#arrow5)"/>
  <text x="350" y="430" font-size="16" fill="#10b981">d (displacement)</text>

  <!-- Formula -->
  <text x="400" y="200" text-anchor="middle" font-size="24" fill="#1f2937">
    W = F · d = |F||d|cos(θ)
  </text>

  <!-- Energy equation -->
  <text x="550" y="320" font-size="20" fill="#3b82f6">KE = ½mv²</text>
  <text x="550" y="360" font-size="20" fill="#ef4444">PE = mgh</text>

  <!-- Work-energy theorem -->
  <text x="400" y="520" text-anchor="middle" font-size="18" fill="#4b5563">
    Work-Energy Theorem: W = ΔKE
  </text>

  <defs>
    <marker id="arrow5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444"/>
    </marker>
  </defs>
</svg>'''

def generate_rotation_svg(title: str, summary: str) -> str:
    """Generate SVG for rotation visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Rotating disk -->
  <circle cx="300" cy="300" r="120" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="300" cy="300" r="5" fill="#1f2937"/>

  <!-- Rotation arrow -->
  <path d="M 300 180 A 120 120 0 0 1 420 300" fill="none" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow6)"/>
  <text x="370" y="200" font-size="16" fill="#ef4444">ω</text>

  <!-- Radius line -->
  <line x1="300" y1="300" x2="420" y2="300" stroke="#10b981" stroke-width="2"/>
  <text x="360" y="280" font-size="14" fill="#10b981">r</text>

  <!-- Formulas -->
  <text x="600" y="200" font-size="18" fill="#1f2937">θ = ωt</text>
  <text x="600" y="240" font-size="18" fill="#1f2937">v = ωr</text>
  <text x="600" y="280" font-size="18" fill="#1f2937">α = dω/dt</text>
  <text x="600" y="320" font-size="18" fill="#1f2937">τ = Iα</text>
  <text x="600" y="360" font-size="18" fill="#1f2937">L = Iω</text>

  <!-- Labels -->
  <text x="600" y="450" font-size="14" fill="#4b5563">ω = angular velocity</text>
  <text x="600" y="480" font-size="14" fill="#4b5563">α = angular acceleration</text>
  <text x="600" y="510" font-size="14" fill="#4b5563">τ = torque, I = moment of inertia</text>

  <defs>
    <marker id="arrow6" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444"/>
    </marker>
  </defs>
</svg>'''

# =============================================================================
# STATISTICS SVG GENERATORS
# =============================================================================

def generate_hypothesis_svg(title: str, summary: str) -> str:
    """Generate SVG for hypothesis testing visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Normal distribution curve -->
  <path d="M 100 400 Q 200 400, 250 380 Q 300 300, 400 150 Q 500 300, 550 380 Q 600 400, 700 400" fill="none" stroke="#3b82f6" stroke-width="3"/>

  <!-- Rejection regions -->
  <path d="M 100 400 Q 120 400, 140 395 L 140 400 Z" fill="#ef4444" fill-opacity="0.5"/>
  <path d="M 660 400 Q 680 400, 700 400 L 660 395 Z" fill="#ef4444" fill-opacity="0.5"/>

  <!-- Critical values -->
  <line x1="140" y1="150" x2="140" y2="400" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="140" y="430" text-anchor="middle" font-size="14" fill="#ef4444">-z_α/2</text>

  <line x1="660" y1="150" x2="660" y2="400" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="660" y="430" text-anchor="middle" font-size="14" fill="#ef4444">z_α/2</text>

  <!-- Labels -->
  <text x="400" y="200" text-anchor="middle" font-size="16" fill="#10b981">Fail to reject H₀</text>
  <text x="100" y="350" font-size="12" fill="#ef4444">Reject H₀</text>
  <text x="680" y="350" font-size="12" fill="#ef4444">Reject H₀</text>

  <!-- Hypotheses -->
  <text x="400" y="500" text-anchor="middle" font-size="16" fill="#1f2937">H₀: μ = μ₀ (Null Hypothesis)</text>
  <text x="400" y="530" text-anchor="middle" font-size="16" fill="#1f2937">H₁: μ ≠ μ₀ (Alternative)</text>

  <!-- Alpha label -->
  <text x="400" y="560" text-anchor="middle" font-size="14" fill="#4b5563">α = significance level (typically 0.05)</text>
</svg>'''

def generate_confidence_interval_svg(title: str, summary: str) -> str:
    """Generate SVG for confidence interval visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Number line -->
  <line x1="100" y1="250" x2="700" y2="250" stroke="#6b7280" stroke-width="2"/>

  <!-- True parameter (mu) -->
  <line x1="400" y1="230" x2="400" y2="270" stroke="#10b981" stroke-width="3"/>
  <text x="400" y="295" text-anchor="middle" font-size="18" fill="#10b981">μ (true)</text>

  <!-- Sample confidence intervals -->
  <line x1="320" y1="180" x2="480" y2="180" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="400" cy="180" r="4" fill="#3b82f6"/>
  <text x="520" y="185" font-size="12" fill="#3b82f6">✓ Contains μ</text>

  <line x1="280" y1="150" x2="440" y2="150" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="360" cy="150" r="4" fill="#3b82f6"/>
  <text x="480" y="155" font-size="12" fill="#3b82f6">✓ Contains μ</text>

  <line x1="450" y1="120" x2="610" y2="120" stroke="#ef4444" stroke-width="3"/>
  <circle cx="530" cy="120" r="4" fill="#ef4444"/>
  <text x="650" y="125" font-size="12" fill="#ef4444">✗ Misses μ</text>

  <!-- Formula -->
  <text x="400" y="380" text-anchor="middle" font-size="20" fill="#1f2937">
    CI = x̄ ± z* × (σ/√n)
  </text>

  <!-- Interpretation -->
  <text x="400" y="450" text-anchor="middle" font-size="14" fill="#4b5563">
    95% CI: 95 out of 100 intervals will contain the true parameter
  </text>

  <text x="400" y="520" text-anchor="middle" font-size="16" fill="#1f2937">
    Confidence Level (1 - α) = 95%
  </text>
</svg>'''

def generate_statistics_concept_svg(title: str, summary: str) -> str:
    """Generate SVG for general statistics concepts."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Data points visualization -->
  <circle cx="200" cy="300" r="10" fill="#3b82f6"/>
  <circle cx="280" cy="280" r="10" fill="#3b82f6"/>
  <circle cx="340" cy="320" r="10" fill="#3b82f6"/>
  <circle cx="420" cy="290" r="10" fill="#3b82f6"/>
  <circle cx="500" cy="310" r="10" fill="#3b82f6"/>
  <circle cx="580" cy="270" r="10" fill="#3b82f6"/>

  <!-- Mean line -->
  <line x1="150" y1="295" x2="630" y2="295" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="650" y="300" font-size="14" fill="#ef4444">μ</text>

  <!-- Formulas box -->
  <rect x="200" y="400" width="400" height="150" rx="10" fill="#f8f9fa" stroke="#6b7280" stroke-width="2"/>

  <text x="400" y="440" text-anchor="middle" font-size="18" fill="#3b82f6">E[X] = Σ xᵢP(xᵢ)</text>
  <text x="400" y="480" text-anchor="middle" font-size="18" fill="#ef4444">Var(X) = E[(X - μ)²]</text>
  <text x="400" y="520" text-anchor="middle" font-size="18" fill="#10b981">σ = √Var(X)</text>
</svg>'''

# =============================================================================
# DISCRETE MATH SVG GENERATORS
# =============================================================================

def generate_venn_diagram_svg(title: str, summary: str) -> str:
    """Generate SVG for Venn diagram visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Universal set rectangle -->
  <rect x="100" y="100" width="600" height="400" fill="none" stroke="#6b7280" stroke-width="2"/>
  <text x="680" y="120" font-size="14" fill="#6b7280">U</text>

  <!-- Set A -->
  <circle cx="300" cy="300" r="120" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="3"/>
  <text x="220" y="260" font-size="24" fill="#3b82f6">A</text>

  <!-- Set B -->
  <circle cx="480" cy="300" r="120" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="3"/>
  <text x="540" y="260" font-size="24" fill="#ef4444">B</text>

  <!-- Intersection label -->
  <text x="390" y="305" text-anchor="middle" font-size="16" fill="#10b981">A ∩ B</text>

  <!-- Operations -->
  <text x="200" y="530" font-size="16" fill="#3b82f6">A ∪ B (Union)</text>
  <text x="400" y="530" font-size="16" fill="#10b981">A ∩ B (Intersection)</text>
  <text x="600" y="530" font-size="16" fill="#ef4444">A' (Complement)</text>

  <!-- Example elements -->
  <text x="220" y="350" font-size="12" fill="#4b5563">1, 2, 3</text>
  <text x="520" y="350" font-size="12" fill="#4b5563">5, 6, 7</text>
  <text x="380" y="330" font-size="12" fill="#4b5563">4</text>
</svg>'''

def generate_combinatorics_svg(title: str, summary: str) -> str:
    """Generate SVG for combinatorics visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Permutation visualization -->
  <rect x="50" y="120" width="340" height="200" rx="10" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="2"/>
  <text x="220" y="160" text-anchor="middle" font-size="18" font-weight="bold" fill="#3b82f6">Permutations</text>
  <text x="220" y="200" text-anchor="middle" font-size="14" fill="#4b5563">Order matters</text>

  <!-- Permutation boxes -->
  <rect x="100" y="230" width="40" height="40" fill="#3b82f6" fill-opacity="0.5" stroke="#3b82f6"/>
  <text x="120" y="258" text-anchor="middle" font-size="16" fill="white">A</text>
  <rect x="160" y="230" width="40" height="40" fill="#3b82f6" fill-opacity="0.5" stroke="#3b82f6"/>
  <text x="180" y="258" text-anchor="middle" font-size="16" fill="white">B</text>
  <rect x="220" y="230" width="40" height="40" fill="#3b82f6" fill-opacity="0.5" stroke="#3b82f6"/>
  <text x="240" y="258" text-anchor="middle" font-size="16" fill="white">C</text>
  <text x="300" y="258" font-size="14" fill="#4b5563">≠</text>
  <rect x="320" y="230" width="40" height="40" fill="#3b82f6" fill-opacity="0.5" stroke="#3b82f6"/>
  <text x="340" y="258" text-anchor="middle" font-size="16" fill="white">B</text>

  <!-- Combination visualization -->
  <rect x="410" y="120" width="340" height="200" rx="10" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="2"/>
  <text x="580" y="160" text-anchor="middle" font-size="18" font-weight="bold" fill="#ef4444">Combinations</text>
  <text x="580" y="200" text-anchor="middle" font-size="14" fill="#4b5563">Order doesn't matter</text>

  <!-- Combination circles -->
  <circle cx="480" cy="250" r="20" fill="#ef4444" fill-opacity="0.5" stroke="#ef4444"/>
  <circle cx="540" cy="250" r="20" fill="#ef4444" fill-opacity="0.5" stroke="#ef4444"/>
  <circle cx="600" cy="250" r="20" fill="#ef4444" fill-opacity="0.5" stroke="#ef4444"/>
  <text x="650" y="255" font-size="14" fill="#4b5563">=</text>
  <circle cx="700" cy="250" r="20" fill="#ef4444" fill-opacity="0.5" stroke="#ef4444"/>

  <!-- Formulas -->
  <text x="200" y="400" text-anchor="middle" font-size="20" fill="#3b82f6">P(n,r) = n!/(n-r)!</text>
  <text x="580" y="400" text-anchor="middle" font-size="20" fill="#ef4444">C(n,r) = n!/[r!(n-r)!]</text>

  <!-- Example -->
  <text x="400" y="500" text-anchor="middle" font-size="16" fill="#4b5563">
    Example: n=5, r=3
  </text>
  <text x="200" y="540" text-anchor="middle" font-size="14" fill="#3b82f6">P(5,3) = 60</text>
  <text x="580" y="540" text-anchor="middle" font-size="14" fill="#ef4444">C(5,3) = 10</text>
</svg>'''

def generate_proof_svg(title: str, summary: str) -> str:
    """Generate SVG for mathematical proof visualization."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f9fa"/>

  <text x="400" y="50" text-anchor="middle" font-size="28" font-weight="bold" fill="#1f2937">
    {title}
  </text>

  <!-- Proof structure -->
  <rect x="100" y="100" width="600" height="450" rx="10" fill="none" stroke="#6b7280" stroke-width="2"/>

  <!-- Given -->
  <text x="130" y="140" font-size="18" font-weight="bold" fill="#3b82f6">Given:</text>
  <text x="130" y="170" font-size="16" fill="#4b5563">P is true (premise)</text>

  <!-- Arrow -->
  <line x1="400" y1="200" x2="400" y2="250" stroke="#6b7280" stroke-width="2" marker-end="url(#arrow7)"/>

  <!-- Steps -->
  <text x="130" y="290" font-size="18" font-weight="bold" fill="#10b981">Steps:</text>
  <text x="130" y="320" font-size="16" fill="#4b5563">1. If P, then Q (given)</text>
  <text x="130" y="350" font-size="16" fill="#4b5563">2. P is true (premise)</text>
  <text x="130" y="380" font-size="16" fill="#4b5563">3. Therefore Q (modus ponens)</text>

  <!-- Arrow -->
  <line x1="400" y1="410" x2="400" y2="460" stroke="#6b7280" stroke-width="2" marker-end="url(#arrow7)"/>

  <!-- Conclusion -->
  <text x="130" y="500" font-size="18" font-weight="bold" fill="#ef4444">Conclusion:</text>
  <text x="130" y="530" font-size="16" fill="#4b5563">Q.E.D. ∎</text>

  <!-- Proof types -->
  <text x="550" y="140" font-size="14" fill="#6b7280">Proof Types:</text>
  <text x="550" y="170" font-size="12" fill="#4b5563">• Direct</text>
  <text x="550" y="195" font-size="12" fill="#4b5563">• Contradiction</text>
  <text x="550" y="220" font-size="12" fill="#4b5563">• Induction</text>
  <text x="550" y="245" font-size="12" fill="#4b5563">• Contrapositive</text>

  <defs>
    <marker id="arrow7" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#6b7280"/>
    </marker>
  </defs>
</svg>'''

