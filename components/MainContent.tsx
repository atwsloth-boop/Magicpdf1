
import React from 'react';
import { TOOLS } from '../constants';
import { Tool, ToolCategory } from '../types';

// Helper to generate a slug for anchor links
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  return (
    <a 
      href={`#/tool/${tool.id}`}
      className="block bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group h-full flex flex-col"
    >
      <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-600 w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <tool.icon className="h-8 w-8" />
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-grow">{tool.description}</p>
      
      <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
        Open Tool <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </a>
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
    <main className="flex-1 px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
           Every tool you need to work with PDFs in one place
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          MagicPDF is your all-in-one online toolkit. Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
        </p>
        <div className="flex justify-center gap-4">
            <a href={`#${toSlug(toolCategories[0])}`} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition-colors">
                Start using MagicPDF
            </a>
        </div>
      </section>

      {/* Tools Grid by Category */}
      {toolCategories.map(category => (
        <section key={category} id={toSlug(category)} className="mb-16 scroll-mt-24">
          <div className="flex items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {category}
              </h2>
              <div className="ml-4 h-px bg-gray-200 flex-grow"></div>
          </div>
          
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
