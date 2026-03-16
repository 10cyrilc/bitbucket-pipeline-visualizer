import yaml from 'js-yaml';
import type { ProjectType, GlobalConfig, Environment, ReactEnvironment, NodeEnvironment } from '../types';

interface PipeStep {
  pipe?: string;
  variables?: Record<string, string>;
}

interface YamlStep {
  name?: string;
  script?: (string | PipeStep)[];
}

interface YamlStepObj {
  step?: YamlStep;
}

interface YamlDoc {
  image?: string;
  definitions?: {
    caches?: Record<string, string>;
    steps?: YamlStepObj[];
  };
  pipelines?: {
    branches?: Record<string, YamlStepObj[]>;
  };
}

export const parseYamlToConfig = (yamlString: string): {
  projectType: ProjectType;
  globalConfig: GlobalConfig;
  environments: Environment[];
} | null => {
  try {
    const doc = yaml.load(yamlString) as YamlDoc | null;
    if (!doc || typeof doc !== 'object') return null;

    let projectType: ProjectType = 'react';
    const globalConfig: GlobalConfig = {
      packageManager: 'yarn',
      nodeVersion: '22.16.0',
      pythonVersion: '3.13',
      ecrRegistry: '',
      ecrRepository: '',
    };
    const environments: Environment[] = [];

    // Extract versions
    if (doc.image && typeof doc.image === 'string') {
      const nodeMatch = doc.image.match(/node:([\d.]+)/);
      if (nodeMatch) globalConfig.nodeVersion = nodeMatch[1];

      const pythonMatch = doc.image.match(/python:([\d.]+)/);
      if (pythonMatch) {
        globalConfig.pythonVersion = pythonMatch[1];
        projectType = 'node';
      }
    }

    // Extract package manager
    if (doc.definitions?.caches) {
      const caches = Object.keys(doc.definitions.caches);
      if (caches.includes('npm')) globalConfig.packageManager = 'npm';
      else if (caches.includes('yarn')) globalConfig.packageManager = 'yarn';
      else if (caches.includes('pnpm')) globalConfig.packageManager = 'pnpm';
    }

    // Determine project type from steps
    let isNode = projectType === 'node';
    const steps = doc.definitions?.steps ?? [];
    for (const stepObj of steps) {
      const step = stepObj.step;
      if (!step) continue;
      if (step.name && step.name.includes('Backend')) isNode = true;
      if (step.script && Array.isArray(step.script)) {
        const scriptStr = step.script
          .map((s) => (typeof s === 'string' ? s : ''))
          .join(' ');
        if (scriptStr.includes('docker build') || scriptStr.includes('ssh-run')) {
          isNode = true;
        }
      }
    }
    projectType = isNode ? 'node' : 'react';

    // Extract environments from branches
    if (doc.pipelines?.branches) {
      const branches = Object.keys(doc.pipelines.branches);
      branches.forEach((branch, index) => {
        const branchSteps = doc.pipelines!.branches![branch];
        if (!Array.isArray(branchSteps)) return;

        let envName = branch === 'main' || branch === 'master' ? 'production' : branch;
        let s3Bucket = '';
        let distributionId = '';
        let serverIp = '';
        let containerName = '';
        let hostPort = '';

        for (const branchStep of branchSteps) {
          const step = branchStep.step;
          if (!step) continue;

          if (step.name) {
            const nameMatch = step.name.match(/\(([^)]+)\)/);
            if (nameMatch) envName = nameMatch[1];
          }

          if (step.script && Array.isArray(step.script)) {
            for (const cmd of step.script) {
              if (typeof cmd === 'object' && cmd.pipe) {
                if (cmd.pipe.includes('aws-s3-deploy')) {
                  s3Bucket = cmd.variables?.S3_BUCKET ?? s3Bucket;
                }
                if (cmd.pipe.includes('aws-cloudfront-invalidate')) {
                  distributionId = cmd.variables?.DISTRIBUTION_ID ?? distributionId;
                }
                if (cmd.pipe.includes('ssh-run')) {
                  serverIp = cmd.variables?.SERVER ?? serverIp;
                  const commandStr = cmd.variables?.COMMAND ?? '';
                  const rmMatch = commandStr.match(/docker rm ([^\s]+)/);
                  if (rmMatch) containerName = rmMatch[1];
                  const portMatch = commandStr.match(/-p (\d+):5000/);
                  if (portMatch) hostPort = portMatch[1];
                }
              }
            }
          }
        }

        if (projectType === 'react') {
          environments.push({
            id: `env-${Date.now()}-${index}`,
            name: envName,
            branch,
          } as ReactEnvironment);
        } else {
          environments.push({
            id: `env-${Date.now()}-${index}`,
            name: envName,
            branch,
            serverIp: serverIp || `192.168.1.${100 + index}`,
            containerName: containerName || `my-app-${envName}`,
            hostPort: hostPort || `${3000 + index}`,
            containerPort: '5000',
            nodeEnv: envName.toLowerCase(),
            sshUser: 'root',
            sshKey: '',
          } as NodeEnvironment);
        }
      });
    }

    return { projectType, globalConfig, environments };
  } catch (e) {
    console.error('Failed to parse YAML', e);
    return null;
  }
};
