// LoginPage.jsx - Updated with Auth Context Integration
import { useState, useContext } from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Eye, EyeOff, Loader } from 'lucide-react';
import { login } from '../service/userAPI';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';


// Enhanced FormInput component
const FormInput = ({
                       label,
                       type,
                       id,
                       value,
                       onChange,
                       isLoading,
                       showPassword,
                       onTogglePassword
                   }) => {
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-foreground">
                {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-primary/30"
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    required
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
                        disabled={isLoading}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function LoginPage() {
    const { theme, setTheme } = useTheme();
    const { login: authLogin } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login(formData.email, formData.password);
            const userData = response.data;

            if (!userData?.role) {
                throw new Error('Invalid user data received');
            }

            // Use auth context login instead of direct sessionStorage
            authLogin(userData);

            // Navigation will be handled automatically by PublicRoute

        } catch (error) {
            setError('Invalid email or password.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const ThemeToggle = () => (
        <div className="absolute top-6 right-6 z-10">
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>
            </div>

            <ThemeToggle />

            <div className="w-full max-w-md mx-4 relative z-10">
                {/* Main card with glass morphism effect */}
                <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl shadow-2xl p-8 space-y-8">
                    {/* Header with logo placeholder */}
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <div className="w-8 h-8 bg-primary rounded-lg shadow-sm"></div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h1>
                            <p className="text-muted-foreground text-sm">Please sign in to continue to your account</p>
                        </div>
                    </div>

                    {/* Error message with enhanced styling */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Email Address"
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            isLoading={isLoading}
                        />

                        <FormInput
                            label="Password"
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            isLoading={isLoading}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                        />

                        {/* Enhanced submit button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card shadow-lg hover:shadow-xl hover:bg-primary/90 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <div className="w-1.5 h-1.5 bg-primary-foreground/60 rounded-full"></div>
                                </>
                            )}
                        </button>
                    </form>
                    <div className="text-center pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                {/*    /!* Footer *!/*/}
                {/*    <div className="text-center pt-4 border-t border-border/50">*/}
                {/*        <p className="text-xs text-muted-foreground">*/}
                {/*            Secure login powered by advanced encryption*/}
                {/*        </p>*/}
                {/*    </div>*/}
                </div>

                {/* Floating elements for visual interest */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full blur-sm"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-secondary/20 rounded-full blur-sm"></div>
            </div>
        </div>
    );
}