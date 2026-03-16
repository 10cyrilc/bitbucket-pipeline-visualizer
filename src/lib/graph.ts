import type { Edge, Node } from '@xyflow/react';
import type { Environment, ProjectType } from '../types';
import yaml from 'js-yaml';

export const generateGraph = (projectType: ProjectType, environments: Environment[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // PR Flow
  const prNodeId = 'pr-trigger';
  nodes.push({
    id: prNodeId,
    position: { x: 100, y: 50 },
    data: { label: 'Pull Request' },
    type: 'input',
    style: { background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', padding: '10px' },
  });

  const qcNodeId = 'quality-check';
  nodes.push({
    id: qcNodeId,
    position: { x: 100, y: 150 },
    data: { label: projectType === 'react' ? 'Quality Check' : 'Backend Quality Check' },
    style: { background: '#0f172a', border: '1px solid #3b82f6', color: '#bfdbfe', borderRadius: '8px', padding: '10px' },
  });
  edges.push({
    id: `e-${prNodeId}-${qcNodeId}`,
    source: prNodeId,
    target: qcNodeId,
    animated: true,
    style: { stroke: '#475569' },
  });

  // Branch Flow
  if (environments.length > 0) {
    const branchNodeId = 'branch-trigger';
    nodes.push({
      id: branchNodeId,
      position: { x: 400, y: 50 },
      data: { label: 'Branch Push' },
      type: 'input',
      style: { background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', padding: '10px' },
    });

    environments.forEach((env, index) => {
      const xOffset = 400 + (index - (environments.length - 1) / 2) * 200;
      
      const buildNodeId = `build-${env.id}`;
      nodes.push({
        id: buildNodeId,
        position: { x: xOffset, y: 150 },
        data: { label: projectType === 'react' ? `Build React (${env.name})` : `Build Image (${env.name})` },
        style: { background: '#422006', border: '1px solid #ca8a04', color: '#fef08a', borderRadius: '8px', padding: '10px' },
      });
      edges.push({
        id: `e-${branchNodeId}-${buildNodeId}`,
        source: branchNodeId,
        target: buildNodeId,
        animated: true,
        style: { stroke: '#475569' },
      });

      const deployNodeId = `deploy-${env.id}`;
      nodes.push({
        id: deployNodeId,
        position: { x: xOffset, y: 250 },
        data: { label: projectType === 'react' ? `Deploy React (${env.name})` : `Deploy Container (${env.name})` },
        style: { background: '#064e3b', border: '1px solid #059669', color: '#d1fae5', borderRadius: '8px', padding: '10px' },
      });
      edges.push({
        id: `e-${buildNodeId}-${deployNodeId}`,
        source: buildNodeId,
        target: deployNodeId,
        animated: true,
        style: { stroke: '#475569' },
      });
    });
  }

  return { nodes, edges };
};

interface BitbucketPipelines {
  pipelines?: {
    'pull-requests'?: Record<string, Array<{ step?: { name?: string } }>>;
    branches?: Record<string, Array<{ step?: { name?: string } }>>;
  };
}

export const generateGraphFromYaml = (yamlString: string) => {
  try {
    const doc = yaml.load(yamlString) as BitbucketPipelines | null;
    if (!doc || typeof doc !== 'object' || !doc.pipelines) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let startX = 100;

    // Parse PRs
    if (doc.pipelines?.['pull-requests']) {
      const pullRequests = doc.pipelines['pull-requests'];
      const prs = Object.keys(pullRequests);
      prs.forEach((prPattern) => {
        const prNodeId = `pr-${prPattern}`;
        nodes.push({
          id: prNodeId,
          position: { x: startX, y: 50 },
          data: { label: `PR: ${prPattern}` },
          type: 'input',
          style: { background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', padding: '10px' },
        });

        const steps = pullRequests[prPattern];
        let prevNodeId = prNodeId;
        let yOffset = 150;

        if (Array.isArray(steps)) {
          steps.forEach((stepObj, index) => {
            const step = stepObj.step;
            if (!step) return;
            const stepNodeId = `${prNodeId}-step-${index}`;
            nodes.push({
              id: stepNodeId,
              position: { x: startX, y: yOffset },
              data: { label: step.name || `Step ${index + 1}` },
              style: { background: '#0f172a', border: '1px solid #3b82f6', color: '#bfdbfe', borderRadius: '8px', padding: '10px' },
            });
            edges.push({
              id: `e-${prevNodeId}-${stepNodeId}`,
              source: prevNodeId,
              target: stepNodeId,
              animated: true,
              style: { stroke: '#475569' },
            });
            prevNodeId = stepNodeId;
            yOffset += 100;
          });
        }
        startX += 250;
      });
    }

    // Parse Branches
    if (doc.pipelines?.branches) {
      const { branches: branchMap } = doc.pipelines;
      const branches = Object.keys(branchMap);
      branches.forEach((branch) => {
        const branchNodeId = `branch-${branch}`;
        nodes.push({
          id: branchNodeId,
          position: { x: startX, y: 50 },
          data: { label: `Branch: ${branch}` },
          type: 'input',
          style: { background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', padding: '10px' },
        });

        const steps = branchMap[branch];
        let prevNodeId = branchNodeId;
        let yOffset = 150;

        if (Array.isArray(steps)) {
          steps.forEach((stepObj, index) => {
            const step = stepObj.step;
            if (!step) return;
            const stepNodeId = `${branchNodeId}-step-${index}`;
            
            // Try to color code based on step name
            let bg = '#0f172a';
            let border = '#3b82f6';
            let color = '#bfdbfe';
            
            const name = (step.name || '').toLowerCase();
            if (name.includes('build')) {
              bg = '#422006'; border = '#ca8a04'; color = '#fef08a';
            } else if (name.includes('deploy')) {
              bg = '#064e3b'; border = '#059669'; color = '#d1fae5';
            }

            nodes.push({
              id: stepNodeId,
              position: { x: startX, y: yOffset },
              data: { label: step.name || `Step ${index + 1}` },
              style: { background: bg, border: `1px solid ${border}`, color: color, borderRadius: '8px', padding: '10px' },
            });
            edges.push({
              id: `e-${prevNodeId}-${stepNodeId}`,
              source: prevNodeId,
              target: stepNodeId,
              animated: true,
              style: { stroke: '#475569' },
            });
            prevNodeId = stepNodeId;
            yOffset += 100;
          });
        }
        startX += 250;
      });
    }

    return { nodes, edges };
  } catch (e) {
    console.error('Failed to generate graph from YAML', e);
    return { nodes: [], edges: [] };
  }
};
