"""
Manim code generator and renderer for calculus visualizations.
Generates Python Manim code and renders to MP4.
"""
import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Optional

STATIC_DIR = Path(__file__).parent.parent.parent / "static"
VIDEOS_DIR = STATIC_DIR / "videos"

# Ensure directories exist
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

def generate_manim_code_for_topic(topic: str, lesson_title: str) -> str:
    """
    Generate Manim Python code for a given calculus topic.
    Returns executable Manim scene code as a string.
    """
    topic_lower = topic.lower().replace(" ", "_")
    
    # Different Manim scenes for different topics
    if topic_lower in ["integrals", "definite_integrals"]:
        return generate_integral_animation(topic_lower, lesson_title)
    elif topic_lower in ["derivatives"]:
        return generate_derivative_animation(topic_lower, lesson_title)
    elif topic_lower in ["limits"]:
        return generate_limit_animation(topic_lower, lesson_title)
    else:
        return generate_generic_animation(topic_lower, lesson_title)

def generate_integral_animation(topic: str, title: str) -> str:
    """Generate Manim code for integral visualization with shaded area."""
    return f'''
from manim import *

class IntegralVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)
        
        # Create axes
        axes = Axes(
            x_range=[-1, 3, 1],
            y_range=[-1, 5, 1],
            x_length=8,
            y_length=6,
            axis_config={{"color": BLUE}},
        )
        
        # Add labels
        labels = axes.get_axis_labels(x_label="x", y_label="f(x)")
        
        # Define function
        func = axes.plot(lambda x: x**2, color=YELLOW)
        func_label = MathTex("f(x) = x^2").next_to(func, UP)
        
        # Show axes and function
        self.play(Create(axes), Write(labels))
        self.play(Create(func), Write(func_label))
        self.wait(0.5)
        
        # Create shaded area
        area = axes.get_riemann_rectangles(
            func,
            x_range=[0, 2],
            dx=0.1,
            color=GREEN,
            fill_opacity=0.5
        )
        
        # Show area calculation
        integral_text = MathTex(r"\\int_{{0}}^{{2}} x^2 \\, dx = \\frac{{8}}{{3}}")
        integral_text.to_edge(DOWN)
        
        self.play(Create(area))
        self.wait(0.5)
        self.play(Write(integral_text))
        self.wait(2)
'''

def generate_derivative_animation(topic: str, title: str) -> str:
    """Generate Manim code for derivative visualization with tangent line."""
    return f'''
from manim import *

class DerivativeVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)
        
        # Create axes
        axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-1, 5, 1],
            x_length=8,
            y_length=6,
            axis_config={{"color": BLUE}},
        )
        
        labels = axes.get_axis_labels(x_label="x", y_label="f(x)")
        
        # Define function
        func = axes.plot(lambda x: x**2, color=YELLOW)
        func_label = MathTex("f(x) = x^2").next_to(func, UP)
        
        self.play(Create(axes), Write(labels))
        self.play(Create(func), Write(func_label))
        self.wait(0.5)
        
        # Point on curve
        x_val = 1
        dot = Dot(axes.c2p(x_val, x_val**2), color=RED)
        
        # Tangent line
        slope = 2 * x_val  # derivative of x^2 is 2x
        tangent = axes.plot(
            lambda x: slope * (x - x_val) + x_val**2,
            color=GREEN,
            x_range=[x_val - 1, x_val + 1]
        )
        
        tangent_label = MathTex("f'(1) = 2").next_to(tangent, RIGHT)
        
        self.play(Create(dot))
        self.wait(0.3)
        self.play(Create(tangent), Write(tangent_label))
        self.wait(2)
'''

