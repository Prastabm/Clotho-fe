import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {getAllProducts, updateProduct} from '../service/productAPI';
import { Search, Plus, Edit, Trash2, Upload, Package, Eye, X, Save, Image } from 'lucide-react';
import { useTheme } from './ThemeProvider';


// Move FormInput outside of the component to prevent re-creation on every render
const FormInput = ({ label, name, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {type === 'textarea' ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
            />
        )}
    </div>
);

// Move Modal outside of the component to prevent re-creation on every render
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const ProductPage = () => {
    const { theme } = useTheme();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        skuCode: '',
        description: '',
        category: '',
        price: '',
        imageUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const products = await getAllProducts();
            setProducts(products);
            setFilteredProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Use useCallback to memoize the search handler
    const handleSearch = useCallback((event) => {
        const value = event.target.value.toLowerCase();
        setSearchInput(value);
        setFilteredProducts(
            products.filter((product) =>
                product.name.toLowerCase().includes(value) ||
                product.skuCode.toLowerCase().includes(value) ||
                (product.description && product.description.toLowerCase().includes(value)) ||
                (product.category && product.category.toLowerCase().includes(value)) ||
                product.price.toString().includes(value)
            )
        );
    }, [products]);

    // Use useCallback to memoize the input change handler
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            skuCode: '',
            description: '',
            category: '',
            price: '',
            imageUrl: ''
        });
        setSelectedFile(null);
        setImagePreview('');
    }, []);

    const handleCreate = async () => {
        try {
            setLoading(true);
            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const idToken = parsedUser?.idToken;

            const response = await axios.post('http://localhost:8080/products', formData, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            if (selectedFile && response.data.id) {
                await handleImageUpload(response.data.id);
            }

            await fetchProducts();
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating product:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            skuCode: product.skuCode,
            description: product.description || '',
            category: product.category || '',
            price: product.price.toString(),
            imageUrl: product.imageUrl || ''
        });
        setImagePreview(product.imageUrl || '');
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                skuCode: formData.skuCode,
            };

            // Call the updated updateProduct function with the new signature
            await updateProduct(
                selectedProduct.id, 
                productData,
                selectedFile  // Pass the file only if it exists
            );

            await fetchProducts();
            setShowEditModal(false);
            resetForm();
        } catch (error) {
            console.error('Error updating product:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (productId) => {
        if (!selectedFile) return;

        try {
            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const idToken = parsedUser?.idToken;

            const formDataForUpload = new FormData();
            formDataForUpload.append('file', selectedFile);

            await axios.post(`http://localhost:8080/products/upload/${productId}`, formDataForUpload, {
                headers: {
                    Authorization: `Bearer ${idToken}`,

                }
            });
        } catch (error) {
            console.error('Error uploading image:', error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            setLoading(true);
            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const idToken = parsedUser?.idToken;

            await axios.delete(`http://localhost:8080/products/${id}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
                <p className="text-muted-foreground">
                    Manage your product inventory with CRUD operations
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                    />
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group relative bg-card border border-border rounded-lg p-6 hover:shadow transition-all duration-200"
                    >
                        {/* Product Image */}
                        <div className="relative w-full h-48 mb-4 bg-muted rounded-md overflow-hidden">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
                                    {product.category || 'Uncategorized'}
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">
                                {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">SKU: {product.skuCode}</span>
                                <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setSelectedProduct(product);
                                    setShowViewModal(true);
                                }}
                                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </button>
                            <button
                                onClick={() => handleEdit(product)}
                                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 w-10 h-10"
                                title="Delete product"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No products found</h3>
                    <p className="text-slate-500">Try adjusting your search or add a new product</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Product"
            >
                <div className="space-y-4">
                    <FormInput
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        required
                    />
                    <FormInput
                        label="SKU Code"
                        name="skuCode"
                        value={formData.skuCode}
                        onChange={handleInputChange}
                        placeholder="Enter SKU code"
                        required
                    />
                    <FormInput
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Enter category"
                    />
                    <FormInput
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        required
                    />

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Product Image</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg cursor-pointer transition-colors"
                            >
                                <Upload size={16} />
                                <span>Choose Image</span>
                            </label>
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            <span>{loading ? 'Creating...' : 'Create Product'}</span>
                        </button>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Product"
            >
                <div className="space-y-4">
                    <FormInput
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        required
                    />
                    <FormInput
                        label="SKU Code"
                        name="skuCode"
                        value={formData.skuCode}
                        onChange={handleInputChange}
                        placeholder="Enter SKU code"
                        required
                    />
                    <FormInput
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Enter category"
                    />
                    <FormInput
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        required
                    />

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Product Image</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="image-upload-edit"
                            />
                            <label
                                htmlFor="image-upload-edit"
                                className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg cursor-pointer transition-colors"
                            >
                                <Upload size={16} />
                                <span>Change Image</span>
                            </label>
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            <span>{loading ? 'Updating...' : 'Update Product'}</span>
                        </button>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Product Details"
            >
                {selectedProduct && (
                    <div className="space-y-6">
                        {selectedProduct.imageUrl && (
                            <div className="w-full h-64 bg-muted rounded-xl overflow-hidden">
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                                <p className="text-foreground font-semibold">{selectedProduct.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">SKU Code</label>
                                <p className="text-foreground font-semibold">{selectedProduct.skuCode}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <p className="text-foreground font-semibold">{selectedProduct.category || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Price</label>
                                <p className="text-primary font-bold text-xl">₹{selectedProduct.price}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="text-foreground">{selectedProduct.description || 'No description available'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProductPage;