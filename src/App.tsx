import { useState, useEffect, useRef } from 'react';
import type { Environment, ProjectType, GlobalConfig } from './types';
import { templates } from './templates';
import { generateGraph, generateGraphFromYaml } from './lib/graph';
import { parseYamlToConfig } from './lib/yamlParser';
import { Sidebar } from './components/Sidebar';
import { PipelineGraph } from './components/PipelineGraph';
import { YamlEditor } from './components/YamlEditor';
import { Group, Panel, Separator, type PanelImperativeHandle } from 'react-resizable-panels';
import { Code2, LayoutPanelLeft } from 'lucide-react';

export default function App() {
  const [projectType, setProjectType] = useState<ProjectType>('react');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates['react'][0].metadata.id);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [yamlContent, setYamlContent] = useState<string>('');
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    packageManager: 'yarn',
    nodeVersion: '22.16.0',
    pythonVersion: '3.13',
  });

  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Update YAML when config changes (in basic mode)
  useEffect(() => {
    if (!isAdvancedMode) {
      const template = templates[projectType].find((t) => t.metadata.id === selectedTemplateId) || templates[projectType][0];
      setYamlContent(template.generate(environments, globalConfig));
    }
  }, [projectType, selectedTemplateId, environments, globalConfig, isAdvancedMode]);

  // Update config when YAML changes (in advanced mode)
  useEffect(() => {
    if (isAdvancedMode) {
      const parsedConfig = parseYamlToConfig(yamlContent);
      if (parsedConfig) {
        setProjectType(parsedConfig.projectType);
        setGlobalConfig(parsedConfig.globalConfig);
        setEnvironments(parsedConfig.environments);
      }
    }
  }, [yamlContent, isAdvancedMode]);

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitbucket-pipelines.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleRightPanel = () => {
    const panel = rightPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand();
        setIsRightPanelOpen(true);
      } else {
        panel.collapse();
        setIsRightPanelOpen(false);
      }
    }
  };

  const { nodes, edges } = isAdvancedMode 
    ? generateGraphFromYaml(yamlContent) 
    : generateGraph(projectType, environments);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden font-sans text-slate-200">
      <Group orientation="horizontal">
        {/* Sidebar Panel */}
        <Panel defaultSize={20} minSize={15} className="bg-[#111111] border-r border-slate-800">
          <Sidebar
            projectType={projectType}
            setProjectType={(type) => {
              setProjectType(type);
              setSelectedTemplateId(templates[type][0].metadata.id);
              setEnvironments([]);
            }}
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
            environments={environments}
            setEnvironments={setEnvironments}
            globalConfig={globalConfig}
            setGlobalConfig={setGlobalConfig}
            onDownload={handleDownload}
          />
        </Panel>

        <Separator className="w-1 bg-slate-800 hover:bg-indigo-500 cursor-col-resize transition-colors" />

        {/* Middle Panel (Visualizer) */}
        <Panel defaultSize={50} minSize={30} className="flex flex-col relative bg-[#0a0a0a]">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleRightPanel}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 shadow-sm backdrop-blur-sm transition-all text-xs font-medium"
            >
              <Code2 className="w-4 h-4" />
              <span>{isRightPanelOpen ? 'Hide Code' : 'Show Code'}</span>
            </button>
          </div>
          <PipelineGraph nodes={nodes} edges={edges} />
        </Panel>

        <Separator className="w-1 bg-slate-800 hover:bg-indigo-500 cursor-col-resize transition-colors" />

        {/* Right Panel (Pipeline Editor) */}
        <Panel 
          panelRef={rightPanelRef} 
          defaultSize={30} 
          minSize={15} 
          collapsible 
          onResize={(size) => {
            setIsRightPanelOpen(size.asPercentage > 0);
          }}
          className="bg-[#111111] border-l border-slate-800 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#161616] text-slate-300 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <LayoutPanelLeft className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold tracking-wide">bitbucket-pipelines.yml</h2>
            </div>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isAdvancedMode}
                onChange={(e) => setIsAdvancedMode(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <span className="text-slate-400">Advanced Edit</span>
            </label>
          </div>
          <div className="flex-1 overflow-hidden">
            <YamlEditor
              value={yamlContent}
              onChange={(val) => {
                if (isAdvancedMode) setYamlContent(val || '');
              }}
              readOnly={!isAdvancedMode}
            />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
