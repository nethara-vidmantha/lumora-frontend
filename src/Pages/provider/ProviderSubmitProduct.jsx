import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";
import { useAuth } from "../../context/AuthContext";
import {
    FiUploadCloud,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiHelpCircle,
    FiImage
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HANDICRAFT_SUBCATEGORIES = [
    "Wooden Crafts",
    "Pottery and Ceramics",
    "Handmade Jewelry",
    "Traditional Masks",
    "Batik Products",
    "Handloom Textiles",
    "Woven Products",
    "Decorative Crafts",
    "Leather Crafts",
    "Traditional Sri Lankan Crafts",
    "Other Handmade Products"
];

const FINE_ART_SUBCATEGORIES = [
    "Paintings",
    "Drawings",
    "Sculptures",
    "Prints"
];

const FINE_ART_MEDIUMS = [
    "Oil Paint",
    "Acrylic",
    "Watercolor",
    "Mixed Media",
    "Charcoal",
    "Ink & Pen",
    "Pastel",
    "Bronze / Metal Cast",
    "Clay / Terracotta",
    "Wood Carving"
];

const FINE_ART_SURFACES = [
    "Stretched Canvas",
    "Canvas Board",
    "Handmade Traditional Paper",
    "Silk Cloth",
    "Wood Panel",
    "Archival Cotton Paper",
    "Stone / Plaster"
];

export default function ProviderSubmitProduct({ initialData = null, isEditMode = false, onComplete = null }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Classification
    const [mainCategory, setMainCategory] = useState(initialData?.mainCategory || "Handicrafts");
    const [subcategory, setSubcategory] = useState(
        initialData?.subcategory || (initialData?.mainCategory === "Fine Arts" ? "Paintings" : "Wooden Crafts")
    );

    // Basic Product Info
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price || "");
    const [labelPrice, setLabelPrice] = useState(initialData?.labelPrice || "");
    const [stock, setStock] = useState(initialData?.stock !== undefined ? initialData.stock : 1);

    // Images
    const [existingImages, setExistingImages] = useState(initialData?.images || []);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Physical & Craft Specs (Handicrafts)
    const [productionTechnique, setProductionTechnique] = useState(initialData?.productionTechnique || "");
    const [materials, setMaterials] = useState(initialData?.materials?.join(", ") || "");
    const [originLocation, setOriginLocation] = useState(initialData?.originLocation || user?.providerProfile?.city || "Sri Lanka");
    const [length, setLength] = useState(initialData?.dimensions?.length || "");
    const [width, setWidth] = useState(initialData?.dimensions?.width || "");
    const [height, setHeight] = useState(initialData?.dimensions?.height || "");
    const [weight, setWeight] = useState(initialData?.weight?.value || "");

    // Fine Arts Specifics
    const [artistName, setArtistName] = useState(initialData?.artistName || user?.fullName || "");
    const [artworkTitle, setArtworkTitle] = useState(initialData?.artworkTitle || "");
    const [medium, setMedium] = useState(initialData?.medium || "Oil Paint");
    const [surface, setSurface] = useState(initialData?.surface || "Stretched Canvas");
    const [yearCreated, setYearCreated] = useState(initialData?.yearCreated || new Date().getFullYear());
    const [isOriginal, setIsOriginal] = useState(initialData?.isOriginal !== undefined ? initialData.isOriginal : true);
    const [editionInfo, setEditionInfo] = useState(initialData?.editionInfo || "1/1 Original");
    const [isFramed, setIsFramed] = useState(initialData?.isFramed || false);
    const [hasCertificateOfAuthenticity, setHasCertificateOfAuthenticity] = useState(
        initialData?.hasCertificateOfAuthenticity || false
    );

    // Switch main category handler
    function handleMainCategoryChange(cat) {
        setMainCategory(cat);
        if (cat === "Fine Arts") {
            setSubcategory("Paintings");
        } else {
            setSubcategory("Wooden Crafts");
        }
    }

    // Handle image file selection
    function handleImageSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setNewImageFiles((prev) => [...prev, ...files]);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    }

    function removeExistingImage(index) {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }

    function removeNewImage(index) {
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(asDraft = false) {
        if (!name.trim() || !description.trim() || !price || !subcategory) {
            toast.error("Please fill in all mandatory product information.");
            return;
        }

        if (Number(price) <= 0) {
            toast.error("Price must be greater than zero.");
            return;
        }

        const totalImagesCount = existingImages.length + newImageFiles.length;
        if (totalImagesCount === 0) {
            toast.error("Please upload at least one image of your creation.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload new images to Supabase
            let uploadedUrls = [];
            if (newImageFiles.length > 0) {
                toast.loading("Uploading images to secure storage...", { id: "uploading-images" });
                const uploadPromises = newImageFiles.map((file) => mediaUpload(file));
                uploadedUrls = await Promise.all(uploadPromises);
                toast.dismiss("uploading-images");
            }

            const allImages = [...existingImages, ...uploadedUrls];

            const parsedMaterials = materials
                ? materials.split(",").map((m) => m.trim()).filter(Boolean)
                : [];

            const payload = {
                name: name.trim(),
                description: description.trim(),
                mainCategory,
                subcategory,
                price: Number(price),
                labelPrice: Number(labelPrice) || Number(price),
                stock: Number(stock) || 0,
                images: allImages,
                status: asDraft ? "draft" : "pending_review",
                dimensions: {
                    length: Number(length) || 0,
                    width: Number(width) || 0,
                    height: Number(height) || 0,
                    unit: "cm"
                },
                weight: {
                    value: Number(weight) || 0,
                    unit: "g"
                },
                materials: parsedMaterials,
                productionTechnique: productionTechnique.trim(),
                originLocation: originLocation.trim()
            };

            // Include Fine Arts fields if applicable
            if (mainCategory === "Fine Arts") {
                payload.artistName = artistName.trim() || user?.fullName;
                payload.artworkTitle = artworkTitle.trim() || name.trim();
                payload.medium = medium;
                payload.surface = surface;
                payload.yearCreated = Number(yearCreated) || new Date().getFullYear();
                payload.isOriginal = Boolean(isOriginal);
                payload.editionInfo = isOriginal ? "1/1 Original" : editionInfo.trim();
                payload.isFramed = Boolean(isFramed);
                payload.hasCertificateOfAuthenticity = Boolean(hasCertificateOfAuthenticity);
            }

            const token = localStorage.getItem("token");

            if (isEditMode && initialData?.productId) {
                // Resubmission endpoint
                await axios.put(
                    `${API_BASE_URL}/api/products/provider/resubmit/${initialData.productId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Product corrected and resubmitted for admin review!");
            } else {
                // New submission
                await axios.post(`${API_BASE_URL}/api/products/submit`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(
                    asDraft
                        ? "Product saved to your drafts."
                        : "Product submitted successfully! It is now pending administrator review."
                );
            }

            if (onComplete) {
                onComplete();
            } else {
                navigate("/provider/products");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.response?.data?.message || "Failed to submit product.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-secondaryaccent/15 text-secondaryaccent text-xs font-bold uppercase tracking-wider mb-2">
                    {isEditMode ? "Revision & Resubmission" : "Artisan Creation Submission"}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-darktext">
                    {isEditMode ? `Update Submission: ${name}` : "Submit New Product for Admin Review"}
                </h1>
                <p className="text-sm text-darktext/60 mt-1 max-w-3xl leading-relaxed">
                    Submit your handcrafted item or fine art masterpiece. Products undergo verification by Lumora curators before being published to the live marketplace.
                </p>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-3xl border border-secondary shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
                {/* 1. Category Selector */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-darktext/60 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primaryaccent text-lighttext text-xs flex items-center justify-center font-mono">
                            1
                        </span>
                        Product Category Classification
                    </h2>

                    {/* Main Category Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => handleMainCategoryChange("Handicrafts")}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                mainCategory === "Handicrafts"
                                    ? "border-primaryaccent bg-primaryaccent/10 shadow-sm"
                                    : "border-secondary hover:border-primaryaccent/40 bg-primary/20"
                            }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider block text-primaryaccent mb-1">
                                Collection 01
                            </span>
                            <p className="font-bold text-darktext text-base">Sri Lankan Handicrafts</p>
                            <p className="text-xs text-darktext/60 mt-1">
                                Wooden crafts, pottery, batik, masks, handloom textiles, jewelry, and brass.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMainCategoryChange("Fine Arts")}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                mainCategory === "Fine Arts"
                                    ? "border-primaryaccent bg-primaryaccent/10 shadow-sm"
                                    : "border-secondary hover:border-primaryaccent/40 bg-primary/20"
                            }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider block text-primaryaccent mb-1">
                                Collection 02
                            </span>
                            <p className="font-bold text-darktext text-base">Fine Arts & Gallery</p>
                            <p className="text-xs text-darktext/60 mt-1">
                                Original paintings, drawings, fine art prints, sculptures, and canvas works.
                            </p>
                        </button>
                    </div>

                    {/* Subcategory Select */}
                    <div>
                        <label className="block text-xs font-semibold text-darktext mb-1.5">
                            Specific Subcategory *
                        </label>
                        <select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15"
                        >
                            {mainCategory === "Handicrafts"
                                ? HANDICRAFT_SUBCATEGORIES.map((sub) => (
                                      <option key={sub} value={sub}>
                                          {sub}
                                      </option>
                                  ))
                                : FINE_ART_SUBCATEGORIES.map((sub) => (
                                      <option key={sub} value={sub}>
                                          {sub}
                                      </option>
                                  ))}
                        </select>
                    </div>
                </div>

                <hr className="border-secondary/60" />

                {/* 2. Basic Information */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-darktext/60 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primaryaccent text-lighttext text-xs flex items-center justify-center font-mono">
                            2
                        </span>
                        Product Details
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-darktext mb-1.5">
                                Product Title / Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Hand-Carved Teak Peacock Mask or Dawn Over Sigiriya Canvas"
                                className="w-full h-11 px-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-darktext mb-1.5">
                                Detailed Product Story & Description *
                            </label>
                            <textarea
                                rows="5"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the artisan technique, cultural inspiration, materials, and care instructions..."
                                className="w-full p-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent focus:ring-2 focus:ring-primaryaccent/15 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <hr className="border-secondary/60" />

                {/* 3. Dynamic Category Specifics */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-darktext/60 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primaryaccent text-lighttext text-xs flex items-center justify-center font-mono">
                            3
                        </span>
                        {mainCategory === "Fine Arts" ? "Fine Art Artwork Specifications" : "Handicraft Craft Specifications"}
                    </h2>

                    {mainCategory === "Fine Arts" ? (
                        /* FINE ARTS FIELDS */
                        <div className="space-y-4 bg-primary/20 p-5 rounded-2xl border border-secondary">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Artist Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={artistName}
                                        onChange={(e) => setArtistName(e.target.value)}
                                        placeholder="Artist's Name or Signature"
                                        className="w-full h-11 px-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Artwork Title
                                    </label>
                                    <input
                                        type="text"
                                        value={artworkTitle}
                                        onChange={(e) => setArtworkTitle(e.target.value)}
                                        placeholder="Specific Artwork Title"
                                        className="w-full h-11 px-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Art Medium *
                                    </label>
                                    <select
                                        value={medium}
                                        onChange={(e) => setMedium(e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    >
                                        {FINE_ART_MEDIUMS.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Surface / Material *
                                    </label>
                                    <select
                                        value={surface}
                                        onChange={(e) => setSurface(e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    >
                                        {FINE_ART_SURFACES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Year Created
                                    </label>
                                    <input
                                        type="number"
                                        value={yearCreated}
                                        onChange={(e) => setYearCreated(e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isOriginalCheckbox"
                                        checked={isOriginal}
                                        onChange={(e) => setIsOriginal(e.target.checked)}
                                        className="w-4 h-4 text-primaryaccent rounded accent-primaryaccent"
                                    />
                                    <label htmlFor="isOriginalCheckbox" className="text-xs font-semibold text-darktext">
                                        Original One-of-a-Kind Work
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isFramedCheckbox"
                                        checked={isFramed}
                                        onChange={(e) => setIsFramed(e.target.checked)}
                                        className="w-4 h-4 text-primaryaccent rounded accent-primaryaccent"
                                    />
                                    <label htmlFor="isFramedCheckbox" className="text-xs font-semibold text-darktext">
                                        Includes Premium Frame
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="certAuthCheckbox"
                                        checked={hasCertificateOfAuthenticity}
                                        onChange={(e) => setHasCertificateOfAuthenticity(e.target.checked)}
                                        className="w-4 h-4 text-primaryaccent rounded accent-primaryaccent"
                                    />
                                    <label htmlFor="certAuthCheckbox" className="text-xs font-semibold text-darktext">
                                        Certificate of Authenticity
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* HANDICRAFT FIELDS */
                        <div className="space-y-4 bg-primary/20 p-5 rounded-2xl border border-secondary">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Production Technique
                                    </label>
                                    <input
                                        type="text"
                                        value={productionTechnique}
                                        onChange={(e) => setProductionTechnique(e.target.value)}
                                        placeholder="e.g. Hand-carved, Handloom woven, Wheel thrown"
                                        className="w-full h-11 px-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Materials Used (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={materials}
                                        onChange={(e) => setMaterials(e.target.value)}
                                        placeholder="e.g. Teak Wood, Brass, Natural Dyes, Clay"
                                        className="w-full h-11 px-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Length (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={length}
                                        onChange={(e) => setLength(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Width (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-darktext mb-1.5">
                                        Weight (grams)
                                    </label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="500"
                                        className="w-full h-11 px-3 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-darktext mb-1.5">
                                    Craft Heritage Origin Location
                                </label>
                                <input
                                    type="text"
                                    value={originLocation}
                                    onChange={(e) => setOriginLocation(e.target.value)}
                                    placeholder="e.g. Ambalangoda, Kandy, Pilimathalawa"
                                    className="w-full h-11 px-4 rounded-xl border border-secondary bg-white text-darktext text-sm outline-none focus:border-primaryaccent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-secondary/60" />

                {/* 4. Pricing & Initial Inventory */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-darktext/60 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primaryaccent text-lighttext text-xs flex items-center justify-center font-mono">
                            4
                        </span>
                        Pricing & Initial Inventory
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-darktext mb-1.5">
                                Selling Price (LKR) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="50"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="e.g. 8500"
                                className="w-full h-11 px-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-darktext mb-1.5">
                                Label Price / MSRP (LKR)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="50"
                                value={labelPrice}
                                onChange={(e) => setLabelPrice(e.target.value)}
                                placeholder="e.g. 10000"
                                className="w-full h-11 px-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent"
                            />
                            <span className="text-[10px] text-darktext/50">Higher value shows a discount badge.</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-darktext mb-1.5">
                                Available Initial Stock (Units) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="1"
                                className="w-full h-11 px-4 rounded-xl border border-secondary bg-primary/40 text-darktext text-sm outline-none focus:border-primaryaccent"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-secondary/60" />

                {/* 5. Product Images Upload */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-darktext/60 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primaryaccent text-lighttext text-xs flex items-center justify-center font-mono">
                            5
                        </span>
                        Product Photography & Artwork Imagery *
                    </h2>
                    <p className="text-xs text-darktext/60 mb-4">
                        Upload sharp, well-lit photos showing multiple angles and details of your creation.
                    </p>

                    {/* Image Previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                        {existingImages.map((url, idx) => (
                            <div
                                key={`exist-${idx}`}
                                className="relative aspect-square rounded-2xl overflow-hidden border border-secondary shadow-sm group"
                            >
                                <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(idx)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition shadow-md cursor-pointer"
                                >
                                    <FiX />
                                </button>
                                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    Saved
                                </span>
                            </div>
                        ))}

                        {previewUrls.map((url, idx) => (
                            <div
                                key={`new-${idx}`}
                                className="relative aspect-square rounded-2xl overflow-hidden border border-primaryaccent/40 shadow-sm group"
                            >
                                <img src={url} alt="Selected" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition shadow-md cursor-pointer"
                                >
                                    <FiX />
                                </button>
                                <span className="absolute bottom-2 left-2 bg-primaryaccent text-white text-[10px] px-2 py-0.5 rounded-full">
                                    New
                                </span>
                            </div>
                        ))}

                        {/* Upload trigger card */}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-secondary hover:border-primaryaccent/60 bg-primary/30 hover:bg-primary/50 flex flex-col items-center justify-center p-3 text-center transition cursor-pointer">
                            <FiUploadCloud className="text-2xl text-primaryaccent mb-1.5" />
                            <span className="text-xs font-semibold text-darktext">Add Images</span>
                            <span className="text-[10px] text-darktext/50">PNG, JPG up to 10MB</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Submission Actions */}
                <div className="pt-6 border-t border-secondary flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/provider/products")}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-secondary text-darktext font-medium text-xs hover:bg-secondary cursor-pointer"
                    >
                        Cancel
                    </button>

                    {!isEditMode && (
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSubmit(true)}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-secondary bg-secondary/50 text-darktext font-semibold text-xs hover:bg-secondary transition disabled:opacity-60 cursor-pointer"
                        >
                            Save as Draft
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSubmit(false)}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primaryaccent to-[#b86a55] text-lighttext font-semibold text-xs shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                    >
                        {isSubmitting
                            ? "Submitting Creation..."
                            : isEditMode
                            ? "Resubmit for Administrator Review"
                            : "Submit for Administrator Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}
