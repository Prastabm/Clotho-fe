// AdminNavbar.jsx - Updated with proper context integration
import { useContext } from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, LogOut } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function AdminNavbar({ onLogout, userId }) {
    const { theme, setTheme } = useTheme();
    const { user } = useContext(AuthContext);

    return (
        <nav className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Company Logo/Title */}
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-primary">
                            Clotho
                        </h1>
                        {user && (
                            <div className="hidden md:block">
                                <span className="text-sm text-muted-foreground">
                                    Welcome, {user.name || user.email}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-xl bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun size={18} className="text-foreground" />
                            ) : (
                                <Moon size={18} className="text-foreground" />
                            )}
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}