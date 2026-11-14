import axios from "axios"
import { useEffect, useState } from "react"
import { FaRegTrashCan } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { Link,useNavigate} from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { Loader } from "../../components/loader";



function ProductDeleteConfirm(props){
    const productId = props.productId
    const close = props.close
    const refresh = props.refresh

    function deleteProduct(){
        const token = localStorage.getItem("token")


        axios.delete(import.meta.env.VITE_API_URL + "/api/products/" + productId, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(
            (response)=>{
                console.log(response.data)  
                close()
                refresh()
                toast.success("Product deleted successfully")
            }
        ).catch(
            (error)=>{
                toast.error("Failed to delete product")
            }
        )
    }

    return <div className="fixed left-0 top-0 w-full h-screen bg-[#00000050] z-100 flex justify-center items-center">
        <div className="w-[500px] h-[200px] bg-primary relative flex flex-col justify-center items-center gap-[20px]">
            <button onClick={close} className="absolute right-[-40px] top-[-42px] w-[40px] h-[40px] bg-red-800 rounded-full text-amber-50 flex justify-center items-center font-bold border-red-700 hover:bg-red-400 hover:shadow-sm active:scale-95 transition-all duration-200">
                <IoClose/>
            </button>
            <p className="text-xl font-semibold text-center  leading-8 text-darktext">Are you sure you want to delete the product with Product ID : {productId} ?</p>
            <div className="flex gap-[40px]">
                <button  onClick={deleteProduct} className="w-[100px] p-[5px] text-white  hover:bg-primaryaccent/50 bg-primaryaccent ">Yes</button>
                <button onClick={close} className="w-[100px] p-[5px] text-white hover:bg-secondaryaccent/50 bg-secondaryaccent">No</button>
            </div>
        </div>

    </div>
}

export default function AdminProductPage(){

    const [products,setProduct]=useState([])
    const [isDeleteConfirmVisible,setIsDeleteConfirmVisible]=useState(false)
    const [productToDelete,setProductToDelete]=useState(null)
    const [isLoading,setIsLoading]=useState(true)

    const navigate = useNavigate()


    useEffect( ()=>{
        if(isLoading)
        {
            axios.get(import.meta.env.VITE_API_URL + "/api/products").then(
            (response)=>{
                console.log(response.data)
                setProduct(response.data)
                setIsLoading(false)
        })}
    } , [isLoading] )

    
    console.log(products)

    return(
        <div className="min-h-screen w-full bg-primary p-4 md:p-6 lg:p-8">

            {
                isDeleteConfirmVisible && <ProductDeleteConfirm refresh={() => setIsLoading(true)} productId={productToDelete} close={() => setIsDeleteConfirmVisible(false)}/>
            }

            <Link to="/admin/add-product" className="fixed right-[50px] bottom-[50px] text-5xl hover:text-primaryaccent">
                <CiCirclePlus/>
            </Link>
            
            {/* Main Card */}
            <div className="overflow-hidden rounded-2xl border border-secondary bg-white shadow-[0_10px_35px_rgba(47,47,47,0.08)]">

                {/* Header */}
                <div className="flex flex-col gap-1 border-b border-secondary bg-gradient-to-r from-secondary/60 to-primary px-6 py-5">
                    
                    <h1 className="text-2xl font-bold tracking-tight text-darktext">
                        Products
                    </h1>

                    <p className="text-sm text-darktext/60">
                        Manage your products and inventory
                    </p>

                </div>


                {/* Table */}
                <div className="w-full overflow-x-auto">

                   {isLoading? <Loader/> :
                        <table className="w-full min-w-[950px] text-center">

                        {/* Table Head */}
                        <thead>
                            <tr className="border-b-2 border-secondary bg-secondary/40">

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Image
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Product ID
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Product Name
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Product Price
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Label Price
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Stock
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Category
                                </th>

                                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-darktext/70">
                                    Actions
                                </th>

                            </tr>
                        </thead>


                        {/* Table Body */}
                        <tbody>

                            {
                                products.map(
                                    (item,index)=>{
                                        return(

                                            <tr 
                                                key={item.productId}
                                                className="
                                                    group
                                                    border-b border-secondary/60
                                                    transition-all duration-200
                                                    hover:bg-primary/60
                                                "
                                            >

                                                {/* Image */}
                                                <td className="px-5 py-4">

                                                    <div className="flex justify-center">

                                                        <div className="
                                                            h-16 w-16
                                                            overflow-hidden
                                                            rounded-xl
                                                            border-2 border-secondary
                                                            bg-secondary/30
                                                            shadow-sm
                                                            transition-all duration-300
                                                            group-hover:scale-105
                                                            group-hover:border-primayaccent/40
                                                            group-hover:shadow-md
                                                        ">

                                                            <img
                                                                src={item.images[0]}
                                                                className="h-full w-full object-cover"
                                                            />

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Product ID */}
                                                <td className="px-5 py-4">

                                                    <span className="
                                                        inline-flex
                                                        rounded-lg
                                                        bg-secondary/70
                                                        px-3 py-1.5
                                                        font-mono
                                                        text-xs
                                                        font-semibold
                                                        text-darktext/70
                                                    ">
                                                        {item.productId}
                                                    </span>

                                                </td>


                                                {/* Product Name */}
                                                <td className="max-w-[260px] px-5 py-4 text-left">

                                                    <span className="
                                                        block
                                                        truncate
                                                        text-sm
                                                        font-semibold
                                                        text-darktext
                                                        transition-colors
                                                        group-hover:text-primayaccent
                                                    ">
                                                        {item.name}
                                                    </span>

                                                </td>


                                                {/* Product Price */}
                                                <td className="px-5 py-4">

                                                    <span className="
                                                        font-bold
                                                        text-darktext
                                                    ">
                                                        Rs. {item.price}
                                                    </span>

                                                </td>


                                                {/* Label Price */}
                                                <td className="px-5 py-4">

                                                    <span className="
                                                        text-sm
                                                        text-darktext/40
                                                        line-through
                                                    ">
                                                        Rs. {item.labelPrice}
                                                    </span>

                                                </td>

                                                 {/* Stock */}
                                                <td className="px-2 py-4">

                                                    <span className="
                                                        font-bold
                                                        text-darktext/65
                                
                                                    ">
                                                        Rs. {item.stock}
                                                    </span>

                                                </td>


                                                {/* Category */}
                                                <td className="px-5 py-4">

                                                    <span className="
                                                        inline-flex
                                                        items-center
                                                        rounded-full
                                                        border border-secondary
                                                        bg-secondary/60
                                                        px-3 py-1.5
                                                        text-xs
                                                        font-semibold
                                                        text-darktext
                                                        shadow-sm
                                                    ">
                                                        {item.category}
                                                    </span>

                                                </td>


                                                {/* Actions */}
                                                <td className="px-5 py-4">

                                                    <div className="flex items-center justify-center gap-2">

                                                        {/* Delete */}
                                                        <div className="
                                                            flex h-9 w-9
                                                            cursor-pointer
                                                            items-center justify-center
                                                            rounded-lg
                                                            border border-transparent
                                                            bg-red-50
                                                            text-red-400
                                                            transition-all duration-200
                                                            hover:border-red-200
                                                            hover:bg-red-100
                                                            hover:text-red-600
                                                            hover:shadow-sm
                                                            active:scale-95
                                                        ">
                                                            <FaRegTrashCan className="text-base" 
                                                              onClick={()=>{
                                                                setProductToDelete(item.productId)
                                                                setIsDeleteConfirmVisible(true)
                                                              }}
                                                            
                                                            />
                                                        </div>


                                                        {/* Edit */}
                                                        <div className="
                                                            flex h-9 w-9
                                                            cursor-pointer
                                                            items-center justify-center
                                                            rounded-lg
                                                            border border-transparent
                                                            bg-[#C97B63]/10
                                                            text-primayaccent
                                                            transition-all duration-200
                                                            hover:border-[#C97B63]/30
                                                            hover:bg-[#C97B63]/20
                                                            hover:shadow-sm
                                                            active:scale-95
                                                           

                                                        ">
                                                            <FaRegEdit className="text-base" 
                                                                onClick={()=>
                                                                 navigate("/admin/update-product", { state: item })
                                                                }
                                                            
                                                            />
                                                        </div>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    }
                                )
                            }

                        </tbody>

                    </table>}

                </div>

            </div>
            
        </div>
    )
}