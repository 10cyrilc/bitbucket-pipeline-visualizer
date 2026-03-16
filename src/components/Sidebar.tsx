import React from 'react';
import type { Environment, NodeEnvironment, ProjectType, ReactEnvironment, GlobalConfig, PackageManager } from '../types';
import { Plus, Trash2, Download, Settings2 } from 'lucide-react';
import { templates } from '../templates';

interface SidebarProps {
  projectType: ProjectType;
  setProjectType: (type: ProjectType) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  environments: Environment[];
  setEnvironments: React.Dispatch<React.SetStateAction<Environment[]>>;
  globalConfig: GlobalConfig;
  setGlobalConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
  onDownload: () => void;
}

export function Sidebar({
  projectType,
  setProjectType,
  selectedTemplateId,
  setSelectedTemplateId,
  environments,
  setEnvironments,
  globalConfig,
  setGlobalConfig,
  onDownload,
}: SidebarProps) {
  const addEnvironment = () => {
    const id = Math.random().toString(36).substring(7);
    if (projectType === 'react') {
      const newEnv: ReactEnvironment = {
        id,
        name: 'qa',
        branch: 'qa',
        s3Bucket: 'my-bucket-qa',
        distributionId: 'E1234567890',
      };
      setEnvironments([...environments, newEnv]);
    } else {
      const newEnv: NodeEnvironment = {
        id,
        name: 'qa',
        branch: 'qa',
        serverIp: '10.0.1.10',
        containerName: 'api-qa',
        hostPort: '4020',
      };
      setEnvironments([...environments, newEnv]);
    }
  };

  const removeEnvironment = (id: string) => {
    setEnvironments(environments.filter((env) => env.id !== id));
  };

  const updateEnvironment = (id: string, field: string, value: string) => {
    setEnvironments(
      environments.map((env) => {
        if (env.id === id) {
          return { ...env, [field]: value };
        }
        return env;
      })
    );
  };

  const availableTemplates = templates[projectType];

  return (
    <aside className="w-full h-full bg-[#111111] flex flex-col z-10">
      <div className="p-5 border-b border-slate-800 bg-[#161616]">
        <div className="flex items-center space-x-2 mb-1">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          <h1 className="text-lg font-semibold text-slate-100 tracking-tight">Pipeline Builder</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium">Bitbucket CI/CD Generator</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Project Type */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Type</label>
          <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setProjectType('react')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                projectType === 'react'
                  ? 'bg-[#2a2a2a] text-indigo-400 shadow-sm ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              React
            </button>
            <button
              onClick={() => setProjectType('node')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                projectType === 'node'
                  ? 'bg-[#2a2a2a] text-indigo-400 shadow-sm ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Node API
            </button>
          </div>
        </div>

        {/* Global Config */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</label>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Package Manager</label>
              <select
                value={globalConfig.packageManager}
                onChange={(e) => setGlobalConfig({ ...globalConfig, packageManager: e.target.value as PackageManager })}
                className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#1a1a1a] text-slate-200"
              >
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="pnpm">pnpm</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Node Version</label>
                <input
                  type="text"
                  value={globalConfig.nodeVersion}
                  onChange={(e) => setGlobalConfig({ ...globalConfig, nodeVersion: e.target.value })}
                  className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#1a1a1a] text-slate-200"
                />
              </div>
              {projectType === 'node' && (
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Python Version</label>
                  <input
                    type="text"
                    value={globalConfig.pythonVersion}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, pythonVersion: e.target.value })}
                    className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#1a1a1a] text-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Version</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full text-sm border border-slate-800 rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#1a1a1a] text-slate-200"
          >
            {availableTemplates.map((t) => (
              <option key={t.metadata.id} value={t.metadata.id}>
                {t.metadata.name} (v{t.metadata.version})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 leading-tight">
            {availableTemplates.find((t) => t.metadata.id === selectedTemplateId)?.metadata.description}
          </p>
        </div>

        {/* Environments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Environments</label>
            <button
              onClick={addEnvironment}
              className="p-1 hover:bg-[#2a2a2a] rounded-md text-slate-400 hover:text-indigo-400 transition-colors"
              title="Add Environment"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {environments.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-[#161616]">
              <p className="text-sm text-slate-500">No environments added.</p>
              <button
                onClick={addEnvironment}
                className="mt-2 text-sm text-indigo-400 font-medium hover:text-indigo-300"
              >
                + Add your first environment
              </button>
            </div>
          )}

          <div className="space-y-4">
            {environments.map((env) => (
              <div key={env.id} className="bg-[#161616] border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border-b border-slate-800">
                  <input
                    type="text"
                    value={env.name}
                    onChange={(e) => updateEnvironment(env.id, 'name', e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 w-32"
                    placeholder="Env Name"
                  />
                  <button
                    onClick={() => removeEnvironment(env.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Branch</label>
                    <input
                      type="text"
                      value={env.branch}
                      onChange={(e) => updateEnvironment(env.id, 'branch', e.target.value)}
                      className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                    />
                  </div>

                  {projectType === 'react' ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">S3 Bucket</label>
                        <input
                          type="text"
                          value={(env as ReactEnvironment).s3Bucket}
                          onChange={(e) => updateEnvironment(env.id, 's3Bucket', e.target.value)}
                          className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">CloudFront Dist ID</label>
                        <input
                          type="text"
                          value={(env as ReactEnvironment).distributionId}
                          onChange={(e) => updateEnvironment(env.id, 'distributionId', e.target.value)}
                          className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Server IP</label>
                        <input
                          type="text"
                          value={(env as NodeEnvironment).serverIp}
                          onChange={(e) => updateEnvironment(env.id, 'serverIp', e.target.value)}
                          className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Container</label>
                          <input
                            type="text"
                            value={(env as NodeEnvironment).containerName}
                            onChange={(e) => updateEnvironment(env.id, 'containerName', e.target.value)}
                            className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                          />
                        </div>
                        <div className="w-16">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Port</label>
                          <input
                            type="text"
                            value={(env as NodeEnvironment).hostPort}
                            onChange={(e) => updateEnvironment(env.id, 'hostPort', e.target.value)}
                            className="w-full text-sm border border-slate-800 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all bg-[#111111] text-slate-200"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#161616]">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download Pipeline</span>
        </button>
      </div>
    </aside>
  );
}
