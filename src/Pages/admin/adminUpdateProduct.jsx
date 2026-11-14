import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate,} from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";


export default function UpdateProductPage() {


  const location = useLocation()
  const [productId, setProductId] = useState(location.state.productId)
  const [name, setName] = useState(location.state.name)
  const [altNames, setAltNames] = useState(location.state.altNames.join(","))
  const [description, setDescription] = useState(location.state.description)
  const [images, setImages] = useState([])
  const [price, setPrice] = useState(location.state.price)
  const [labelPrice, setLabelPrice] = useState(location.state.labelPrice)
  const [category, setCategory] = useState(location.state.category)
  const [stock, setStock] = useState(location.state.stock)
  const navigate=useNavigate()

  async function updateProduct(){
      const token=localStorage.getItem("token")

      if(token==null){
        navigate("/login")
        return
      }

      const promiseArray=[]

      for(let i=0;i<images.length;i++){
        
        promiseArray[i]=mediaUpload(images[i])
      }

      try{
          let urls=await Promise.all(promiseArray)

          if(urls.length==0){
            urls=location.state.images
          }

          else{

          }


          const alternativeNames=altNames.split(",")

          const product={
            productId:productId,
            name:name,
            altNames:alternativeNames,
            description:description,
            images:urls,
            price:price,
            labelPrice:labelPrice,
            category:category,
            stock:stock
          }

          await axios.put(import.meta.env.VITE_API_URL+"/api/products/"+productId, product,{
            headers:{
              Authorization:"Bearer "+token
            }
          })
          
          toast.success("Product updated successfully")
          navigate("/admin/products")

          }catch(error){
              console.error("Update Product Error: ", error)

              toast.error(
                  error.response?.data?.message ||
                  error.message ||
                  "Error updating product"
              )
          }

      
  }
 
  return(
    <div className="
      min-h-full w-full
      bg-primary
      px-6 py-10
      flex justify-center
    ">

      {/* Main Form Card */}
      <div className="
        w-full max-w-4xl
        rounded-3xl
        border border-secondary
        bg-white
        shadow-[0_15px_45px_rgba(47,47,47,0.08)]
        overflow-hidden
      ">

        {/* Header */}
        <div className="
          relative
          overflow-hidden
          bg-secondary
          px-8 py-7
          border-b border-secondary
        ">

          {/* Decorative Circle */}
          <div className="
            absolute
            -right-10 -top-16
            h-40 w-40
            rounded-full
            bg-primaryaccent/20
          "></div>

          <div className="relative">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-primaryaccent
            ">
              Lumora Administration
            </p>

            <h1 className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-darktext
            ">
              Update Product
            </h1>

            <p className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-darktext/60
            ">
              Update an existing product in your Lumora collection.
              Provide the product details, images, pricing and stock information below.
            </p>

          </div>

        </div>


        {/* Form Content */}
        <div className="p-8">

          {/* Product Information */}
          <div className="mb-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-primaryaccent/10
                text-primaryaccent
                font-bold
              ">
                01
              </div>

              <div>
                <h2 className="text-lg font-semibold text-darktext">
                  Product Information
                </h2>

                <p className="text-xs text-darktext/50">
                  Basic information about your product
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Product ID */}
              <div>
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Product ID
                </label>

                <input
                  disabled 
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="e.g. LUM-001"
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4
                    text-sm text-darktext
                    outline-none
                    transition
                    placeholder:text-darktext/35
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                />
              </div>


              {/* Name */}
              <div>
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Product Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4
                    text-sm text-darktext
                    outline-none
                    transition
                    placeholder:text-darktext/35
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                />
              </div>


              {/* Alternative Names */}
              <div className="md:col-span-2">
                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Alternative Names
                </label>

                <input
                  value={altNames}
                  onChange={(e) => setAltNames(e.target.value)}
                  placeholder="Enter alternative names separated by commas"
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4
                    text-sm text-darktext
                    outline-none
                    transition
                    placeholder:text-darktext/35
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                />
              </div>


              {/* Description */}
              <div className="md:col-span-2">

                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your handcrafted product..."
                  rows="5"
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4 py-3
                    text-sm text-darktext
                    outline-none
                    transition
                    placeholder:text-darktext/35
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                />

              </div>

            </div>

          </div>


          {/* Images */}
          <div className="mb-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-secondaryaccent/15
                text-secondaryaccent
                font-bold
              ">
                02
              </div>

              <div>
                <h2 className="text-lg font-semibold text-darktext">
                  Product Images
                </h2>

                <p className="text-xs text-darktext/50">
                  Upload images of your product
                </p>
              </div>

            </div>


            {/* Image Upload Area */}

                          <label className="
                flex
                min-h-[150px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-2xl
                border-2 border-dashed
                border-primaryaccent/30
                bg-primaryaccent/5
                px-6 py-8
                text-center
                transition
                hover:border-primaryaccent
                hover:bg-primaryaccent/10
              ">

                <div className="
                  mb-3
                  flex h-14 w-14
                  items-center justify-center
                  rounded-2xl
                  bg-primaryaccent/15
                  text-2xl
                ">
                  📷
                </div>

                <p className="
                  text-sm
                  font-semibold
                  text-darktext
                ">
                  Choose product images
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-darktext/50
                ">
                  You can select multiple images
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  className="hidden"
                />

                {/* Selected Images */}
                {images.length > 0 && (
                  <div className="mt-5 w-full">

                    <p className="
                      mb-3
                      text-sm
                      font-semibold
                      text-primaryaccent
                    ">
                      {images.length} image{images.length > 1 ? "s" : ""} selected
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">

                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            border border-secondary
                            bg-white
                            px-3 py-2
                            text-xs
                            text-darktext
                          "
                        >
                          <span>🖼️</span>

                          <span className="max-w-[180px] truncate">
                            {image.name}
                          </span>
                        </div>
                      ))}

                    </div>

                  </div>
                )}

              </label>

              



            

          </div>


          {/* Pricing & Inventory */}
          <div className="mb-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-primaryaccent/10
                text-primaryaccent
                font-bold
              ">
                03
              </div>

              <div>
                <h2 className="text-lg font-semibold text-darktext">
                  Pricing & Inventory
                </h2>

                <p className="text-xs text-darktext/50">
                  Set product pricing and available stock
                </p>
              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* Price */}
              <div>

                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Selling Price
                </label>

                <div className="relative">

                  <span className="
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-sm font-semibold
                    text-primaryaccent
                  ">
                    Rs.
                  </span>

                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="
                      h-12 w-full
                      rounded-xl
                      border border-secondary
                      bg-primary
                      pl-9 pr-4
                      text-sm text-darktext
                      outline-none
                      transition
                      focus:border-primaryaccent
                      focus:ring-4
                      focus:ring-primaryaccent/10
                    "
                  />

                </div>

              </div>


              {/* Label Price */}
              <div>

                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Label Price
                </label>

                <div className="relative">

                  <span className="
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-sm font-semibold
                    text-secondaryaccent
                  ">
                    Rs.
                  </span>

                  <input
                    type="number"
                    value={labelPrice}
                    onChange={(e) => setLabelPrice(e.target.value)}
                    placeholder="0.00"
                    className="
                      h-12 w-full
                      rounded-xl
                      border border-secondary
                      bg-primary
                      pl-9 pr-4
                      text-sm text-darktext
                      outline-none
                      transition
                      focus:border-primaryaccent
                      focus:ring-4
                      focus:ring-primaryaccent/10
                    "
                  />

                </div>

              </div>


              {/* Stock */}
              <div>

                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4
                    text-sm text-darktext
                    outline-none
                    transition
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                />

              </div>


              {/* Category */}
              <div className="md:col-span-3">

                <label className="
                  mb-2 block
                  text-sm font-medium
                  text-darktext
                ">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-secondary
                    bg-primary
                    px-4
                    text-sm text-darktext
                    outline-none
                    transition
                    focus:border-primaryaccent
                    focus:ring-4
                    focus:ring-primaryaccent/10
                  "
                >

                <option value="handbags">Handbags</option>
                <option value="pot">Pot</option>
                <option value="DreamChates">DreamChates</option>
                <option value="Jewellery">Jewellery</option>
                <option value="Lamp">Table lamps</option>
                <option value="HomeDeco">Home Deco</option>

                </select>

              </div>

            </div>

          </div>


          {/* Bottom Actions */}
          <div className="
            flex
            flex-col-reverse
            gap-3
            border-t border-secondary
            pt-6
            sm:flex-row
            sm:justify-end
          ">

            <button onClick={()=>{navigate("/admin/products")}} className="
              flex
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              border border-secondary
              bg-primary
              px-7 py-3
              text-sm
              font-semibold
              text-darktext/70
              transition
              hover:border-primaryaccent/30
              hover:bg-secondary
              hover:text-darktext
            ">
              Cancel
            </button>


            <button onClick={updateProduct} className="
              flex
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              bg-primaryaccent
              px-8 py-3
              text-sm
              font-semibold
              text-lighttext
              shadow-[0_8px_20px_rgba(201,123,99,0.25)]
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#b96d57]
              hover:shadow-[0_12px_25px_rgba(201,123,99,0.30)]
              active:translate-y-0
            ">
              Submit Product
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
