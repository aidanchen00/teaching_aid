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
    Generate Manim Python code for a given topic.
    Returns executable Manim scene code as a string.
    """
    topic_lower = topic.lower().replace(" ", "_")

    # ==========================================================================
    # CALCULUS
    # ==========================================================================
    if topic_lower in ["integrals", "definite_integrals", "integration_by_parts", "substitution"]:
        return generate_integral_animation(topic_lower, lesson_title)
    elif topic_lower in ["derivatives"]:
        return generate_derivative_animation(topic_lower, lesson_title)
    elif topic_lower in ["limits"]:
        return generate_limit_animation(topic_lower, lesson_title)

    # ==========================================================================
    # NEURAL NETWORKS / ML
    # ==========================================================================
    elif topic_lower in ["gradient_descent", "backpropagation"]:
        return generate_gradient_descent_animation(topic_lower, lesson_title)

    # ==========================================================================
    # LINEAR ALGEBRA
    # ==========================================================================
    elif topic_lower in ["linear_transformations", "matrices", "matrix_multiplication"]:
        return generate_matrix_transform_animation(topic_lower, lesson_title)

    # ==========================================================================
    # PHYSICS
    # ==========================================================================
    elif topic_lower in ["forces", "momentum", "energy", "mechanics"]:
        return generate_physics_dynamics_animation(topic_lower, lesson_title)

    # ==========================================================================
    # STATISTICS
    # ==========================================================================
    elif topic_lower in ["bayes_theorem", "probability"]:
        return generate_probability_animation(topic_lower, lesson_title)

    # ==========================================================================
    # DISCRETE MATH
    # ==========================================================================
    elif topic_lower in ["paths", "cycles", "connectivity", "recursion"]:
        return generate_graph_traversal_animation(topic_lower, lesson_title)

    # ==========================================================================
    # DEFAULT
    # ==========================================================================
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

# =============================================================================
# NEURAL NETWORKS / ML ANIMATIONS
# =============================================================================

def generate_gradient_descent_animation(topic: str, title: str) -> str:
    """Generate Manim code for gradient descent visualization."""
    return f'''
from manim import *
import numpy as np

class GradientDescentVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)

        # Create axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[0, 10, 2],
            x_length=8,
            y_length=5,
            axis_config={{"color": BLUE}},
        )
        axes.shift(DOWN * 0.5)

        labels = axes.get_axis_labels(x_label="w", y_label="L(w)")

        # Define loss function (quadratic)
        def loss(x):
            return x**2

        func = axes.plot(loss, color=YELLOW)
        func_label = MathTex("L(w) = w^2").next_to(func, UP + RIGHT)

        self.play(Create(axes), Write(labels))
        self.play(Create(func), Write(func_label))
        self.wait(0.5)

        # Gradient descent animation
        learning_rate = 0.3
        w = 2.5  # Starting point

        dot = Dot(axes.c2p(w, loss(w)), color=RED)
        self.play(Create(dot))

        # Gradient descent steps
        for _ in range(8):
            gradient = 2 * w
            new_w = w - learning_rate * gradient
            new_point = axes.c2p(new_w, loss(new_w))

            # Draw arrow showing gradient
            self.play(dot.animate.move_to(new_point), run_time=0.5)
            w = new_w

        # Final label
        converge_text = MathTex(r"w \\rightarrow 0").to_edge(DOWN)
        self.play(Write(converge_text))
        self.wait(1)
'''

# =============================================================================
# LINEAR ALGEBRA ANIMATIONS
# =============================================================================

def generate_matrix_transform_animation(topic: str, title: str) -> str:
    """Generate Manim code for matrix transformation visualization."""
    return f'''
from manim import *
import numpy as np

class MatrixTransformVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)

        # Create plane with grid
        plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-4, 4, 1],
            x_length=6,
            y_length=6,
            background_line_style={{
                "stroke_color": BLUE_D,
                "stroke_width": 1,
                "stroke_opacity": 0.6
            }}
        )

        # Basis vectors
        i_hat = Arrow(plane.c2p(0, 0), plane.c2p(1, 0), color=GREEN, buff=0)
        j_hat = Arrow(plane.c2p(0, 0), plane.c2p(0, 1), color=RED, buff=0)

        i_label = MathTex(r"\\hat{{i}}", color=GREEN).next_to(i_hat, DOWN)
        j_label = MathTex(r"\\hat{{j}}", color=RED).next_to(j_hat, LEFT)

        self.play(Create(plane))
        self.play(Create(i_hat), Create(j_hat))
        self.play(Write(i_label), Write(j_label))
        self.wait(0.5)

        # Matrix transformation
        matrix = [[2, 1], [0, 1]]  # Shear matrix
        matrix_tex = MathTex(r"A = \\begin{{bmatrix}} 2 & 1 \\\\ 0 & 1 \\end{{bmatrix}}").to_corner(UL)
        self.play(Write(matrix_tex))

        # Apply transformation
        self.play(
            plane.animate.apply_matrix(matrix),
            i_hat.animate.put_start_and_end_on(plane.c2p(0, 0), plane.c2p(2, 0)),
            j_hat.animate.put_start_and_end_on(plane.c2p(0, 0), plane.c2p(1, 1)),
            i_label.animate.next_to(plane.c2p(2, 0), DOWN),
            j_label.animate.next_to(plane.c2p(1, 1), LEFT),
            run_time=2
        )
        self.wait(2)
'''

# =============================================================================
# PHYSICS ANIMATIONS
# =============================================================================

def generate_physics_dynamics_animation(topic: str, title: str) -> str:
    """Generate Manim code for physics dynamics visualization."""
    return f'''
from manim import *
import numpy as np

class PhysicsDynamicsVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)

        # Create a block
        block = Square(side_length=1, color=BLUE, fill_opacity=0.7)
        block.shift(LEFT * 3)

        # Force arrows
        force_right = Arrow(
            block.get_center(),
            block.get_center() + RIGHT * 2,
            color=GREEN,
            buff=0
        )
        force_label = MathTex("F", color=GREEN).next_to(force_right, UP)

        # Ground
        ground = Line(LEFT * 5, RIGHT * 5, color=WHITE)
        ground.shift(DOWN * 0.5)

        self.play(Create(ground), Create(block))
        self.play(Create(force_right), Write(force_label))
        self.wait(0.5)

        # Newton's second law equation
        equation = MathTex("F = ma").to_corner(UL)
        self.play(Write(equation))

        # Animate motion
        for _ in range(3):
            self.play(
                block.animate.shift(RIGHT * 2),
                force_right.animate.shift(RIGHT * 2),
                force_label.animate.shift(RIGHT * 2),
                run_time=1
            )
            self.wait(0.2)

        # Momentum equation
        momentum_eq = MathTex("p = mv").next_to(equation, DOWN)
        self.play(Write(momentum_eq))
        self.wait(1)
'''

# =============================================================================
# STATISTICS ANIMATIONS
# =============================================================================

def generate_probability_animation(topic: str, title: str) -> str:
    """Generate Manim code for probability visualization."""
    return f'''
from manim import *
import numpy as np

class ProbabilityVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)

        # Probability tree
        root = Dot(ORIGIN + UP * 1.5, color=WHITE)
        root_label = Text("P", font_size=24).next_to(root, UP)

        # Branch A
        a_pos = LEFT * 2 + DOWN * 0.5
        a_node = Dot(a_pos, color=BLUE)
        a_label = MathTex("A", color=BLUE).next_to(a_node, LEFT)
        a_line = Line(root.get_center(), a_node.get_center(), color=BLUE)
        a_prob = MathTex("0.3", font_size=20).next_to(a_line, LEFT)

        # Branch B (not A)
        b_pos = RIGHT * 2 + DOWN * 0.5
        b_node = Dot(b_pos, color=RED)
        b_label = MathTex("A'", color=RED).next_to(b_node, RIGHT)
        b_line = Line(root.get_center(), b_node.get_center(), color=RED)
        b_prob = MathTex("0.7", font_size=20).next_to(b_line, RIGHT)

        self.play(Create(root), Write(root_label))
        self.wait(0.3)

        self.play(
            Create(a_line), Create(a_node), Write(a_label), Write(a_prob),
            Create(b_line), Create(b_node), Write(b_label), Write(b_prob)
        )
        self.wait(0.5)

        # Bayes' theorem
        bayes = MathTex(r"P(A|B) = \\frac{{P(B|A) \\cdot P(A)}}{{P(B)}}").to_edge(DOWN)
        self.play(Write(bayes))
        self.wait(2)
'''

# =============================================================================
# DISCRETE MATH ANIMATIONS
# =============================================================================

def generate_graph_traversal_animation(topic: str, title: str) -> str:
    """Generate Manim code for graph traversal visualization."""
    return f'''
from manim import *
import numpy as np

class GraphTraversalVisualization(Scene):
    def construct(self):
        # Title
        title_text = Text("{title}", font_size=36)
        title_text.to_edge(UP)
        self.play(Write(title_text))
        self.wait(0.5)

        # Create graph nodes
        positions = {{
            "A": LEFT * 2 + UP * 1,
            "B": RIGHT * 2 + UP * 1,
            "C": RIGHT * 2 + DOWN * 1,
            "D": LEFT * 2 + DOWN * 1,
            "E": ORIGIN
        }}

        nodes = {{}}
        labels = {{}}

        for name, pos in positions.items():
            node = Circle(radius=0.3, color=BLUE, fill_opacity=0.7)
            node.move_to(pos)
            label = Text(name, font_size=20).move_to(pos)
            nodes[name] = node
            labels[name] = label

        # Create edges
        edges = [("A", "B"), ("B", "C"), ("C", "D"), ("D", "A"), ("A", "E"), ("E", "C")]
        edge_lines = []
        for start, end in edges:
            line = Line(positions[start], positions[end], color=WHITE)
            edge_lines.append(line)

        # Draw graph
        self.play(*[Create(line) for line in edge_lines])
        self.play(*[Create(node) for node in nodes.values()])
        self.play(*[Write(label) for label in labels.values()])
        self.wait(0.5)

        # Highlight path A -> B -> C
        path = ["A", "B", "C"]
        for i, node_name in enumerate(path):
            self.play(
                nodes[node_name].animate.set_fill(GREEN, opacity=0.9),
                run_time=0.5
            )
            self.wait(0.3)

        # Path label
        path_label = MathTex(r"Path: A \\rightarrow B \\rightarrow C").to_edge(DOWN)
        self.play(Write(path_label))
        self.wait(1)
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
        elif "GradientDescentVisualization" in manim_code:
            scene_class = "GradientDescentVisualization"
        elif "MatrixTransformVisualization" in manim_code:
            scene_class = "MatrixTransformVisualization"
        elif "PhysicsDynamicsVisualization" in manim_code:
            scene_class = "PhysicsDynamicsVisualization"
        elif "ProbabilityVisualization" in manim_code:
            scene_class = "ProbabilityVisualization"
        elif "GraphTraversalVisualization" in manim_code:
            scene_class = "GraphTraversalVisualization"
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

