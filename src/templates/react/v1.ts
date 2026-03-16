import type { ReactEnvironment, GlobalConfig, Environment } from '../../types';
import type { Template } from '../types';
import { getPmCommands, getCachePath } from '../utils';

export const ReactTemplateV1: Template = {
  metadata: {
    id: 'react-s3-cloudfront',
    name: 'React S3 + CloudFront',
    version: '1.0.0',
    description: 'Standard React deployment to AWS S3 with CloudFront invalidation.',
  },
  generate: (environments: Environment[], config: GlobalConfig) => {
    const reactEnvs = environments as ReactEnvironment[];
    const pm = getPmCommands(config.packageManager);
    const cachePath = getCachePath(config.packageManager);

    let yaml = `image: node:${config.nodeVersion || '22.16.0'}

options:
  size: 2x

definitions:
  caches:
    ${config.packageManager}: ${cachePath}

  steps:
    - step: &quality-check
        name: Quality Check
        image: node:${config.nodeVersion || '20'}-alpine
        caches:
          - ${config.packageManager}
        script:
          - set -e
${pm.install.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} format:check & PID1=$!
          - ${pm.run} lint & PID2=$!
          - ${pm.run} build --mode production & PID3=$!
          - wait $PID1
          - wait $PID2
          - wait $PID3
          - ${pm.audit}

    - step: &deploy
        name: 🚀 Deploy
        script:
          - pipe: atlassian/aws-s3-deploy:2.0.1
            variables:
              AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
              AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
              AWS_DEFAULT_REGION: ap-south-1
              S3_BUCKET: $S3_BUCKET
              LOCAL_PATH: dist

          - pipe: atlassian/aws-cloudfront-invalidate:0.11.0
            variables:
              AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
              AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
              AWS_DEFAULT_REGION: ap-south-1
              DISTRIBUTION_ID: $DISTRIBUTION_ID
`;

    reactEnvs.forEach((env) => {
      yaml += `
    - step: &build-${env.name.toLowerCase()}
        name: Build React (${env.name})
        caches:
          - ${config.packageManager}
        script:
          - set -e
${pm.install.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} build --mode ${env.name.toLowerCase()}
        artifacts:
          - dist/**
`;
    });

    yaml += `
pipelines:
  pull-requests:
    "**":
      - step: *quality-check
`;

    if (reactEnvs.length > 0) {
      yaml += `
  branches:
`;
      reactEnvs.forEach((env) => {
        yaml += `    ${env.branch}:
      - step: *build-${env.name.toLowerCase()}
      - step:
          <<: *deploy
          deployment: ${env.name}
`;
      });
    }

    return yaml;
  },
};
