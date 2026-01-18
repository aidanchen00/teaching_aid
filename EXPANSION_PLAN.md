# 🌳 Knowledge Graph Expansion - Implementation Plan

## Goal
Transform the knowledge graph from a **flat 4-node structure** to an **expandable tree** that grows when you click nodes, with instant visualization loading.

---

## Current vs Desired

### Current (4-Node Flat Graph)
```
        Calculus
       /    |    \
Derivatives Integrals Limits
```
- Fixed 4 nodes
- Click node → Show viz only
- Graph never grows

### Desired (Expandable Tree)
```
                    Calculus
                   /    |    \
            Derivatives Integrals ────┐ Limits
                                      │
                        ┌─────────────┴─────────────┐
                        │             │             │
                   Substitution   By Parts   Definite Integrals
                        │
                ┌───────┴───────┐
                │       │       │
          U-Sub  Trig   Partial
```
- Starts with 4 nodes
- Click node → Show viz + Generate 3 children
- Graph grows organically
- Each node expandable

---

## Key Features

### 1. **Expand on Click**
- Click "Integrals" → Generate 3 child nodes
- Children: "Substitution", "By Parts", "Definite Integrals"
- Links: Integrals → each child

### 2. **Show Viz Immediately**
- Click triggers TWO actions in parallel:
  1. Show visualization (instant)
  2. Generate children (background)
- No blocking, no loading spinner

### 3. **Preload Assets**
- When graph updates, preload all visualizations
- Cache Three.js scenes, videos, images
- Switching nodes = instant (0ms load)

### 4. **Prevent Duplicate Expansion**
- Track which nodes have been expanded
- Don't re-expand if already has children
- Visual indicator: expanded nodes have different color

---

## Implementation Steps

### Phase 1: Backend Changes

#### 1.1 Update Session Store
**File:** `backend/api/session_store.py`

Add expansion tracking:
```python
@dataclass
class GraphNode:
    id: str
    label: str
    vizType: Optional[str] = None
    expanded: bool = False  # NEW: Track if node has children
    depth: int = 0          # NEW: Track depth in tree
    parent_id: Optional[str] = None  # NEW: Track parent

@dataclass
class Session:
    session_id: str
    center_id: str
    nodes: List[GraphNode]
    links: List[GraphLink]
    curriculum_context: Optional[Dict] = None
    max_depth: int = 3  # NEW: Prevent infinite expansion
```

#### 1.2 Add Expansion Function
**File:** `backend/api/session_store.py`

```python
def expand_node(
    session_id: str,
    parent_node_id: str,
    child_nodes: List[dict],
) -> Optional[Session]:
    """
    Add child nodes to an existing node.

    Args:
        session_id: Session ID
        parent_node_id: ID of node to expand
        child_nodes: List of child node dicts

    Returns:
        Updated session
    """
    session = sessions.get(session_id)
    if not session:
        return None

    # Find parent node
    parent = next((n for n in session.nodes if n.id == parent_node_id), None)
    if not parent:
        return None

    # Check if already expanded
    if parent.expanded:
        print(f"[SessionStore] Node {parent_node_id} already expanded")
        return session

    # Check max depth
    if parent.depth >= session.max_depth:
        print(f"[SessionStore] Max depth reached for {parent_node_id}")
        return session

    # Add child nodes
    for child_data in child_nodes:
        child = GraphNode(
            id=child_data["id"],
            label=child_data["label"],
            vizType=child_data.get("vizType", "image"),
            expanded=False,
            depth=parent.depth + 1,
            parent_id=parent_node_id
        )
        session.nodes.append(child)

        # Add link from parent to child
        session.links.append(GraphLink(source=parent_node_id, target=child.id))

    # Mark parent as expanded
    parent.expanded = True

    print(f"[SessionStore] Expanded {parent_node_id} with {len(child_nodes)} children")
    return session
```

#### 1.3 Update Chat Endpoint
**File:** `backend/api/routes/chat.py`

