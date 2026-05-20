"use client";

interface Props {
  urls: string[];
  selectedUrl: string | null;
  onSelect: (url: string | null) => void;
}

export default function SiteFilters({ urls, selectedUrl, onSelect}: Props) {

   const removeSite = async (url: string) => {
    if(!confirm(`Are you sure you want to stop monitoring ${url}?`)) return;
    try{
      console.log("Attempting to delete:", url);
    const res = await fetch('/api/targets',{
      method: 'DELETE',
      body:JSON.stringify({ url }),
    });
    if(res.ok){
      // Refresh the page or update state to reflect the change
    window.location.reload();
    }
  } catch (err){
    console.error('Delete failed ..!', err)
  }
  };
  
  const cleanLabel = (url: string) => 
    url.replace("https://", "").replace("www.", "").split(/[/?#]/)[0];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedUrl ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
      >
        All Sites
      </button>

      {urls.map((url) => (
        <div key={url} className="relative group mx-1 my-1">
          <button
            onClick={() => onSelect(url)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedUrl === url ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >
            {cleanLabel(url)}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSite(url);
            }}
            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-gray-900"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}