
// import React, { useState } from "react";

// function ImageBlock() {
//   const [src, setSrc] = useState("https://via.com/150");

//   return (
//     <div className="image-block">
//       <img src={src} alt="Image Block" />
//       <input
//         type="text"
//         value={src}
//         onChange={(e) => setSrc(e.target.value)}
//         placeholder="Image URL"
//       />
//     </div>
//   );
// }

// export default ImageBlock;

// ImageBlock component

function ImageBlock({ block, onClick }) {
        const { src, alt, width, height, caption } = block?.properties || {};

    return (
        <div className="image-block" onClick={onClick}>
            <img src={src || 'https://via.com/150'} alt={alt} width={width} height={height} />
            {caption && <p>{caption}</p>}
        </div>
    );
}

export default ImageBlock;
