# Claude Hackathon: 3-Tier NLE Architecture Upgrade Plan

This is a brilliant conceptual reframing. By breaking the interface into a 3-tier macro-to-micro hierarchy (just like RCSB and professional bioinformatics tools), we instantly solve the data-scale problem while giving Claude a clear logical structure to control.

Here is the updated architecture plan mapping directly to your feedback:

## 1. The 3-Tier NLE Layout

### Tier 1: The Genome Viewer (Macro Track)
- **Role**: High-level overview of the entire dataset (millions of bases). 
- **Implementation**: I will build a new `MacroTimeline.tsx` panel. It will act as a minimized "minimap" track. Instead of rendering individual letters, it will render SVG blocks/heatmaps representing gene blocks, regulatory regions, or interaction clusters. 
- **Interaction**: Dragging a box on this track will execute a new command: `Viewport.setWindow(start, end)`.

### Tier 2: The Sequence Viewer (Mid-Level Track)
- **Role**: The zoomed-in sequence scrubber.
- **Implementation**: I will adapt the current `TimelineScrubber.tsx` to only render the slice of data defined by `[windowStart, windowEnd]`. It will render the discrete amino acid letters and annotation tracks (like activity waveforms and motif markers).
- **Interaction**: Clicking or scrubbing here will execute `Timeline.setPlayhead(index)`.

### Tier 3: The 3D Viewer (Micro Viewport)
- **Role**: The GPU-optimized rendering of the 3D structure.
- **Implementation**: `Viewport3D.tsx` will listen to the playhead position and execute `Viewport.lookAt(x, y, z)` to smoothly frame the specific atomic coordinates of the active sequence letter.

## 2. LLM Workflow (DeepSeek / Claude)
The AI Agent will live in the `AgentChatPanel`.
- **Workflow**: 
  1. The user asks Claude a high-level question ("Find the highest confidence interaction cluster").
  2. Claude analyzes the macro-data and outputs: `Data.filterThreshold('interaction', 0.85, 1.0)`.
  3. Claude then windows the view: `Viewport.setWindow(400, 600)`.
  4. Claude sets the focus: `Timeline.setPlayhead(452)` and `Viewport.lookAt(x, y, z)`.
- **Implementation**: I will wire up the provided DeepSeek and Claude API keys so the agent can parse natural language directly into these command batches.

## User Review Required

> [!IMPORTANT]
> **Regarding Mol* (molstar)**: You mentioned RCSB uses Mol*. Mol* is the absolute gold standard for rendering massive PDB files, but integrating it natively can be complex. 
> 
> **Question**: Do you want me to completely replace our current custom glowing Three.js `Viewport3D` with the official Mol* viewer (using a wrapper like `pdbe-molstar`)? Or should I keep our custom Three.js viewport for now and just implement the 3-Tier UI layout around it? (Our custom Three.js is flashier for a hackathon UI, but Mol* handles real biology better).
