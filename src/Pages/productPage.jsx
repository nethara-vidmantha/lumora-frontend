import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/productCard";
import { Loader } from "../components/loader";
import {
    FiSearch,
    FiFilter,
    FiX,
    FiChevronDown,
    FiSliders,
    FiGrid,
    FiRefreshCw,
    FiTag
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function ProductPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [products, setProducts] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [facets, setFacets] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filters from searchParams or defaults
    const mainCategory = searchParams.get("mainCategory") || "all";
    const selectedSubcategory = searchParams.get("subcategory") || "";
    const searchQuery = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const minPriceParam = searchParams.get("minPrice") || "";
    const maxPriceParam = searchParams.get("maxPrice") || "";
    const inStockOnly = searchParams.get("inStock") === "true";

    // Local filter state for inputs before submission
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
    const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

    // Fetch categories and facets once on mount
    useEffect(() => {
        async function fetchMetadata() {
            try {
                const [catRes, facetRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/categories?includeCounts=true`),
                    axios.get(`${API_BASE_URL}/api/categories/facets`)
                ]);
                if (catRes.data.categories) {
                    setCategoriesData(catRes.data.categories);
                }
                if (facetRes.data) {
                    setFacets(facetRes.data);
                }
            } catch (err) {
                console.error("Failed to load catalog metadata:", err);
            }
        }
        fetchMetadata();
    }, []);

    // Fetch products whenever search params change
    useEffect(() => {
        let isMounted = true;
        async function fetchProducts() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (mainCategory && mainCategory !== "all") params.append("mainCategory", mainCategory);
                if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
                if (searchQuery) params.append("search", searchQuery);
                if (minPriceParam) params.append("minPrice", minPriceParam);
                if (maxPriceParam) params.append("maxPrice", maxPriceParam);
                if (inStockOnly) params.append("inStock", "true");
                if (sort) params.append("sort", sort);

                const res = await axios.get(`${API_BASE_URL}/api/products?${params.toString()}`);
                if (isMounted) {
                    if (res.data.products) {
                        setProducts(res.data.products);
                    } else if (Array.isArray(res.data)) {
                        setProducts(res.data);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                if (isMounted) toast.error("Failed to load creations.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchProducts();
        return () => {
            isMounted = false;
        };
    }, [mainCategory, selectedSubcategory, searchQuery, sort, minPriceParam, maxPriceParam, inStockOnly]);

    // Update query params helper
    function updateParams(newParams) {
        const current = Object.fromEntries(searchParams.entries());
        const merged = { ...current, ...newParams };

        // Clean out empty keys
        Object.keys(merged).forEach((k) => {
            if (!merged[k] || merged[k] === "all") delete merged[k];
        });

        setSearchParams(merged);
    }

    // Handlers
    function handleMainCategoryChange(val) {
        updateParams({ mainCategory: val, subcategory: "" });
    }

    function handleSubcategoryToggle(subName) {
        if (selectedSubcategory === subName) {
            updateParams({ subcategory: "" });
        } else {
            updateParams({ subcategory: subName });
        }
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        updateParams({ search: searchInput.trim() });
    }

    function handlePriceApply(e) {
        e.preventDefault();
        updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput });
    }

    function handleClearAllFilters() {
        setSearchInput("");
        setMinPriceInput("");
        setMaxPriceInput("");
        setSearchParams({});
    }

    // Filter categories displayed based on selected main category
    const relevantCategories = useMemo(() => {
        if (!mainCategory || mainCategory === "all") return categoriesData;
        return categoriesData.filter((c) => c.mainCategory === mainCategory);
    }, [categoriesData, mainCategory]);

    const activeFilterCount = [
        mainCategory !== "all" && mainCategory,
        selectedSubcategory,
        searchQuery,
        minPriceParam,
        maxPriceParam,
        inStockOnly
    ].filter(Boolean).length;

    return (
        <div className="w-full min-h-screen bg-primary pb-16">
            {/* Top Discovery Banner */}
            <div className="bg-[#242424] text-lighttext border-b border-secondary/20 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-primaryaccent font-bold uppercase tracking-widest mb-1.5">
                            <FiTag /> Sri Lankan Artisan Marketplace
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            {mainCategory === "Handicrafts"
                                ? "Authentic Sri Lankan Handicrafts"
                                : mainCategory === "Fine Arts"
                                ? "Fine Arts, Paintings & Sculptures"
                                : "Explore Masterpiece Creations"}
                        </h1>
                        <p className="text-xs sm:text-sm text-lighttext/70 mt-1 max-w-2xl">
                            Direct from verified island master craftsmen and independent fine artists. Verified authenticity and nationwide delivery.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search crafts, masks, art..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-lighttext placeholder:text-lighttext/40 text-sm focus:outline-none focus:ring-2 focus:ring-primaryaccent focus:bg-white/15 transition"
                        />
                        <FiSearch className="absolute left-3.5 top-3.5 text-lighttext/50 text-base" />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    updateParams({ search: "" });
                                }}
                                className="absolute right-3 top-3 text-lighttext/40 hover:text-lighttext cursor-pointer"
                            >
                                <FiX />
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Main Category Filter Tabs */}
            <div className="bg-secondary/40 border-b border-secondary/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleMainCategoryChange("all")}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                                mainCategory === "all"
                                    ? "bg-primaryaccent text-lighttext shadow-sm"
                                    : "text-darktext/70 hover:bg-secondary/70 hover:text-darktext"
                            }`}
                        >
                            All Creations
                        </button>
                        <button
                            onClick={() => handleMainCategoryChange("Handicrafts")}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                                mainCategory === "Handicrafts"
                                    ? "bg-primaryaccent text-lighttext shadow-sm"
                                    : "text-darktext/70 hover:bg-secondary/70 hover:text-darktext"
                            }`}
                        >
                            Sri Lankan Handicrafts
                        </button>
                        <button
                            onClick={() => handleMainCategoryChange("Fine Arts")}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                                mainCategory === "Fine Arts"
                                    ? "bg-primaryaccent text-lighttext shadow-sm"
                                    : "text-darktext/70 hover:bg-secondary/70 hover:text-darktext"
                            }`}
                        >
                            Fine Arts & Paintings
                        </button>
                    </div>

                    {/* Mobile filter toggle button */}
                    <button
                        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-darktext text-xs font-semibold shrink-0 ml-4 border border-secondaryaccent/30 cursor-pointer"
                    >
                        <FiSliders /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                </div>
            </div>

            {/* Catalog Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex items-start gap-8">
                    {/* Left Filter Sidebar (Desktop) */}
                    <aside
                        className={`
                            fixed inset-0 z-40 bg-darktext/60 backdrop-blur-sm lg:static lg:bg-transparent lg:z-auto lg:backdrop-blur-none
                            ${isMobileFilterOpen ? "flex" : "hidden lg:block"}
                        `}
                    >
                        <div className="w-[300px] h-full lg:h-auto overflow-y-auto bg-primary lg:bg-transparent p-6 lg:p-0 shadow-2xl lg:shadow-none flex flex-col gap-6 shrink-0 ml-auto lg:ml-0">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between lg:hidden border-b border-secondary pb-3">
                                <h3 className="font-bold text-darktext text-base flex items-center gap-2">
                                    <FiFilter /> Filter Catalog
                                </h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-1 text-darktext/60 hover:text-darktext cursor-pointer"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            {/* Active Filters Pill Bar */}
                            {activeFilterCount > 0 && (
                                <div className="p-4 rounded-2xl bg-secondary/60 border border-secondary/80">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-darktext">Active Filters</span>
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="text-[11px] text-primaryaccent font-semibold hover:underline cursor-pointer"
                                        >
                                            Reset All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedSubcategory && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primaryaccent/15 text-primaryaccent text-[11px] font-medium">
                                                {selectedSubcategory}
                                                <button onClick={() => updateParams({ subcategory: "" })}>
                                                    <FiX />
                                                </button>
                                            </span>
                                        )}
                                        {searchQuery && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primaryaccent/15 text-primaryaccent text-[11px] font-medium">
                                                "{searchQuery}"
                                                <button onClick={() => updateParams({ search: "" })}>
                                                    <FiX />
                                                </button>
                                            </span>
                                        )}
                                        {(minPriceParam || maxPriceParam) && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primaryaccent/15 text-primaryaccent text-[11px] font-medium">
                                                LKR {minPriceParam || 0} - {maxPriceParam || "Any"}
                                                <button onClick={() => updateParams({ minPrice: "", maxPrice: "" })}>
                                                    <FiX />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Subcategories Accordion / List */}
                            <div className="p-5 rounded-2xl bg-secondary/50 border border-secondary/60">
                                <h3 className="font-bold text-darktext text-xs uppercase tracking-wider mb-3">
                                    Categories & Crafts
                                </h3>

                                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                                    {relevantCategories.map((cat) => (
                                        <div key={cat._id || cat.slug} className="space-y-1.5">
                                            <span className="text-xs font-semibold text-secondaryaccent block">
                                                {cat.name}
                                            </span>
                                            <div className="pl-2 space-y-1">
                                                {cat.subcategories?.map((sub) => {
                                                    const isChecked = selectedSubcategory === sub.name;
                                                    return (
                                                        <button
                                                            key={sub.slug}
                                                            onClick={() => handleSubcategoryToggle(sub.name)}
                                                            className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                                                isChecked
                                                                    ? "bg-primaryaccent text-lighttext font-semibold shadow-xs"
                                                                    : "text-darktext/75 hover:bg-secondary hover:text-darktext"
                                                            }`}
                                                        >
                                                            <span className="truncate">{sub.name}</span>
                                                            {sub.productCount !== undefined && (
                                                                <span
                                                                    className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full ${
                                                                        isChecked
                                                                            ? "bg-white/20 text-lighttext"
                                                                            : "bg-darktext/10 text-darktext/60"
                                                                    }`}
                                                                >
                                                                    {sub.productCount}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="p-5 rounded-2xl bg-secondary/50 border border-secondary/60">
                                <h3 className="font-bold text-darktext text-xs uppercase tracking-wider mb-3">
                                    Price Range (LKR)
                                </h3>
                                <form onSubmit={handlePriceApply} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPriceInput}
                                            onChange={(e) => setMinPriceInput(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                        <span className="text-darktext/40 text-xs">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPriceInput}
                                            onChange={(e) => setMaxPriceInput(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-secondary text-xs text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 rounded-xl bg-primaryaccent text-lighttext text-xs font-semibold hover:bg-[#b86a55] transition cursor-pointer"
                                    >
                                        Apply Price
                                    </button>
                                </form>
                            </div>

                            {/* In Stock Only Checkbox */}
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-secondary/60 flex items-center justify-between">
                                <span className="text-xs font-semibold text-darktext">In Stock Only</span>
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : "" })}
                                    className="w-4 h-4 rounded text-primaryaccent focus:ring-primaryaccent cursor-pointer"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Right Product Grid Area */}
                    <div className="flex-1 min-w-0">
                        {/* Control Bar: Count + Sorting */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-secondary/40">
                            <p className="text-xs sm:text-sm text-darktext/70">
                                Showing{" "}
                                <strong className="text-darktext font-bold">{products.length}</strong> creations
                                {mainCategory !== "all" && ` in ${mainCategory}`}
                                {selectedSubcategory && ` → ${selectedSubcategory}`}
                            </p>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-darktext/60 font-medium">Sort by:</label>
                                <select
                                    value={sort}
                                    onChange={(e) => updateParams({ sort: e.target.value })}
                                    className="px-3 py-1.5 rounded-xl bg-secondary/80 border border-secondary text-xs font-medium text-darktext focus:outline-none focus:ring-1 focus:ring-primaryaccent cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Cards Grid */}
                        {isLoading ? (
                            <div className="min-h-[400px] flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="min-h-[350px] rounded-2xl border-2 border-dashed border-secondary flex flex-col items-center justify-center p-8 text-center bg-secondary/15">
                                <FiTag className="text-4xl text-darktext/30 mb-3" />
                                <h3 className="text-lg font-bold text-darktext">No creations match your search</h3>
                                <p className="text-xs sm:text-sm text-darktext/60 max-w-md mt-1 mb-6">
                                    Try adjusting your category, removing price constraints, or clearing filters to view other Sri Lankan handicrafts.
                                </p>
                                <button
                                    onClick={handleClearAllFilters}
                                    className="px-5 py-2.5 rounded-xl bg-primaryaccent text-lighttext text-xs font-semibold hover:bg-[#b86a55] transition shadow-sm cursor-pointer"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.productId} className="flex justify-center">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
