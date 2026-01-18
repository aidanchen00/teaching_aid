# 🔧 Circular Reference Error - Fixed

## Problem

When clicking "Join Room" button, the app crashed with:
```
Connection Error: Converting circular structure to JSON
--> starting at object with constructor 'HTMLButtonElement'
| property '__reactFiber$88zk1fgmdzi' -> object with constructor 'FiberNode'
--- property 'stateNode' closes the circle
```

## Root Cause

**Location**: `/frontend/app/room/page.tsx` line 119

**The Issue**:
```typescript
// BEFORE (BROKEN)
<button onClick={handleJoinRoom}>
```

When you click a button in React, the onClick handler receives a **click event object**. This event object contains references to DOM elements (HTMLButtonElement), which have React Fiber references, creating circular structures that cannot be serialized to JSON.

The `handleJoinRoom` function expected an optional `string` parameter for sessionId, but was receiving the entire click event object instead.

## What Happened

```
User clicks "Join Room" button
    ↓
React passes click event object to handleJoinRoom
    ↓
handleJoinRoom thinks event object is sessionId
    ↓
Line 66: sessionId: session || undefined
    ↓
sessionId = { entire event object with DOM refs }
    ↓
Line 63-68: JSON.stringify({ sessionId: eventObject })
    ↓
💥 Error: Circular structure detected
```

## The Fix

### 1. Fixed Button Click Handler
```typescript
// AFTER (FIXED)
<button onClick={() => handleJoinRoom()}>
```

Now the arrow function calls `handleJoinRoom()` with **no arguments**, preventing the event object from being passed.

### 2. Added Type Safety in handleJoinRoom
```typescript
// Added validation
const sessionId = typeof session === 'string' ? session : undefined;
```

This ensures that even if someone accidentally passes a non-string value, it won't crash - it will just be treated as undefined.

### 3. Improved Data Channel Error Handling

**Location**: `/frontend/hooks/useAgentDataChannel.ts`

Added better error handling for JSON serialization:
```typescript
// Clean payload - only include serializable data
const cleanPayload: any = { action };
if (payload?.label) cleanPayload.label = payload.label;
if (payload?.data && typeof payload.data !== 'object') {
  cleanPayload.data = payload.data; // Only primitives
}

// Try to stringify with error checking
try {
  jsonString = JSON.stringify(message);
} catch (stringifyError) {
  console.error('Cannot serialize message - circular reference detected');
  throw new Error('Cannot send message with circular references');
}
```

### 4. Fixed Knowledge Graph Circular References

**Location**: `/frontend/components/knowledge-graph-panel.tsx`

Force-directed graph library mutates node objects with React/Three.js references. Fixed by creating clean copies:

```typescript
const graphData = {
  nodes: graph.nodes.map((node) => ({
    // Return clean object with only needed properties
    id: node.id,
    label: node.label,
    vizType: node.vizType,
    // ... no React Fiber refs
  }))
};
```

## Files Modified

1. **frontend/app/room/page.tsx**
   - Line 119: Changed `onClick={handleJoinRoom}` to `onClick={() => handleJoinRoom()}`
   - Line 58: Added type check for session parameter

2. **frontend/hooks/useAgentDataChannel.ts**
   - Added payload sanitization
   - Added JSON serialization error handling

3. **frontend/components/knowledge-graph-panel.tsx**
   - Created clean node copies to prevent mutation

4. **frontend/components/learning-panel.tsx**
   - Created cleanNode object to strip React references during expansion

## How to Verify the Fix

1. **Start the app:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test joining:**
   - Go to http://localhost:3000/room
   - Click "Join Room" button
   - Should connect without errors ✅

3. **Test with session ID:**
   - Go to http://localhost:3000 (globe)
   - Click any curriculum and click START
   - Should auto-join the room ✅

4. **Test voice agent:**
   - After joining, say "teach me calculus"
   - Should generate graph without errors ✅

5. **Test graph interaction:**
   - Click any node in the graph
   - Should show visualization instantly ✅
   - Graph should expand in background ✅

## Prevention Tips

### ❌ Don't Do This:
```typescript
// Passing event handler directly
<button onClick={myFunction}>

// If myFunction expects parameters, this passes the event object
```

### ✅ Do This Instead:
```typescript
// Use arrow function to control arguments
<button onClick={() => myFunction()}>
<button onClick={() => myFunction(specificValue)}>

// Or use event explicitly if needed
<button onClick={(e) => {
  e.preventDefault();
  myFunction();
}}>
```

### Type Safety:
Always add type checks when receiving external data:
```typescript
function handleData(input?: string) {
  // Validate type before using
  const cleanInput = typeof input === 'string' ? input : undefined;

  // Now safe to use
  const data = {
    value: cleanInput,
  };

  JSON.stringify(data); // ✅ Safe
}
```

## Related Errors

This fix also prevents similar errors:
- "Converting circular structure to JSON" with any DOM element
- "Converting circular structure to JSON" with React Fiber nodes
- "Converting circular structure to JSON" with event objects
- Serialization errors when sending data over data channels

## Summary

**Problem**: Click event objects with DOM/React references were being accidentally serialized

**Solution**:
1. Wrap onClick handlers in arrow functions
2. Add type validation for external parameters
3. Sanitize all data before JSON serialization
4. Create clean copies of data structures that might be mutated

**Result**: ✅ Video room joins successfully without circular reference errors

The app now properly handles all button clicks and data serialization without attempting to serialize DOM elements or React internal references.