Add expansion mode:
```python
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    mode: str = "new"  # NEW: "new" | "expand"
    parentNodeId: Optional[str] = None  # NEW: For expansion

@router.post("", response_model=ChatResponse)
async def generate_graph(request: ChatRequest):
    """Generate or expand a knowledge graph."""

    if request.mode == "expand":
        # Expansion mode: generate 3 children for parent node
        prompt = f"""Generate 3 subtopics for "{request.message}".

        Return JSON:
        {{
          "message": "Brief explanation",
          "nodes": [
            {{"id": "subtopic-1", "label": "Subtopic 1", "vizType": "three"}},
            {{"id": "subtopic-2", "label": "Subtopic 2", "vizType": "video"}},
            {{"id": "subtopic-3", "label": "Subtopic 3", "vizType": "image"}}
          ]
        }}

        ONLY 3 nodes. Mix vizTypes. Be specific to {request.message}."""

        response = model.generate_content(prompt)
        parsed = extract_json(response.text)

        # Add to session as children
        if request.sessionId and request.parentNodeId:
            from api.session_store import expand_node
            expand_node(request.sessionId, request.parentNodeId, parsed["nodes"])

        return ChatResponse(
            message=parsed["message"],
            nodes=[GraphNode(**n) for n in parsed["nodes"]],
            links=[],  # Links created in expand_node
            centerId=request.parentNodeId or ""
        )

    else:
        # Normal mode: generate initial 4-node graph
        # ... existing code ...
```

---

### Phase 2: Frontend Changes

#### 2.1 Update Node Click Handler
**File:** `frontend/components/knowledge-graph-panel.tsx`

```typescript
const handleNodeClick = async (node: GraphNode) => {
  // 1. Show visualization immediately (non-blocking)
  setSelectedNode(node);
  setMode('VIZ');

  // 2. Check if node needs expansion (has no children)
  const hasChildren = graph.links.some(link => link.source === node.id);

  if (!hasChildren && node.depth < 3) {
    // 3. Expand in background (don't await)
    expandNode(node).catch(err => {
      console.error('Expansion failed:', err);
      // Visualization still works!
    });
  }
};

const expandNode = async (node: GraphNode) => {
  console.log(`[Graph] Expanding ${node.label}...`);

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: node.label,
        sessionId: sessionId,
        mode: 'expand',
        parentNodeId: node.id
      })
    });

    if (!response.ok) throw new Error('Expansion failed');

    const data = await response.json();

    // 4. Fetch updated graph from backend
    const graphResponse = await fetch(`${BACKEND_URL}/session/${sessionId}/graph`);
    const newGraph = await graphResponse.json();

    // 5. Update graph state
    setGraph(newGraph);

    // 6. Preload new visualizations
    preloadVisualizations(data.nodes);

    console.log(`[Graph] Expanded ${node.label} with ${data.nodes.length} children`);
  } catch (err) {
    console.error('[Graph] Expansion error:', err);
  }
};
```

#### 2.2 Preload Visualizations
**File:** `frontend/components/learning-panel.tsx`

```typescript
const preloadCache = useRef<Map<string, any>>(new Map());

const preloadVisualizations = useCallback(async (nodes: GraphNode[]) => {
  console.log('[Preload] Starting preload for', nodes.length, 'nodes');

  for (const node of nodes) {
    if (preloadCache.current.has(node.id)) {
      console.log(`[Preload] ${node.label} already cached`);
      continue;
    }

    switch (node.vizType) {
      case 'video':
        // Preload video
        const video = document.createElement('video');
        video.src = `/api/viz/${node.id}/video.mp4`;
        video.preload = 'auto';
        preloadCache.current.set(node.id, { type: 'video', asset: video });
        console.log(`[Preload] Video for ${node.label}`);
        break;

      case 'image':
        // Preload image
        const img = new Image();
        img.src = `/api/viz/${node.id}/diagram.png`;
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Don't block on error
        });
        preloadCache.current.set(node.id, { type: 'image', asset: img });
        console.log(`[Preload] Image for ${node.label}`);
        break;

      case 'three':
        // Preload Three.js scene data
        try {
          const response = await fetch(`/api/viz/${node.id}/scene.json`);
          const sceneData = await response.json();
          preloadCache.current.set(node.id, { type: 'three', asset: sceneData });
          console.log(`[Preload] 3D scene for ${node.label}`);
        } catch (err) {
          console.warn(`[Preload] Failed to preload ${node.label}:`, err);
        }
        break;
    }
  }

  console.log('[Preload] Complete! Cache size:', preloadCache.current.size);
}, []);

// Preload on graph update
useEffect(() => {
  if (graph?.nodes) {
    preloadVisualizations(graph.nodes);
  }
}, [graph, preloadVisualizations]);
```

