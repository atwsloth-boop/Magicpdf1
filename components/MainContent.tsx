import React from 'react';
import { TOOLS } from '../constants';
import { Tool, ToolCategory } from '../types';

// Helper to generate a slug for anchor links
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/50 hover:-translate-y-2 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="mb-6 p-4 rounded-full bg-slate-800/50 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <tool.icon className="h-10 w-10" />
      </div>
      
      <h3 className="text-lg font-bold text-slate-100 mb-3 font-orbitron tracking-wide group-hover:text-cyan-400 transition-colors">{tool.title}</h3>
      <p className="text-sm text-slate-400 flex-grow mb-6 leading-relaxed">{tool.description}</p>
      
      <a 
        href={`#/tool/${tool.id}`}
        className="mt-auto w-full py-2.5 px-4 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300 
        bg-slate-800 text-cyan-400 border border-slate-700 
        hover:bg-cyan-500 hover:text-slate-900 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
      >
        Launch
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
    <main className="flex-1 p-6 md:p-10 pb-20">
      {/* Hero Section */}
      <section className="text-center mb-20 pt-10 relative">
        <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 uppercase tracking-widest mb-6 neon-glow font-orbitron animate-fade-in">
            Prompt Minds
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 font-light tracking-wide">
            Next-gen browser utilities. Secure, powerful, and lightning fast.
            </p>
            <div className="flex justify-center space-x-6">
            <a href={`#${toSlug(toolCategories[0])}`} className="bg-cyan-600 text-white py-3 px-10 rounded-full font-bold uppercase tracking-wider transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-1">
                Explore Hub
            </a>
            </div>
        </div>
      </section>

      {/* Tools Grid by Category */}
      {toolCategories.map(category => (
        <section key={category} id={toSlug(category)} className="mb-20 scroll-mt-28">
          <h2 className="text-3xl font-bold text-slate-200 mb-10 pl-4 border-l-4 border-cyan-500 font-orbitron tracking-wider">
            {category}
          </h2>
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