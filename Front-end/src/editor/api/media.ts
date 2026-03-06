export async function uploadFile(file: File) {
    
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("http://localhost:5000/api/media/upload", {
    method: "POST",
    body: form,
   headers: {
    authorization: `Bearer ${localStorage.getItem("accessToken")}`
   },
   credentials: "include"
   
  },
  
);

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();

  return data.url;
}