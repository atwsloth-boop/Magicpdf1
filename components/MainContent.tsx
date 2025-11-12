
import React from 'react';
import { TOOLS } from '../constants';
import { Tool, ToolCategory } from '../types';

interface MainContentProps {
  onSelectTool: (toolId: string) => void;
}

// Helper to generate a slug for anchor links
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

const ToolCard: React.FC<{ tool: Tool; onSelectTool: (toolId: string) => void }> = ({ tool, onSelectTool }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="mb-4 text-blue-600">
        <tool.icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{tool.title}</h3>
      <p className="text-sm text-gray-500 flex-grow mb-4">{tool.description}</p>
      <button 
        onClick={() => onSelectTool(tool.id)}
        className="mt-auto w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-blue-100 hover:border-blue-300"
      >
        Launch Tool
      </button>
    </div>
  );
};

const MainContent: React.FC<MainContentProps> = ({ onSelectTool }) => {
  const toolsByCategory = TOOLS.reduce((acc, tool) => {
    const { category } = tool;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  const toolCategories = Object.keys(toolsByCategory) as ToolCategory[];

  return (
    <main className="flex-1 p-6 md:p-10">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-wider mb-4">
          Magic PDF Toolkit
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-8">
          Effortlessly manage your documents. A complete suite of powerful, easy-to-use PDF tools right at your fingertips.
        </p>
        <div className="flex justify-center space-x-4">
          <a href={`#${toSlug(toolCategories[0])}`} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30">
            Explore Tools
          </a>
          <button className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-gray-300">
            Learn More
          </button>
        </div>
      </section>

      {/* Tools Grid by Category */}
      {toolCategories.map(category => (
        <section key={category} id={toSlug(category)} className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-200">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {toolsByCategory[category].map(tool => (
              <ToolCard key={tool.id} tool={tool} onSelectTool={onSelectTool} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};

export default MainContent;