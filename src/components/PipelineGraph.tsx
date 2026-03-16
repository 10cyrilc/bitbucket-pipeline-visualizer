import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface PipelineGraphProps {
  nodes: Node[];
  edges: Edge[];
}

export function PipelineGraph({ nodes, edges }: PipelineGraphProps) {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-right"
        className="bg-[#0a0a0a]"
        colorMode="dark"
      >
        <Background gap={16} size={1} color="#334155" />
        <Controls showInteractive={false} className="bg-slate-800 border-slate-700 fill-slate-300" />
      </ReactFlow>
    </div>
  );
}
