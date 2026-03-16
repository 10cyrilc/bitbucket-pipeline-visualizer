export type ProjectType = 'react' | 'node';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface GlobalConfig {
  packageManager: PackageManager;
  nodeVersion: string;
  pythonVersion: string;
  ecrRegistry: string;
  ecrRepository: string;
}

export interface BaseEnvironment {
  id: string;
  name: string;
  branch: string;
}

export interface ReactEnvironment extends BaseEnvironment {
  // Shared deployment variables $S3_BUCKET and $DISTRIBUTION_ID are used now
}

export interface NodeEnvironment extends BaseEnvironment {
  serverIp: string;
  containerName: string;
  hostPort: string;
  containerPort: string;
  nodeEnv: string;
  sshUser: string;
  sshKey: string;
}

export type Environment = ReactEnvironment | NodeEnvironment;
