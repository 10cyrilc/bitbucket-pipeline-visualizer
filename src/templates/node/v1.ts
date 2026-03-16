import type { NodeEnvironment, GlobalConfig } from '../../types';
import type { Template } from '../types';
import { getPmCommands, getCachePath } from '../utils';

export const NodeTemplateV1: Template = {
  metadata: {
    id: 'node-docker-ssh',
    name: 'Node Docker + SSH',
    version: '1.0.0',
    description: 'Build Docker image, push to ECR, and deploy via SSH.',
  },
  generate: (environments: NodeEnvironment[], config: GlobalConfig) => {
    const pm = getPmCommands(config.packageManager);
    const cachePath = getCachePath(config.packageManager);

    let yaml = `image: python:${config.pythonVersion}-alpine

options:
  docker: true
  size: 2x

definitions:
  caches:
    ${config.packageManager}: ${cachePath}

  steps:
    - step: &quality-check
        name: Backend Quality Check
        image: node:${config.nodeVersion}-alpine
        caches:
          - ${config.packageManager}
        script:
${pm.install.map(cmd => `          - ${cmd}`).join('\n')}
          - ${pm.run} format:check
          - ${pm.run} lint
          - ${pm.run} test
`;

    environments.forEach((env) => {
      yaml += `
    - step: &build-${env.name}
        name: Build Docker Image (${env.name})
        script:
          - export IMAGE_TAG=$BITBUCKET_COMMIT
          - export REPO=ECR_REPOSITORY

          - pip install awscli

          - aws ecr get-login-password --region us-east-1 \\
            | docker login --username AWS --password-stdin ECR_REGISTRY

          - docker build -t $REPO:$IMAGE_TAG .
          - docker push $REPO:$IMAGE_TAG

    - step: &deploy-${env.name}
        name: Deploy Container (${env.name})
        script:
          - pipe: atlassian/ssh-run:0.8.1
            variables:
              SSH_USER: root
              SERVER: ${env.serverIp}
              SSH_KEY: $SSH_KEY
              COMMAND: |
                IMAGE_TAG=\${BITBUCKET_COMMIT}
                REPO=ECR_REPOSITORY

                docker pull \${REPO}:\${IMAGE_TAG}

                docker stop ${env.containerName} || true
                docker rm ${env.containerName} || true

                docker run -d \\
                  --name ${env.containerName} \\
                  -p ${env.hostPort}:5000 \\
                  --restart unless-stopped \\
                  \${REPO}:\${IMAGE_TAG}
`;
    });

    yaml += `
pipelines:
  pull-requests:
    '**':
      - step: *quality-check
`;

    if (environments.length > 0) {
      yaml += `  branches:\n`;
      environments.forEach((env) => {
        yaml += `    ${env.branch}:
      - step: *build-${env.name}
      - step: *deploy-${env.name}
`;
      });
    }

    return yaml;
  },
};
