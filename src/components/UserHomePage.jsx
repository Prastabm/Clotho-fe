import React, { useEffect, useState, useCallback } from 'react';
import { getAllProducts } from '../service/productAPI';
import { Search, Package, Eye, ShoppingCart, Image } from 'lucide-react';
import {addToCart} from "@/service/cartAPI.js";

const UserHomePage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

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

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product.skuCode, product.category,1, product.price);
            console.log(`Added "${product.name}" to cart successfully.`);
            // Optionally show a success toast here
        } catch (error) {
            console.error(`Failed to add "${product.name}" to cart:`, error.message);
            // Optionally show an error toast here
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto px-8 py-8 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Browse Products</h2>
                <p className="text-muted-foreground">View and shop from available products</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative bg-card border border-border rounded-lg p-6 hover:shadow transition-all duration-200">
                        {/* Product Image */}
                        <div className="relative w-full h-48 mb-4 bg-muted rounded-md overflow-hidden">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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
                            <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">SKU: {product.skuCode}</span>
                                <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setSelectedProduct(product);
                                    setShowViewModal(true);
                                }}
                                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </button>
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No products found</h3>
                    <p className="text-slate-500">Try adjusting your search or check back later.</p>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
                    <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-xl font-semibold text-foreground">Product Details</h3>
                            <button onClick={() => setShowViewModal(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {selectedProduct.imageUrl && (
                                <div className="w-full h-64 bg-muted rounded-xl overflow-hidden">
                                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserHomePage;
