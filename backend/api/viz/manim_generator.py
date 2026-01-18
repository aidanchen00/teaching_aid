"""
Manim video generation for educational animations.
Generates actual Manim Python code and renders it to video.
"""
import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Optional, Tuple
import uuid

# Output directory for rendered videos
STATIC_DIR = Path(__file__).parent.parent.parent / "static"
VIDEOS_DIR = STATIC_DIR / "videos"
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# Manim scene templates for different topics - NO LaTeX dependency
MANIM_TEMPLATES = {
    "calculus": '''
from manim import *

class CalculusAnimation(Scene):
    def construct(self):
        title = Text("{title}", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 8, 2],
            x_length=6,
            y_length=4,
            axis_config={{"color": BLUE}},
        ).shift(DOWN * 0.5)

        x_label = Text("x", font_size=24).next_to(axes.x_axis, RIGHT)
        y_label = Text("y", font_size=24).next_to(axes.y_axis, UP)
        self.play(Create(axes), Write(x_label), Write(y_label))

        func = axes.plot(lambda x: x**2, color=YELLOW, x_range=[0, 2.5])
        func_label = Text("f(x) = x squared", font_size=20, color=YELLOW).next_to(axes, RIGHT).shift(UP)
        self.play(Create(func), Write(func_label))
        self.wait(0.3)

        rects = axes.get_riemann_rectangles(func, x_range=[0, 2], dx=0.2, color=GREEN, fill_opacity=0.5)
        area_label = Text("Integral = Area", font_size=20, color=GREEN).next_to(rects, DOWN)
        self.play(Create(rects), Write(area_label))
        self.wait(0.5)

        rects2 = axes.get_riemann_rectangles(func, x_range=[0, 2], dx=0.1, color=GREEN, fill_opacity=0.5)
        self.play(Transform(rects, rects2))
        self.wait(0.3)

        x_val = 1.5
        dot = Dot(axes.c2p(x_val, x_val**2), color=RED)
        slope = 2 * x_val
        tangent = axes.plot(lambda x: slope * (x - x_val) + x_val**2, color=RED, x_range=[0.5, 2.5])
        deriv_label = Text("Derivative = Slope", font_size=20, color=RED).to_edge(RIGHT).shift(DOWN)
        self.play(Create(dot), Create(tangent), Write(deriv_label))
        self.wait(0.5)
''',

    "chemistry": '''
from manim import *

class ChemistryAnimation(Scene):
    def construct(self):
        title = Text("{title}", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        nucleus = Circle(radius=0.5, color=RED, fill_opacity=0.8).shift(LEFT * 3)
        proton_label = Text("+", font_size=36, color=WHITE).move_to(nucleus)
        nucleus_text = Text("Nucleus", font_size=18).next_to(nucleus, DOWN)
        self.play(Create(nucleus), Write(proton_label), Write(nucleus_text))

        orbit1 = Circle(radius=1.2, color=BLUE_A, stroke_width=2).move_to(nucleus.get_center())
        orbit2 = Circle(radius=1.8, color=BLUE_B, stroke_width=2).move_to(nucleus.get_center())
        self.play(Create(orbit1), Create(orbit2))

        electron1 = Dot(color=YELLOW, radius=0.12).move_to(nucleus.get_center() + RIGHT * 1.2)
        electron2 = Dot(color=YELLOW, radius=0.12).move_to(nucleus.get_center() + UP * 1.8)
        self.play(FadeIn(electron1), FadeIn(electron2))

        self.play(
            Rotate(electron1, angle=2*PI, about_point=nucleus.get_center()),
            Rotate(electron2, angle=-1.5*PI, about_point=nucleus.get_center()),
            run_time=2
        )

        h2_1 = Circle(radius=0.3, color=BLUE, fill_opacity=0.7).shift(RIGHT * 1.5 + UP)
        h2_2 = Circle(radius=0.3, color=BLUE, fill_opacity=0.7).shift(RIGHT * 2.1 + UP)
        o2 = Circle(radius=0.4, color=RED, fill_opacity=0.7).shift(RIGHT * 3 + UP)
        h_text = Text("H", font_size=16, color=WHITE).move_to(h2_1)
        h_text2 = Text("H", font_size=16, color=WHITE).move_to(h2_2)
        o_text = Text("O", font_size=16, color=WHITE).move_to(o2)
        self.play(Create(h2_1), Create(h2_2), Create(o2), Write(h_text), Write(h_text2), Write(o_text))

        arrow = Arrow(RIGHT * 3.5 + UP, RIGHT * 4.5 + UP, color=WHITE)
        self.play(Create(arrow))

        water_o = Circle(radius=0.4, color=RED, fill_opacity=0.7).shift(RIGHT * 5.5 + UP)
        water_h1 = Circle(radius=0.25, color=BLUE, fill_opacity=0.7).shift(RIGHT * 5 + UP * 0.5)
        water_h2 = Circle(radius=0.25, color=BLUE, fill_opacity=0.7).shift(RIGHT * 6 + UP * 0.5)
        self.play(Create(water_o), Create(water_h1), Create(water_h2))

        reactants = Text("Reactants", font_size=20, color=GREEN).shift(RIGHT * 2 + UP * 2)
        products = Text("Products", font_size=20, color=YELLOW).shift(RIGHT * 5.5 + UP * 2)
        self.play(Write(reactants), Write(products))
        self.wait(0.5)
''',

    "social": '''
from manim import *

class SocialScienceAnimation(Scene):
    def construct(self):
        title = Text("{title}", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        positions = [LEFT * 3 + UP * 0.5, LEFT * 3 + DOWN * 1.5, LEFT * 0.5 + UP * 2, LEFT * 0.5 + DOWN * 2, RIGHT * 2 + UP * 0.5, RIGHT * 2 + DOWN * 1.5, ORIGIN]
        colors = [RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE, WHITE]
        labels = ["A", "B", "C", "D", "E", "F", "Hub"]

        nodes = []
        node_labels = []
        for pos, color, label in zip(positions, colors, labels):
            node = Circle(radius=0.4, color=color, fill_opacity=0.7).move_to(pos)
            text = Text(label, font_size=16, color=BLACK).move_to(pos)
            nodes.append(node)
            node_labels.append(text)

        self.play(*[Create(node) for node in nodes])
        self.play(*[Write(label) for label in node_labels])

        edges = [(0, 6), (1, 6), (2, 6), (3, 6), (4, 6), (5, 6), (0, 1), (2, 4), (3, 5)]
        lines = []
        for i, j in edges:
            line = Line(nodes[i].get_center(), nodes[j].get_center(), color=GRAY, stroke_width=2)
            lines.append(line)
        self.play(*[Create(line) for line in lines], run_time=1.5)

        highlight = Circle(radius=0.6, color=WHITE, stroke_width=4).move_to(nodes[6].get_center())
        self.play(Create(highlight))
        centrality_label = Text("High Centrality", font_size=20, color=WHITE).next_to(highlight, DOWN * 2)
        self.play(Write(centrality_label))
        self.wait(0.3)

        spread_waves = [Circle(radius=0.1, color=YELLOW, fill_opacity=0.8, stroke_width=0).move_to(node.get_center()) for node in nodes]
        self.play(spread_waves[6].animate.scale(5).set_opacity(0), run_time=0.5)
        self.play(*[wave.animate.scale(5).set_opacity(0) for wave in spread_waves[:6]], run_time=1, lag_ratio=0.1)

        info_label = Text("Information Diffusion", font_size=24, color=WHITE).to_edge(DOWN)
        self.play(Write(info_label))
        self.wait(0.5)
''',

    "default": '''
from manim import *

class DefaultAnimation(Scene):
    def construct(self):
        title = Text("{title}", font_size=48, color=WHITE)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP))

        circle = Circle(radius=1.5, color=BLUE, fill_opacity=0.5)
        square = Square(side_length=2, color=GREEN, fill_opacity=0.5)
        triangle = Triangle(color=RED, fill_opacity=0.5).scale(1.5)
        shapes = VGroup(circle, square, triangle).arrange(RIGHT, buff=1)

        self.play(Create(circle), Create(square), Create(triangle))
        self.wait(0.5)

        self.play(circle.animate.shift(UP), square.animate.shift(DOWN), triangle.animate.rotate(PI), run_time=1.5)

        desc = Text("{summary}", font_size=20, color=WHITE).to_edge(DOWN)
        self.play(Write(desc))
        self.wait(1)
'''
}


