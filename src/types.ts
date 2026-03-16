export type ProjectType = 'react' | 'node';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface GlobalConfig {
  packageManager: PackageManager;
  nodeVersion: string;
  pythonVersion: string;
}

export interface BaseEnvironment {
  id: string;
  name: string;
  branch: string;
}

export interface ReactEnvironment extends BaseEnvironment {
  s3Bucket: string;
  distributionId: string;
}

export interface NodeEnvironment extends BaseEnvironment {
  serverIp: string;
  containerName: string;
  hostPort: string;
}

export type Environment = ReactEnvironment | NodeEnvironment;
