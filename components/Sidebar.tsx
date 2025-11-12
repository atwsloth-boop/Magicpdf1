
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

  const toolCategories = Object.values(ToolCategory);
  const toolsByCategory = toolCategories.reduce((acc, category) => {
    acc[category] = TOOLS.filter(tool => tool.category === category);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  const sidebarContent = (
    <nav className="flex-1 px-4 py-6 space-y-4">
      {toolCategories.map(category => (
        <div key={category}>
          <button 
            onClick={() => toggleCategory(category)}
            className="w-full flex justify-between items-center text-left text-lg font-semibold text-blue-600 mb-2 focus:outline-none"
          >
            {category}
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openCategories[category] ? 'rotate-180' : ''}`} />
          </button>
          {openCategories[category] && (
            <div className="pl-4 border-l-2 border-slate-200 space-y-1">
              {toolsByCategory[category].map(tool => (
                <a
                  key={tool.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }}
                  className="flex items-center p-2 text-sm text-slate-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                >
                  <tool.icon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
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
      <div className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onToggle}></div>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end p-2">
               <button onClick={onToggle} className="p-2 text-slate-500 hover:text-slate-800">
                   <CloseIcon className="w-6 h-6" />
               </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-4rem)]">
              {sidebarContent}
          </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;