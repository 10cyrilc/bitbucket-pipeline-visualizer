# Bitbucket Pipeline Visual Builder

A modern, interactive web application for visually building and editing Bitbucket Pipelines YAML configurations. Create complex CI/CD pipelines through an intuitive drag-and-drop interface or edit YAML directly.

## Features

- **Visual Pipeline Builder**: Create pipelines using an interactive graph interface
- **Template-Based Generation**: Start with pre-built templates for React and Node.js projects
- **Dual Editing Modes**:
  - Basic Mode: Configure pipelines through UI controls
  - Advanced Mode: Direct YAML editing with syntax highlighting
- **Real-time Preview**: See your pipeline structure visualized as you build
- **Environment Management**: Configure multiple deployment environments
- **YAML Export**: Download your pipeline configuration as `bitbucket-pipelines.yml`

## Supported Project Types

- **React**: Frontend deployment with AWS S3 and CloudFront
- **Node.js**: Backend deployment with Docker containers

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Graph Visualization**: React Flow (@xyflow/react)
- **Code Editor**: Monaco Editor
- **YAML Processing**: js-yaml
- **UI Components**: Lucide React icons, Resizable Panels

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitbucket-pipeline-visual-builder
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
pnpm build
pnpm preview
```

## Usage

### Basic Mode (Recommended for beginners)

1. Select your project type (React or Node.js)
2. Choose a template version
3. Configure global settings (package manager, Node/Python versions)
4. Add and configure deployment environments
5. Download the generated YAML file

### Advanced Mode

1. Toggle "Advanced Edit" in the YAML editor panel
2. Edit the YAML directly with full syntax highlighting
3. See real-time updates in the visual graph
4. Download your custom configuration

## Project Structure

```
src/
├── components/
│   ├── PipelineGraph.tsx    # Visual pipeline graph component
│   ├── Sidebar.tsx          # Configuration sidebar
│   └── YamlEditor.tsx       # Monaco-based YAML editor
├── lib/
│   ├── graph.ts            # Graph generation logic
│   └── yamlParser.ts       # YAML parsing utilities
├── templates/
│   ├── react/              # React project templates
│   ├── node/               # Node.js project templates
│   └── types.ts            # Template type definitions
├── types.ts                # TypeScript type definitions
└── App.tsx                 # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `pnpm install`
4. Run linting: `pnpm lint`
5. Make your changes and test thoroughly
6. Commit your changes: `git commit -am 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Code Quality

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components powered by [React Flow](https://reactflow.dev/)
- Code editing by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
