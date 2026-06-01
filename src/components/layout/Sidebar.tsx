import { NavLink } from 'react-router-dom';
import { 
  Library, 
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Questions Manager', path: '/', icon: Library },
  { name: 'Rules & Categories', path: '/global-rules', icon: Settings }
];

export function Sidebar() {
  return (
    <div className="w-64 bg-surface border-r border-borderMain h-screen flex flex-col">
      <div className="p-6 border-b border-borderMain">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AeroMind
        </h1>
        <p className="text-xs text-textMuted mt-1">Knowledge Editor</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