def get_manim_template(topic: str, title: str, summary: str) -> str:
    """Get the appropriate Manim template for a topic."""
    topic_lower = topic.lower()

    # Match topic to template
    if any(kw in topic_lower for kw in ["calculus", "derivative", "integral", "limit", "math"]):
        template = MANIM_TEMPLATES["calculus"]
    elif any(kw in topic_lower for kw in ["chemistry", "chemical", "atom", "molecule", "element"]):
        template = MANIM_TEMPLATES["chemistry"]
    elif any(kw in topic_lower for kw in ["social", "society", "psychology", "sociology"]):
        template = MANIM_TEMPLATES["social"]
    else:
        template = MANIM_TEMPLATES["default"]

    # Fill in the template
    # Truncate summary if too long
    short_summary = summary[:50] + "..." if len(summary) > 50 else summary

    return template.format(title=title, summary=short_summary)


def get_scene_class_name(topic: str) -> str:
    """Get the scene class name based on topic."""
    topic_lower = topic.lower()

    if any(kw in topic_lower for kw in ["calculus", "derivative", "integral", "limit", "math"]):
        return "CalculusAnimation"
    elif any(kw in topic_lower for kw in ["chemistry", "chemical", "atom", "molecule", "element"]):
        return "ChemistryAnimation"
    elif any(kw in topic_lower for kw in ["social", "society", "psychology", "sociology"]):
        return "SocialScienceAnimation"
    else:
        return "DefaultAnimation"


