
import React, { useState } from 'react';
import { Tool, ToolCategory } from '../types';
import { TOOLS } from '../constants';
import { ChevronDownIcon, CloseIcon } from './icons/UIIcons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectTool: (toolId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onSelectTool }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [ToolCategory.PDF]: true,
    [ToolCategory.IMAGE]: true,
    [ToolCategory.TEXT]: true,
    [ToolCategory.UTILITY]: true,
  });

  const toggleCategory = (category: ToolCategory) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toolsByCategory = TOOLS.reduce((acc, tool) => {
    const { category } = tool;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  const toolCategories = Object.keys(toolsByCategory) as ToolCategory[];


  const sidebarContent = (
    <nav className="flex-1 px-4 py-6 space-y-4">
      {toolCategories.map(category => (
        <div key={category}>
          <button 
            onClick={() => toggleCategory(category)}
            className="w-full flex justify-between items-center text-left text-lg font-semibold text-cyan-400 mb-2 focus:outline-none"
          >
            {category}
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openCategories[category] ? 'rotate-180' : ''}`} />
          </button>
          {openCategories[category] && (
            <div className="pl-4 border-l-2 border-gray-700 space-y-1">
              {toolsByCategory[category].map(tool => (
                <a
                  key={tool.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }}
                  className="flex items-center p-2 text-sm text-gray-400 rounded-md hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200 group"
                >
                  <tool.icon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  <span className="group-hover:translate-x-1 transition-transform">{tool.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onToggle}></div>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end p-2">
               <button onClick={onToggle} className="p-2 text-gray-400 hover:text-white">
                   <CloseIcon className="w-6 h-6" />
               </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
              {sidebarContent}
          </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-gray-900 border-r border-cyan-500/20">
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
