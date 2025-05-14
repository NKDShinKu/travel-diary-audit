import { useState } from "react"

interface Props {
    images: string[]
}

const ImageGrid = ({ images }: Props) => {
    const [showMore, setShowMore] = useState(false)

    // 获取前 9 张图片，如果有更多则显示查看更多
    const visibleImages = showMore ? images : images.slice(0, 7)

    return (
        <>
            <div className="grid grid-cols-2 gap-4 w-full">
                {visibleImages.map((image, index) => (
                    <div key={index} className="relative">
                        <img
                            src={image}
                            alt={`图 ${index + 1}`}
                            className="w-full h-64 object-contain rounded-lg bg-gray-100"
                        />
                    </div>
                ))}

                {images.length > 7 && !showMore && (
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => setShowMore(true)}
                            className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-xl font-semibold text-blue-600"
                        >
                            查看更多
                        </button>
                    </div>
                )}
                {images.length > 7 && showMore && (
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => setShowMore(false)}
                            className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-xl font-semibold text-blue-600"
                        >
                            收起
                        </button>
                    </div>
                )}
            </div>

        </>
    )
}

export default ImageGrid
