#!/usr/bin/env python3
"""
Pre-generate Manim videos for common topics.
Run this script to create cached videos that load instantly.
Uses Text instead of MathTex to avoid LaTeX dependency.
"""
import subprocess
import shutil
import tempfile
from pathlib import Path

STATIC_DIR = Path(__file__).parent.parent / "static"
VIDEOS_DIR = STATIC_DIR / "videos"
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# Manim scenes for each topic - NO LaTeX (uses Text instead of MathTex)
SCENES = {
    "calculus": '''
from manim import *

class CalculusAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Calculus", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # Create axes
        axes = Axes(
            x_range=[0, 4, 1],
            y_range=[0, 8, 2],
            x_length=6,
            y_length=4,
            axis_config={"color": BLUE},
        ).shift(DOWN * 0.5)

        x_label = Text("x", font_size=24).next_to(axes.x_axis, RIGHT)
        y_label = Text("y", font_size=24).next_to(axes.y_axis, UP)
        self.play(Create(axes), Write(x_label), Write(y_label))

        # Plot function f(x) = x^2
        func = axes.plot(lambda x: x**2, color=YELLOW, x_range=[0, 2.5])
        func_label = Text("f(x) = x squared", font_size=20, color=YELLOW).next_to(axes, RIGHT).shift(UP)
        self.play(Create(func), Write(func_label))
        self.wait(0.3)

        # Show area under curve (integral visualization)
        rects = axes.get_riemann_rectangles(func, x_range=[0, 2], dx=0.2, color=GREEN, fill_opacity=0.5)
        area_label = Text("Integral = Area", font_size=20, color=GREEN).next_to(rects, DOWN)
        self.play(Create(rects), Write(area_label))
        self.wait(0.5)

        # Transform to finer rectangles
        rects2 = axes.get_riemann_rectangles(func, x_range=[0, 2], dx=0.1, color=GREEN, fill_opacity=0.5)
        self.play(Transform(rects, rects2))
        self.wait(0.3)

        # Show tangent line (derivative)
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
        # Title
        title = Text("Chemistry", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # Create atom representation
        nucleus = Circle(radius=0.5, color=RED, fill_opacity=0.8).shift(LEFT * 3)
        proton_label = Text("+", font_size=36, color=WHITE).move_to(nucleus)
        nucleus_text = Text("Nucleus", font_size=18).next_to(nucleus, DOWN)

        self.play(Create(nucleus), Write(proton_label), Write(nucleus_text))

        # Electron orbits
        orbit1 = Circle(radius=1.2, color=BLUE_A, stroke_width=2).move_to(nucleus.get_center())
        orbit2 = Circle(radius=1.8, color=BLUE_B, stroke_width=2).move_to(nucleus.get_center())
        self.play(Create(orbit1), Create(orbit2))

        # Electrons
        electron1 = Dot(color=YELLOW, radius=0.12).move_to(nucleus.get_center() + RIGHT * 1.2)
        electron2 = Dot(color=YELLOW, radius=0.12).move_to(nucleus.get_center() + UP * 1.8)
        e_label = Text("-", font_size=24, color=BLACK).move_to(electron1)
        self.play(FadeIn(electron1), FadeIn(electron2))

        # Animate electrons orbiting
        self.play(
            Rotate(electron1, angle=2*PI, about_point=nucleus.get_center()),
            Rotate(electron2, angle=-1.5*PI, about_point=nucleus.get_center()),
            run_time=2
        )

        # Chemical reaction visualization
        h2_1 = Circle(radius=0.3, color=BLUE, fill_opacity=0.7).shift(RIGHT * 1.5 + UP)
        h2_2 = Circle(radius=0.3, color=BLUE, fill_opacity=0.7).shift(RIGHT * 2.1 + UP)
        o2 = Circle(radius=0.4, color=RED, fill_opacity=0.7).shift(RIGHT * 3 + UP)

        h_text = Text("H", font_size=16, color=WHITE).move_to(h2_1)
        h_text2 = Text("H", font_size=16, color=WHITE).move_to(h2_2)
        o_text = Text("O", font_size=16, color=WHITE).move_to(o2)

        self.play(
            Create(h2_1), Create(h2_2), Create(o2),
            Write(h_text), Write(h_text2), Write(o_text)
        )

        # Arrow
        arrow = Arrow(RIGHT * 3.5 + UP, RIGHT * 4.5 + UP, color=WHITE)
        self.play(Create(arrow))

        # Product - water molecule
        water_o = Circle(radius=0.4, color=RED, fill_opacity=0.7).shift(RIGHT * 5.5 + UP)
        water_h1 = Circle(radius=0.25, color=BLUE, fill_opacity=0.7).shift(RIGHT * 5 + UP * 0.5)
        water_h2 = Circle(radius=0.25, color=BLUE, fill_opacity=0.7).shift(RIGHT * 6 + UP * 0.5)

        self.play(Create(water_o), Create(water_h1), Create(water_h2))

        # Labels
        reactants = Text("Reactants", font_size=20, color=GREEN).shift(RIGHT * 2 + UP * 2)
        products = Text("Products", font_size=20, color=YELLOW).shift(RIGHT * 5.5 + UP * 2)
        self.play(Write(reactants), Write(products))
        self.wait(0.5)
''',

    "social": '''
from manim import *

class SocialScienceAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Social Network", font_size=48, color=WHITE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.3)

        # Create network nodes (people)
        positions = [
            LEFT * 3 + UP * 0.5,
            LEFT * 3 + DOWN * 1.5,
            LEFT * 0.5 + UP * 2,
            LEFT * 0.5 + DOWN * 2,
            RIGHT * 2 + UP * 0.5,
            RIGHT * 2 + DOWN * 1.5,
            ORIGIN,  # Central node
        ]
        colors = [RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE, WHITE]
        labels = ["A", "B", "C", "D", "E", "F", "Hub"]

        nodes = []
        node_labels = []
        for pos, color, label in zip(positions, colors, labels):
            node = Circle(radius=0.4, color=color, fill_opacity=0.7).move_to(pos)
            text = Text(label, font_size=16, color=BLACK).move_to(pos)
            nodes.append(node)
            node_labels.append(text)

        # Animate nodes appearing
        self.play(*[Create(node) for node in nodes])
        self.play(*[Write(label) for label in node_labels])

        # Create connections (social ties)
        edges = [
            (0, 6), (1, 6), (2, 6), (3, 6), (4, 6), (5, 6),  # All connect to hub
            (0, 1), (2, 4), (3, 5),  # Some peer connections
        ]

        lines = []
        for i, j in edges:
            line = Line(
                nodes[i].get_center(), nodes[j].get_center(),
                color=GRAY, stroke_width=2
            )
            lines.append(line)

        self.play(*[Create(line) for line in lines], run_time=1.5)

        # Highlight central node (high centrality)
        highlight = Circle(radius=0.6, color=WHITE, stroke_width=4).move_to(nodes[6].get_center())
        self.play(Create(highlight))

        centrality_label = Text("High Centrality", font_size=20, color=WHITE).next_to(highlight, DOWN * 2)
        self.play(Write(centrality_label))
        self.wait(0.3)

        # Information spread animation
        spread_waves = []
        for i, node in enumerate(nodes):
            wave = Circle(radius=0.1, color=YELLOW, fill_opacity=0.8, stroke_width=0).move_to(node.get_center())
            spread_waves.append(wave)

        # Start from hub and spread outward
        self.play(spread_waves[6].animate.scale(5).set_opacity(0), run_time=0.5)
        self.play(*[wave.animate.scale(5).set_opacity(0) for wave in spread_waves[:6]], run_time=1, lag_ratio=0.1)

        # Label
        info_label = Text("Information Diffusion in Networks", font_size=24, color=WHITE).to_edge(DOWN)
        self.play(Write(info_label))
        self.wait(0.5)
'''
}