def generate_limit_animation(topic: str, title: str) -> str:
    """Generate Manim code for limit visualization."""
    return f'''
from manim import *

class LimitVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)
        
        # Create axes
        axes = Axes(
            x_range=[-1, 3, 1],
            y_range=[-1, 4, 1],
            x_length=8,
            y_length=6,
            axis_config={{"color": BLUE}},
        )
        
        labels = axes.get_axis_labels(x_label="x", y_label="f(x)")
        
        # Define function with discontinuity at x=1
        def piecewise_func(x):
            return (x**2 - 1) / (x - 1) if abs(x - 1) > 0.01 else 2
        
        func = axes.plot(piecewise_func, color=YELLOW, discontinuities=[1])
        
        self.play(Create(axes), Write(labels))
        self.play(Create(func))
        self.wait(0.5)
        
        # Show limit point
        limit_point = Dot(axes.c2p(1, 2), color=RED, fill_opacity=0)
        limit_point.set_stroke(RED, width=3)
        
        limit_text = MathTex(r"\\lim_{{x \\to 1}} \\frac{{x^2-1}}{{x-1}} = 2")
        limit_text.to_edge(DOWN)
        
        self.play(Create(limit_point), Write(limit_text))
        self.wait(2)
'''

def generate_generic_animation(topic: str, title: str) -> str:
    """Generate generic Manim animation for topics without specific templates."""
    return f'''
from manim import *

class GenericVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=40)
        self.play(Write(title_text))
        self.wait(1)
        
        # Create axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            x_length=8,
            y_length=6,
            axis_config={{"color": BLUE}},
        )
        
        labels = axes.get_axis_labels(x_label="x", y_label="y")
        
        self.play(title_text.animate.to_edge(UP))
        self.play(Create(axes), Write(labels))
        self.wait(2)
'''

async def render_manim_video(topic: str, lesson_title: str, job_id: str) -> str:
    """
    Generate and render Manim video for a topic.
    Returns the URL path to the rendered video.
    
    Raises:
        Exception: If rendering fails
    """
    # Generate Manim code
    manim_code = generate_manim_code_for_topic(topic, lesson_title)
    
    # Create temporary file for Manim script
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        temp_script = f.name
        f.write(manim_code)
    
    try:
        # Determine output filename
        output_name = f"{job_id}_{topic.replace(' ', '_')}"
        
        # Get scene class name from code
        scene_class = "IntegralVisualization"
        if "DerivativeVisualization" in manim_code:
            scene_class = "DerivativeVisualization"
        elif "LimitVisualization" in manim_code:
            scene_class = "LimitVisualization"
        elif "GenericVisualization" in manim_code:
            scene_class = "GenericVisualization"
        
        # Create temporary output directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Run Manim render command
            cmd = [
                "manim",
                "-ql",  # Quality: low (faster for demo)
                "--format=mp4",
                f"--media_dir={temp_dir}",
                temp_script,
                scene_class
            ]
            
            print(f"[Manim] Rendering command: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout
            )
            
            if result.returncode != 0:
                error_msg = result.stderr or result.stdout
                raise Exception(f"Manim rendering failed: {error_msg}")
            
            # Find the rendered video file
            # Manim outputs to: {media_dir}/videos/{script_name}/{quality}/{scene_class}.mp4
            script_name = Path(temp_script).stem
            video_path = Path(temp_dir) / "videos" / script_name / "480p15" / f"{scene_class}.mp4"
            
            if not video_path.exists():
                # Try different quality folders
                for quality in ["720p30", "1080p60", "480p15"]:
                    alt_path = Path(temp_dir) / "videos" / script_name / quality / f"{scene_class}.mp4"
                    if alt_path.exists():
                        video_path = alt_path
                        break
            
            if not video_path.exists():
                raise Exception(f"Rendered video not found at expected path: {video_path}")
            
            # Copy to static directory
            final_path = VIDEOS_DIR / f"{output_name}.mp4"
            shutil.copy2(video_path, final_path)
            
            print(f"[Manim] Video saved to: {final_path}")
            
            # Return URL path
            return f"/static/videos/{output_name}.mp4"
    
    finally:
        # Clean up temp script
        try:
            os.unlink(temp_script)
        except:
            pass

