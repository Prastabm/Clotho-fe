// src/components/AdminSidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Package,
    Users,
    MessageSquare,
    Box
} from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function AdminSidebar({ onCollapsedChange }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const handleCollapse = (collapsed) => {
        setIsCollapsed(collapsed);
        onCollapsedChange?.(collapsed);
    };

    const navigationItems = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard size={24} />,
            path: '/dashboard'
        },
        {
            title: 'Products',
            icon: <Package size={24} />,
            path: '/products'
        },
        {
            title: 'Inventory',
            icon: <Box size={24} />,
            path: '/inventory'
        },

        {
            title: 'Communication',
            icon: <MessageSquare size={24} />,
            path: '/communication'
        }
    ];

    return (
        <aside
            className={cn(
                "h-[calc(100vh-4rem)] mt-16 fixed left-0 top-0 z-40 bg-card border-r border-border transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => handleCollapse(!isCollapsed)}
                className="absolute -right-3 top-8 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                style={{ transform: 'translateX(6px)' }}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <nav className="p-4 mt-6">
                <ul className="space-y-3">
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                                    "hover:bg-secondary hover:text-secondary-foreground",
                                    location.pathname === item.path
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground",
                                    isCollapsed && "justify-center px-0 mx-2"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center",
                                    isCollapsed && "w-full"
                                )}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && <span className="font-medium">{item.title}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}