SCENE_CLASSES = {
    "calculus": "CalculusAnimation",
    "chemistry": "ChemistryAnimation",
    "social": "SocialScienceAnimation",
}


def generate_video(topic: str, scene_code: str, scene_class: str):
    """Generate a single video."""
    output_path = VIDEOS_DIR / f"{topic}_animation.mp4"

    if output_path.exists():
        print(f"[{topic}] Already exists, skipping")
        return True

    temp_dir = tempfile.mkdtemp(prefix=f"manim_{topic}_")
    script_path = Path(temp_dir) / "scene.py"

    try:
        script_path.write_text(scene_code)
        print(f"[{topic}] Rendering...")

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
            timeout=180
        )

        if result.returncode != 0:
            print(f"[{topic}] Error: {result.stderr[-500:]}")
            return False

        # Find the output video
        for quality in ["480p15", "720p30", "1080p60"]:
            media_dir = Path(temp_dir) / "videos" / "scene" / quality
            video_files = list(media_dir.glob("*.mp4"))
            if video_files:
                shutil.copy(video_files[0], output_path)
                print(f"[{topic}] Saved to {output_path}")
                return True

        print(f"[{topic}] No video file found")
        return False

    except subprocess.TimeoutExpired:
        print(f"[{topic}] Timeout")
        return False
    except Exception as e:
        print(f"[{topic}] Error: {e}")
        return False
    finally:
        try:
            shutil.rmtree(temp_dir)
        except:
            pass


def main():
    print("Pre-generating Manim videos (no LaTeX required)...")
    print(f"Output directory: {VIDEOS_DIR}")
    print()

    for topic in SCENES:
        generate_video(topic, SCENES[topic], SCENE_CLASSES[topic])
        print()

    print("Done!")
    print(f"Videos in {VIDEOS_DIR}:")
    for f in VIDEOS_DIR.glob("*.mp4"):
        print(f"  - {f.name}")


if __name__ == "__main__":
    main()
