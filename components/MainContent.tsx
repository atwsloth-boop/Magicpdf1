
import React from 'react';
import { TOOLS } from '../constants';
import { Tool, ToolCategory } from '../types';

// Helper to generate a slug for anchor links
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="mb-4 text-indigo-600">
        <tool.icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{tool.title}</h3>
      <p className="text-sm text-gray-500 flex-grow mb-4">{tool.description}</p>
      <a 
        href={`#/tool/${tool.id}`}
        className="mt-auto block text-center w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-indigo-100 hover:border-indigo-300"
      >
        Launch Tool
      </a>
    </div>
  );
};

const MainContent: React.FC = () => {
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
          Prompt Minds Multi-Tool Hub
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-8">
          Your futuristic command center for digital productivity. Access a universe of powerful tools designed for the modern mind.
        </p>
        <div className="flex justify-center space-x-4">
          <a href={`#${toSlug(toolCategories[0])}`} className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-600/30">
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
          <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-indigo-200">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {toolsByCategory[category].map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};

export default MainContent;