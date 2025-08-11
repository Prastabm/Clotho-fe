// src/components/ui/stat-card.jsx
import { Loader } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, className, loading, onClick }) {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            // Placeholder navigation - replace with your routing logic
            console.log(`Navigating to ${title} details page...`);
            // Example: navigate(`/dashboard/${title.toLowerCase().replace(/\s+/g, '-')}`);
        }
    };

    return (
        <div
            className={`group relative rounded-xl border border-border p-6 shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden ${className}`}
            onClick={handleClick}
        >
            {/* Animated gradient border overlay */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 animate-pulse"></div>
                <div className="absolute inset-[1px] rounded-xl bg-card"></div>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out transform skew-x-12"></div>
            </div>

            {/* Card content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground tracking-tight group-hover:text-foreground transition-colors duration-200">
                        {title}
                    </h3>
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-200">
                        <Icon className="h-4 w-4 text-primary group-hover:text-emerald-600 transition-colors duration-200" />
                    </div>
                </div>
                <div className="space-y-1">
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                    ) : (
                        <div className="text-2xl font-bold text-foreground group-hover:text-emerald-700 transition-colors duration-200">
                            {typeof value === 'number' ? value.toLocaleString() : value || 0}
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"></div>
        </div>
    );
}