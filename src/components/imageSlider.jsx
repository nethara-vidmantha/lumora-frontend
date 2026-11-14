import { useState } from "react";

export default function ImageSlider(props) {

    const images = props.images
    const [activeImage, setactiveImage] = useState(0);

    return (
        <div className="w-full max-w-[520px]">

            {/* Main Image */}
            <div className="w-full aspect-square overflow-hidden rounded-3xl bg-secondary shadow-lg">
                <img
                    src={images[activeImage]}
                    alt="Product"
                    className="w-full h-full object-cover transition-all duration-500"
                />
            </div>

            {/* Thumbnails */}
            <div className="w-full mt-5 flex justify-center items-center gap-3 overflow-x-auto pb-2">

                {
                    images.map((img, index) => {
                        return (
                            <button
                                key={index}
                                onClick={() => setactiveImage(index)}
                                className={
                                    "shrink-0 w-[76px] h-[76px] rounded-xl overflow-hidden transition-all duration-200 " +
                                    (activeImage === index
                                        ? "ring-2 ring-primaryaccent ring-offset-2 scale-105"
                                        : "opacity-70 hover:opacity-100")
                                }
                            >
                                <img
                                    src={img}
                                    alt={`Product thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        )
                    })
                }

            </div>

        </div>
    )
}