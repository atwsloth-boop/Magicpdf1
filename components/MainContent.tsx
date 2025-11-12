
import React from 'react';
import { TOOLS } from '../constants';
import { Tool } from '../types';

interface MainContentProps {
  onSelectTool: (toolId: string) => void;
}

const ToolCard: React.FC<{ tool: Tool; onSelectTool: (toolId: string) => void }> = ({ tool, onSelectTool }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1">
      <div className="mb-4 text-blue-500">
        <tool.icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{tool.title}</h3>
      <p className="text-sm text-slate-500 flex-grow mb-4">{tool.description}</p>
      <button 
        onClick={() => onSelectTool(tool.id)}
        className="mt-auto w-full bg-slate-100 text-slate-700 py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-slate-200"
      >
        Open Tool
      </button>
    </div>
  );
};

const MainContent: React.FC<MainContentProps> = ({ onSelectTool }) => {
  return (
    <main className="flex-1 p-6 md:p-10">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-wide mb-4">
          The Ultimate Online Toolkit
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 mb-8">
          Streamline your tasks with our powerful and easy-to-use collection of PDF, image, and utility tools. Designed for maximum productivity.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-blue-600 shadow-md hover:shadow-lg">
            Get Started
          </button>
          <button className="bg-slate-200 text-slate-800 py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-slate-300">
            Learn More
          </button>
        </div>
      </section>

      {/* Tools Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} onSelectTool={onSelectTool} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default MainContent;