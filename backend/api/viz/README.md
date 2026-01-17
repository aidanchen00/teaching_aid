# Visualization Generation System

This module handles dynamic visualization generation for calculus concepts.

## Architecture

```
User clicks node → Lesson selected → Viz job created → Generation starts
                                                      ↓
                                            Modality selection
                                                      ↓
                                    ┌─────────────────┼─────────────────┐
                                    ↓                 ↓                 ↓
                              three_spec        manim_mp4           image
                                    ↓                 ↓                 ↓
                            Interactive 3D      Animated video    Static diagram
```

## Components

### 1. Job Manager (`job_manager.py`)
- Manages async visualization generation tasks
- Tracks job status and progress
- Thread-safe in-memory storage

### 2. Visualization Generator (`generator.py`)
- Selects appropriate visualization modality
- Coordinates generation process
- Handles errors and timeouts

### 3. Three.js Templates (`three_templates.py`)
- Defines 6 calculus scene types
- Returns safe, structured specs
- No executable code generation

### 4. Manim Renderer (`manim_renderer.py`)
- Generates Python Manim code
- Renders to MP4 video
- 60-second timeout

### 5. Gemini Image Generator (`gemini_image.py`)
- Creates educational diagrams
- SVG fallback implementation
- Extensible for real API integration

## Modality Selection

| Topic Category | Modality | Reason |
|---------------|----------|---------|
| Derivatives, Chain Rule, Power Rule | `three_spec` | Interactive exploration of slopes |
| Integrals, Riemann Sums | `manim_mp4` | Animated area accumulation |
| Limits, Continuity | `image` | Conceptual diagrams |

## Usage

### Backend

```python
from api.viz.generator import generate_visualization_task
from api.viz.job_manager import job_manager

# Create job
job_id = job_manager.create_job()

# Start generation
job_manager.start_job(
    job_id,
    generate_visualization_task,
    topic="derivatives",
    lesson_title="Derivatives",
    summary="Learn about rates of change",
    job_id=job_id
)

# Poll status
job = job_manager.get_job(job_id)
print(job.status)  # pending | running | done | error
```

### Frontend

```typescript
import { selectLesson, pollVizJob } from '@/lib/api';

// Select lesson (starts viz generation)
const lesson = await selectLesson(sessionId, nodeId);

// Poll for completion
const result = await pollVizJob(
  lesson.vizJobId,
  (stage) => console.log(stage)
);

// Render based on type
if (result.viz.type === 'three_spec') {
  <ThreeRenderer spec={result.viz.spec} />
} else if (result.viz.type === 'manim_mp4') {
  <video src={result.viz.url} />
} else if (result.viz.type === 'image') {
  <img src={result.viz.url} />
}
```

## Adding New Visualizations

### 1. Add Scene Template (for three_spec)

```python
# In three_templates.py
def get_new_concept_spec(topic: str) -> Dict[str, Any]:
    return {
        "sceneType": "new_concept",
        "params": {
            "fn": "x^2",
            "range": [-5, 5],
            # ... other params
        }
    }
```

### 2. Add Frontend Component

```typescript
// In three-renderer.tsx
function NewConcept({ params }: { params: any }) {
  const curvePoints = generateCurve(params.fn, params.range);
  
  return (
    <>
      <Line points={curvePoints} color="#fbbf24" lineWidth={3} />
      {/* ... other elements */}
    </>
  );
}
```

### 3. Update Modality Selection

```python
# In generator.py
def select_viz_modality(topic: str) -> VizType:
    if topic_lower in ["new_concept"]:
        return "three_spec"
    # ...
```

## Error Handling

- **Timeout**: Jobs timeout after 60 seconds → status=error
- **Manim failure**: Subprocess errors caught → status=error with message
- **Gemini failure**: API errors caught → status=error
- **Retry**: Frontend allows ONE retry per visualization
- **Fallback**: Generic visualization shown on failure

## Performance Considerations

1. **Manim is slow** (10-30s per video)
   - Consider pre-generating common visualizations
   - Add Redis caching layer

2. **In-memory job manager**
   - Jobs lost on restart
   - Use Redis/database for production

3. **No caching**
   - Same viz regenerated each time
   - Cache by (nodeId, version)

## Testing

```bash
# Test Manim installation
cd backend
source venv/bin/activate
manim --version

# Test visualization generation
python -c "
from api.viz.generator import generate_visualization
import asyncio
result = asyncio.run(generate_visualization('derivatives', 'Derivatives', 'Test', 'test-job'))
print(result)
"
```

## Dependencies

- `manim>=0.19.0` - Animation engine
- `httpx>=0.27.0` - HTTP client
- System: `cairo`, `pango`, `pkg-config` (via Homebrew)

## Limitations

1. Math expression evaluation uses `eval()` (unsafe, should use parser)
2. SVG fallback instead of real Gemini API
3. No persistence of generated files
4. Single-process job manager
5. No rate limiting or queue management

