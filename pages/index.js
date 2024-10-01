import React, { useState } from "react";
import "../app/globals.css";
//import "./ImageUploadForm.css";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [coloringPrompt, setColoringPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processedImagePath, setProcessedImagePath] = useState(""); // ここを追加

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage("画像サイズは10MB以下にしてください。");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setMessage("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setMessage("画像を選択してください。");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: selectedImage }),
      });
    
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // デバッグ用ログ
      console.log("レスポンスデータ:", data);

      if(data.processedImagePath){
        setProcessedImage(data.image);
        setProcessedImagePath(data.processedImagePath);//追記
      }else{
        throw new Error("processedImagePathが存在しません");
      }

      setMessage(data.message);
    }catch(error) {
      setMessage(`画像のアップロードに失敗しました: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColoring = async () => {
    if (!processedImage) {
      setMessage("先に画像をアップロードしてください。");
      return;
    }
  };
  

  return (
    <div className="container mx-auto p-8 bg-gray-300 min-h-screen">

      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        画像アップロードと塗り絵
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <input 
          type="file" 
          onChange={handleImageChange}
          className="mb-4 p-2 w-full border border-gray-300 rounded"
          accept="image/*"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2 transition duration-300"
          disabled={isLoading || !selectedImage}
        >
          {isLoading ? "処理中..." : "アップロード"}
        </button>
        
      {message && <p className="my-2 text-red-500">{message}</p>}
      {selectedImage &&(
        <div className="my-4">
          <h2 className="text-xl font-semibold">元の画像:</h2>
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="max-w-full h-auto rounded" 
          />
        </div>
      )}
      {processedImage && (
        <div className="my-4">
          <h2 className="text-xl font-semibold mb-2">処理済み画像:</h2>
          <img
            src={`data:image/png;base64,${processedImage}`}
            alt="Processed"
            className="max-w-full h-auto rounded"
          />
          <a
            href={`data:image/png;base64,${processedImage}`}
            download="processed_image.png"
            className="block mt-4 text-blue-500 hover:text-blue-600 underline"
          >
          処理済み画像をダウンロード
          </a>
        </div>
      )}
    </div>
  </div>
  );
}