#### 2.3 Use Preloaded Assets
**File:** `frontend/components/lesson-overlay.tsx`

```typescript
export function LessonOverlay({ node, preloadCache }: Props) {
  const cached = preloadCache.current.get(node.id);

  if (cached) {
    console.log(`[Viz] Using cached ${cached.type} for ${node.label}`);

    switch (cached.type) {
      case 'video':
        return <video src={cached.asset.src} autoPlay />;
      case 'image':
        return <img src={cached.asset.src} alt={node.label} />;
      case 'three':
        return <ThreeScene data={cached.asset} />;
    }
  }

  // Fallback: load on demand (shouldn't happen if preload works)
  return <LoadingSpinner />;
}
```

---

### Phase 3: Voice Agent Updates

#### 3.1 Update Agent Tool
**File:** `backend/agent/main.py`

Modify `select_topic` to trigger expansion:
```python
@function_tool()
async def select_topic(
    self,
    context: RunContext,
    topic_label: str,
) -> str:
    """Navigate to a topic and expand it if needed."""

    # Find node
    node = next((n for n in _session_state["current_graph"]["nodes"]
                 if n["label"].lower() == topic_label.lower()), None)

    if not node:
        return f"Topic '{topic_label}' not found."

    # Check if needs expansion
    has_children = any(
        link["source"] == node["id"]
        for link in _session_state["current_graph"]["links"]
    )

    if not has_children and node.get("depth", 0) < 3:
        # Expand node
        try:
            result = await generate_graph_from_topic(
                node["label"],
                _session_state["session_id"],
                mode="expand",
                parent_node_id=node["id"]
            )

            # Update state
            _session_state["current_graph"] = await get_graph(_session_state["session_id"])

            print(f"[Agent] Expanded {topic_label} with {len(result['nodes'])} children")
        except Exception as e:
            print(f"[Agent] Expansion failed: {e}")

    # Send select command to frontend
    ctx = agents.get_job_context()
    await ctx.room.local_participant.publish_data(
        json.dumps({
            "type": "command",
            "payload": {
                "action": "select_node_by_label",
                "label": node["label"]
            }
        }),
        reliable=True,
    )

    return f"Selected {node['label']}. Showing visualization."
```

---

## Visual Design

### Graph Visualization
```typescript
// ForceGraph3D node customization
nodeColor={(node: GraphNode) => {
  if (node.expanded) return '#00ff00';  // Green = has children
  if (node.depth === 0) return '#ff6b6b';  // Red = root
  if (node.depth === 1) return '#4ecdc4';  // Teal = level 1
  if (node.depth === 2) return '#ffe66d';  // Yellow = level 2
  return '#a8dadc';  // Light blue = level 3+
}}

nodeVal={(node: GraphNode) => {
  return 8 + (3 - node.depth) * 2;  // Larger = higher level
}}

linkWidth={(link) => {
  const sourceDepth = nodes.find(n => n.id === link.source)?.depth || 0;
  return 2 + (3 - sourceDepth);  // Thicker = higher level
}}
```

### Expansion Animation
```typescript
// When new nodes added
const [newNodeIds, setNewNodeIds] = useState<string[]>([]);

useEffect(() => {
  if (graph) {
    const newIds = graph.nodes
      .filter(n => !prevGraph?.nodes.some(pn => pn.id === n.id))
      .map(n => n.id);

    if (newIds.length > 0) {
      setNewNodeIds(newIds);

      // Pulse animation for 2 seconds
      setTimeout(() => setNewNodeIds([]), 2000);
    }
  }
}, [graph]);

// In ForceGraph3D
nodeThreeObject={(node: GraphNode) => {
  const isNew = newNodeIds.includes(node.id);

  if (isNew) {
    // Glowing pulse effect
    const geometry = new SphereGeometry(10);
    const material = new MeshBasicMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 2,
    });
    return new Mesh(geometry, material);
  }

  return null; // Use default
}}
```

