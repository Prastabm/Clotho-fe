import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, Eye, EyeOff, Loader } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { addUser } from '../service/userAPI';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner'; // ✅ Import toast function directly from sonner

// FormInput component (same as in LoginPage)
const Form = ({
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

export default function Register() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    // ✅ Removed the destructuring of toast from Toaster

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await addUser({
                email: formData.email,
                password: formData.password
            });

            toast.success("Registration successful. Please login to continue."); // ✅ Use toast directly

            navigate('/');
        } catch (error) {
            setError(error.message || 'Registration failed');
            toast.error(error.message || 'Registration failed'); // ✅ Use toast directly
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
            {/* Toaster Integration ✅ */}
            <Toaster />

            {/* Background elements (same as LoginPage) */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Theme toggle */}
            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="w-full max-w-md mx-4 relative z-10">
                <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl shadow-2xl p-8 space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Create Account</h1>
                        <p className="text-muted-foreground text-sm">Sign up to get started</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Form
                            label="Email Address"
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            isLoading={isLoading}
                        />

                        <Form
                            label="Password"
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            isLoading={isLoading}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                        />

                        <Form
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            isLoading={isLoading}
                            showPassword={showConfirmPassword}
                            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        />

                        <button
                            type="submit"
                            className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card shadow-lg hover:shadow-xl hover:bg-primary/90 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}