async def generate_manim_video(
    topic: str,
    title: str,
    summary: str,
    job_id: str
) -> Tuple[bool, str]:
    """
    Generate a Manim video for the given topic.

    Returns:
        Tuple of (success: bool, result: str)
        If success, result is the video URL path
        If failure, result is the error message
    """
    video_id = f"{job_id}_{topic.replace(' ', '_').replace('-', '_')}"
    output_path = VIDEOS_DIR / f"{video_id}.mp4"

    # Check if video already exists (cached)
    if output_path.exists():
        print(f"[ManimGenerator] Cache hit: {output_path}")
        return True, f"/static/videos/{video_id}.mp4"

    # Create temp directory for manim project
    temp_dir = tempfile.mkdtemp(prefix="manim_")
    script_path = Path(temp_dir) / "scene.py"

    try:
        # Generate manim code
        manim_code = get_manim_template(topic, title, summary)
        scene_class = get_scene_class_name(topic)

        # Write script to temp file
        script_path.write_text(manim_code)

        print(f"[ManimGenerator] Rendering {scene_class} for topic: {topic}")
        print(f"[ManimGenerator] Script path: {script_path}")

        # Run manim to render the video
        # Using -ql for low quality (faster), -qm for medium, -qh for high
        result = subprocess.run(
            [
                "manim",
                "-ql",  # Low quality for speed
                "--format=mp4",
                "--media_dir", temp_dir,
                str(script_path),
                scene_class
            ],
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )

        if result.returncode != 0:
            print(f"[ManimGenerator] Manim error: {result.stderr}")
            return False, f"Manim rendering failed: {result.stderr[:200]}"

        # Find the output video file
        media_dir = Path(temp_dir) / "videos" / "scene" / "480p15"
        video_files = list(media_dir.glob("*.mp4"))

        if not video_files:
            # Try other quality folders
            for quality in ["720p30", "1080p60", "480p15"]:
                media_dir = Path(temp_dir) / "videos" / "scene" / quality
                video_files = list(media_dir.glob("*.mp4"))
                if video_files:
                    break

        if not video_files:
            print(f"[ManimGenerator] No video file found in {temp_dir}")
            return False, "No video file generated"

        # Copy video to static directory
        shutil.copy(video_files[0], output_path)
        print(f"[ManimGenerator] Video saved to: {output_path}")

        return True, f"/static/videos/{video_id}.mp4"

    except subprocess.TimeoutExpired:
        return False, "Manim rendering timed out"
    except Exception as e:
        print(f"[ManimGenerator] Error: {e}")
        return False, str(e)
    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(temp_dir)
        except:
            pass


# Pre-generate videos with keyword matching (same as SVG cache)
PREGENERATED_VIDEO_CATEGORIES = {
    "calculus": {
        # Include "manim" since the Manim tool node should show a math animation
        "keywords": ["calculus", "derivative", "integral", "integration", "limit", "differentiat", "function", "curve", "tangent", "slope", "math", "manim"],
        "filename": "calculus_animation.mp4"
    },
    "chemistry": {
        "keywords": ["chemistry", "chemical", "atom", "molecule", "element", "periodic", "bond", "reaction", "compound", "electron"],
        "filename": "chemistry_animation.mp4"
    },
    "social": {
        "keywords": ["social", "society", "culture", "psychology", "sociology", "behavior", "community", "network", "interaction", "human"],
        "filename": "social_animation.mp4"
    },
}


def find_cached_video(topic: str) -> Optional[str]:
    """Check if a pre-generated video exists for this topic using keyword matching."""
    topic_lower = topic.lower()

    for category, config in PREGENERATED_VIDEO_CATEGORIES.items():
        if any(keyword in topic_lower for keyword in config["keywords"]):
            video_path = VIDEOS_DIR / config["filename"]
            if video_path.exists():
                print(f"[ManimGenerator] Pre-generated video found: {video_path} (matched {category})")
                return f"/static/videos/{config['filename']}"

    return None
