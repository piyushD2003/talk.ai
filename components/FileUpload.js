import { useState, useEffect } from 'react';

export default function FileUpload({onDataReceived}) {

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileTranscript, setFileTranscript] = useState(null)

  useEffect(() => {
    if(fileTranscript){
      onDataReceived(fileTranscript)
      console.log("Resume Sended to AI");
    }
  }, [fileTranscript,onDataReceived])
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Extract Base64 part from Data URL
        resolve(base64String);
      };
  
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
  
      reader.readAsDataURL(file); // Read file as Data URL
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return;

    setIsSubmitting(true);

    
    try {
      // const formData = new FormData();
      // formData.append('file', file); // Append the file to the form data
      // formData.append('mimeType', 'application/pdf'); // If you need to send the MIME type
      console.log(file);
      const base64String = await fileToBase64(file);
      
      // console.log(formData);

      const res = await fetch('/api/File-to-Text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64String,
          mimeType: 'application/pdf', // Adjust this if you use a different audio format
          api: localStorage.getItem('Skey')
        }),
      });
      const result = await res.json()
      setFileTranscript(result.text)
      console.log(result);

      // if (result) {
      //   console.log('File uploaded successfully');
      // } else {
      //   console.error('Failed tocvcv upload file');
      // }
    } catch (error) {
      console.error('An error occurred while uploading the file:', error);
    }

  };

  return (
    <form className="bg-gray-700 p-3 rounded-lg shadow-md" onSubmit={handleSubmit}>
  <div className="flex items-center space-x-4">
    <input className="md:size-11 size-7 flex-grow px-3 md:py-2 border border-gray-300 rounded-lg md:text-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" type="file" onChange={handleFileChange}
    />
    <button type="submit" disabled={isSubmitting} className={`md:w-22 md:h-10 w-16 h-8 md:text-[16px] text-sm grid justify-center px-4 py-2 font-semibold text-black bg-blue-200 rounded-lg shadow-md transition duration-300 ease-in-out ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}>
      {fileTranscript !== null ? 'Submitted' : 'Submit'}
    </button>
  </div>
</form>


  );
}