---

## Performance Optimizations

### 1. Lazy Expansion
- Don't expand all nodes at once
- Only expand when clicked or voice-selected
- Prevent over-expansion (max depth = 3)

### 2. Smart Preloading
```typescript
// Preload only visible nodes + 1 level deep
const getPreloadNodes = (graph: GraphData, selectedNode: GraphNode) => {
  const toPreload: GraphNode[] = [selectedNode];

  // Add children of selected node
  const children = graph.nodes.filter(n =>
    graph.links.some(l => l.source === selectedNode.id && l.target === n.id)
  );
  toPreload.push(...children);

  // Add siblings
  const siblings = graph.nodes.filter(n =>
    n.parent_id === selectedNode.parent_id && n.id !== selectedNode.id
  );
  toPreload.push(...siblings);

  return toPreload;
};
```

### 3. Cache Management
```typescript
const MAX_CACHE_SIZE = 50; // Limit memory usage

const addToCache = (nodeId: string, asset: any) => {
  if (preloadCache.current.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (FIFO)
    const firstKey = preloadCache.current.keys().next().value;
    preloadCache.current.delete(firstKey);
    console.log(`[Cache] Evicted ${firstKey}`);
  }

  preloadCache.current.set(nodeId, asset);
};
```

### 4. Debounced Expansion
```typescript
// Prevent rapid clicks from triggering multiple expansions
const expandDebounced = useMemo(
  () => debounce(expandNode, 500),
  [expandNode]
);
```

---

## User Experience

### Flow Example
```
1. User joins session
   Graph: [Calculus] → [Derivatives, Integrals, Limits]
   Preload: 4 visualizations (instant)

2. User clicks "Integrals"
   - Viz shows IMMEDIATELY (0ms, from cache)
   - Background: Generate 3 children
   - 2 seconds later: Graph expands
   - New nodes appear with pulse animation

3. Graph now:
   [Calculus] → [Derivatives, Integrals → [Substitution, By Parts, Definite], Limits]
   Preload: 3 new visualizations

4. User clicks "Substitution"
   - Viz shows IMMEDIATELY (0ms, from cache)
   - Background: Generate 3 more children
   - Graph continues growing...

5. User says "go back"
   - Returns to graph view
   - All nodes visible with color-coded depth
```

---

## Rollout Plan

### Week 1: Backend
- [ ] Add `expanded`, `depth`, `parent_id` to GraphNode
- [ ] Implement `expand_node()` in session_store
- [ ] Update `/chat` endpoint with "expand" mode
- [ ] Test expansion logic

### Week 2: Frontend Core
- [ ] Update node click to trigger expansion
- [ ] Fetch and merge expanded graph
- [ ] Test graph growth (4 → 7 → 10 nodes)

### Week 3: Preloading
- [ ] Implement preload cache
- [ ] Preload on graph update
- [ ] Use cached assets in LessonOverlay
- [ ] Measure load times (target: <50ms)

### Week 4: Polish
- [ ] Add expansion animations
- [ ] Color-code by depth
- [ ] Prevent duplicate expansions
- [ ] Voice agent expansion support
- [ ] Max depth limiting

---

## Success Metrics

- ✅ Click node → viz shows <50ms (instant)
- ✅ Expansion completes <2s
- ✅ Graph grows smoothly (no flicker)
- ✅ Memory usage <200MB with 50 nodes
- ✅ Voice commands work with expansion
- ✅ No duplicate expansions

---

## Edge Cases

### 1. Expansion fails
- Show notification
- Visualization still works
- Try again on next click

### 2. Max depth reached
- Don't show expand indicator
- Gray out node
- Tooltip: "Max depth reached"

### 3. Slow network
- Show loading indicator on new nodes
- Timeout after 10s
- Partial graph update OK

### 4. Cache full
- Evict oldest entries
- Prioritize current view
- Log warnings

---

**Summary:** Transform flat 4-node graph → infinite expandable tree with instant visualization loading via preload cache. Click any node → show viz immediately + generate 3 children in background. Graph grows organically, limited to depth 3.
