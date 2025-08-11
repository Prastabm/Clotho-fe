import { useContext, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, ShoppingCart, Home, User, LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserNavbar({ onLogout }) {
    const { theme, setTheme } = useTheme();
    const { user } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getInitial = (nameOrEmail) => nameOrEmail?.charAt(0)?.toUpperCase() || '?';

    return (
        <nav className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Left - Logo and brand */}
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-primary">Clotho</h1>
                        {user && (
                            <span className="hidden md:inline text-sm text-muted-foreground">
                                Welcome, {user.name || user.email}
                            </span>
                        )}
                    </div>

                    {/* Right - Desktop nav */}
                    <div className="hidden md:flex items-center space-x-4">

                        <Link
                            to="/"
                            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Home size={18} />
                            <span>Home</span>
                        </Link>

                        <Link
                            to="/cart"
                            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                        </Link>

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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="focus:outline-none rounded-full">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                                        <AvatarFallback>{getInitial(user?.name || user?.email)}</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 mt-2 space-y-2 p-2">
                                <DropdownMenuItem asChild>
                                    <Link to="/my-orders" className="flex items-center space-x-2 w-full">
                                        <User size={14} />
                                        <span>My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <LogOut size={16} />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-2 pb-4 space-y-2">
                        <Link
                            to="/"
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Home size={16} className="inline mr-2" /> Home
                        </Link>

                        <Link
                            to="/cart"
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <ShoppingCart size={16} className="inline mr-2" /> Cart
                        </Link>

                        <button
                            onClick={() => {
                                setTheme(theme === 'dark' ? 'light' : 'dark');
                                setIsMenuOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun size={16} className="inline mr-2" /> Light Mode
                                </>
                            ) : (
                                <>
                                    <Moon size={16} className="inline mr-2" /> Dark Mode
                                </>
                            )}
                        </button>

                        <Link
                            to="/my-orders"
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <User size={16} className="inline mr-2" /> My Orders
                        </Link>

                        <button
                            onClick={() => {
                                onLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <LogOut size={16} className="inline mr-2" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
