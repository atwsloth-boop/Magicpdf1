
import React from 'react';
import { TOOLS } from '../constants';
import { Tool } from '../types';

interface MainContentProps {
  onSelectTool: (toolId: string) => void;
}

const ToolCard: React.FC<{ tool: Tool; onSelectTool: (toolId: string) => void }> = ({ tool, onSelectTool }) => {
  return (
    <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 group">
      <div className="mb-4 text-cyan-400 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
        <tool.icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-bold text-gray-100 mb-2">{tool.title}</h3>
      <p className="text-sm text-gray-400 flex-grow mb-4">{tool.description}</p>
      <button 
        onClick={() => onSelectTool(tool.id)}
        className="mt-auto w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:bg-cyan-500/20 hover:border-cyan-400"
      >
        Launch Tool
      </button>
    </div>
  );
};

const MainContent: React.FC<MainContentProps> = ({ onSelectTool }) => {
  return (
    <main className="flex-1 p-6 md:p-10">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-100 uppercase tracking-wider mb-4 glow-text" style={{'--glow-color': 'rgba(0, 255, 255, 0.7)'} as React.CSSProperties}>
          Magic PDF Toolkit
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-400 mb-8">
          Effortlessly manage your documents. A complete suite of powerful, easy-to-use PDF tools right at your fingertips.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-cyan-500 text-gray-900 py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30">
            Explore Tools
          </button>
          <button className="bg-gray-700 text-gray-200 py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:bg-gray-600">
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