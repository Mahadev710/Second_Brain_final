// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../App';
// import { 
//   X, Plus, Edit3, PlayCircle, FileText, Link, Hash, Trash2, Copy, Check, 
//   Search, File, Image, Filter, RotateCcw 
// } from 'lucide-react';

// // Import preview components
// import ImagePreview from '../preview/ImagePreview';
// import PDFPreview from '../preview/PDFPreview';
// import PlaylistPreview from '../preview/PlaylistPreview';

// // Interfaces
// interface BaseContent {
//   id: string;
//   _id: string;
//   type: 'tweaks' | 'playlists' | 'notes' | 'important-links' | 'pdfs' | 'images';
//   createdAt: Date;
//   tags: string[];
// }

// interface Tweaks extends BaseContent {
//   type: 'tweaks';
//   url: string;
// }

// interface Playlist extends BaseContent {
//   type: 'playlists';
//   url: string;
//   videoCount: number;
//   about: string;
// }

// interface Note extends BaseContent {
//   type: 'notes';
//   content: string;
// }

// interface ImportantLink extends BaseContent {
//   type: 'important-links';
//   url: string;
//   about: string;
// }

// interface PDF extends BaseContent {
//   type: 'pdfs';
//   fileName: string;
//   fileSize: number;
//   fileData: string;
//   about: string;
// }

// interface ImageContent extends BaseContent {
//   type: 'images';
//   fileName: string;
//   fileSize: number;
//   fileData: string;
//   about: string;
// }

// type ContentItem = Tweaks | Playlist | Note | ImportantLink | PDF | ImageContent;

// interface ContentFormData {
//   url?: string;
//   videoCount?: number;
//   about?: string;
//   content?: string;
//   tags?: string[];
//   fileName?: string;
//   fileSize?: number;
//   fileData?: string;
// }

// interface DateTimeFilter {
//   dateFrom?: string;
//   dateTo?: string;
//   timeFrom?: string;
//   timeTo?: string;
//   dateRange?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
// }

// // Constants
// const API_URL = 'http://localhost:5000/api/content/';

// const CONTENT_TYPES = [
//   { id: 'tweaks', label: 'Tweaks', icon: Edit3 },
//   { id: 'playlists', label: 'Playlists', icon: PlayCircle },
//   { id: 'notes', label: 'Notes', icon: FileText },
//   { id: 'important-links', label: 'Important Links', icon: Link },
//   { id: 'pdfs', label: 'PDFs', icon: File },
//   { id: 'images', label: 'Images', icon: Image },
// ] as const;

// const DATE_RANGE_OPTIONS = [
//   { value: 'today', label: 'Today' },
//   { value: 'yesterday', label: 'Yesterday' },
//   { value: 'this-week', label: 'This Week' },
//   { value: 'last-week', label: 'Last Week' },
//   { value: 'this-month', label: 'This Month' },
//   { value: 'last-month', label: 'Last Month' },
//   { value: 'custom', label: 'Custom Range' },
// ];

// // Utility functions
// const getDateRange = (range: string) => {
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
//   switch (range) {
//     case 'today':
//       return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
//     case 'yesterday':
//       const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
//       return { start: yesterday, end: today };
//     case 'this-week':
//       const weekStart = new Date(today);
//       weekStart.setDate(today.getDate() - today.getDay());
//       return { start: weekStart, end: new Date() };
//     case 'last-week':
//       const lastWeekStart = new Date(today);
//       lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
//       const lastWeekEnd = new Date(lastWeekStart);
//       lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
//       return { start: lastWeekStart, end: lastWeekEnd };
//     case 'this-month':
//       const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//       return { start: monthStart, end: new Date() };
//     case 'last-month':
//       const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
//       return { start: lastMonthStart, end: lastMonthEnd };
//     default:
//       return null;
//   }
// };

// const formatFileSize = (bytes: number) => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

// const getContentIcon = (type: ContentItem['type']) => {
//   const iconMap = {
//     tweaks: Edit3,
//     playlists: PlayCircle,
//     notes: FileText,
//     'important-links': Link,
//     pdfs: File,
//     images: Image,
//   };
//   return iconMap[type];
// };

// const SecondBrainApp: React.FC = () => {
//   // State declarations
//   const [contents, setContents] = useState<ContentItem[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<ContentItem['type'] | null>(null);
//   const [formData, setFormData] = useState<ContentFormData>({});
//   const [activeTab, setActiveTab] = useState<'all' | ContentItem['type']>('all');
//   const [copiedText, setCopiedText] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [tagInput, setTagInput] = useState('');
//   const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [contentFilter, setContentFilter] = useState('');
  
//   // Preview states
//   const [imagePreview, setImagePreview] = useState<ImageContent | null>(null);
//   const [pdfPreview, setPdfPreview] = useState<PDF | null>(null);
//   const [playlistPreview, setPlaylistPreview] = useState<Playlist | null>(null);
  
//   // Filter states
//   const [showFilters, setShowFilters] = useState(false);
//   const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({});
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
//   const navigate = useNavigate();
//   const { logout, token } = useAuth();

//   // Memoized filter and sort function
//   const filteredAndSortedContents = useMemo(() => {
//     let filtered = [...contents];

//     // Apply content filter
//     if (contentFilter) {
//       const searchTermLower = contentFilter.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(searchTermLower);
//           case 'notes':
//             return item.content.toLowerCase().includes(searchTermLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(searchTermLower) || 
//                    item.about.toLowerCase().includes(searchTermLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply date/time filters
//     if (dateTimeFilter.dateRange && dateTimeFilter.dateRange !== 'custom') {
//       const range = getDateRange(dateTimeFilter.dateRange);
//       if (range) {
//         filtered = filtered.filter(item => {
//           const itemDate = new Date(item.createdAt);
//           return itemDate >= range.start && itemDate < range.end;
//         });
//       }
//     } else if (dateTimeFilter.dateFrom || dateTimeFilter.dateTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
        
//         if (dateTimeFilter.dateFrom) {
//           const fromDate = new Date(dateTimeFilter.dateFrom);
//           if (itemDate < fromDate) return false;
//         }
        
//         if (dateTimeFilter.dateTo) {
//           const toDate = new Date(dateTimeFilter.dateTo);
//           toDate.setHours(23, 59, 59, 999);
//           if (itemDate > toDate) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply time filters
//     if (dateTimeFilter.timeFrom || dateTimeFilter.timeTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         const itemTime = itemDate.getHours() * 60 + itemDate.getMinutes();
        
//         if (dateTimeFilter.timeFrom) {
//           const [hours, minutes] = dateTimeFilter.timeFrom.split(':').map(Number);
//           const fromTime = hours * 60 + minutes;
//           if (itemTime < fromTime) return false;
//         }
        
//         if (dateTimeFilter.timeTo) {
//           const [hours, minutes] = dateTimeFilter.timeTo.split(':').map(Number);
//           const toTime = hours * 60 + minutes;
//           if (itemTime > toTime) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         case 'oldest':
//           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//         case 'alphabetical':
//           const getContentForSort = (item: ContentItem) => {
//             switch (item.type) {
//               case 'notes':
//                 return item.content;
//               case 'tweaks':
//               case 'playlists':
//               case 'important-links':
//                 return item.url;
//               case 'pdfs':
//               case 'images':
//                 return item.fileName;
//               default:
//                 return '';
//             }
//           };
//           return getContentForSort(a).localeCompare(getContentForSort(b));
//         default:
//           return 0;
//       }
//     });

//     return filtered;
//   }, [contents, contentFilter, dateTimeFilter, sortBy]);

//   // Memoized active filters check
//   const hasActiveFilters = useMemo(() => {
//     return Object.keys(dateTimeFilter).length > 0 || 
//            sortBy !== 'newest' || 
//            selectedTag || 
//            searchTerm || 
//            contentFilter || 
//            activeTab !== 'all';
//   }, [dateTimeFilter, sortBy, selectedTag, searchTerm, contentFilter, activeTab]);

//   // Callback handlers
//   const handleAddContent = useCallback(() => {
//     setShowModal(true);
//     setSelectedType(null);
//     setFormData({ tags: [] });
//     setTagInput('');
//   }, []);

//   const handleTypeSelect = useCallback((type: ContentItem['type']) => {
//     setSelectedType(type);
//     setFormData({ tags: [] });
//     setTagInput('');
//   }, []);

//   const handleInputChange = useCallback((field: keyof ContentFormData, value: string | number) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   }, []);

//   const handleCopy = useCallback(async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedText(text);
//       setTimeout(() => setCopiedText(null), 2000);
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//     }
//   }, []);

//   const handleAddTag = useCallback(() => {
//     if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...(prev.tags || []), tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   }, [tagInput, formData.tags]);

//   const handleRemoveTag = useCallback((tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
//     }));
//   }, []);

//   const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const result = event.target?.result as string;
//       setFormData(prev => ({
//         ...prev,
//         fileName: file.name,
//         fileSize: file.size,
//         fileData: result,
//       }));
//     };
//     reader.readAsDataURL(file);
//   }, []);

//   const handleDelete = useCallback(async (id: string) => {
//     if (!token || !window.confirm("Are you sure you want to delete this item?")) return;

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.delete(`${API_URL}${id}`, config);
//       setContents(prev => prev.filter(content => content.id !== id));
//       if (previewContent?.id === id) {
//         setPreviewContent(null);
//       }
//     } catch (error) {
//       console.error('Failed to delete content:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         logout();
//         navigate('/login');
//       } else {
//         alert('Could not delete content.');
//       }
//     }
//   }, [token, logout, navigate, previewContent?.id]);

//   const clearAllFilters = useCallback(() => {
//     setDateTimeFilter({});
//     setSortBy('newest');
//     setSelectedTag(null);
//     setSearchTerm('');
//     setContentFilter('');
//     setActiveTab('all');
//   }, []);

//   const handleLogout = useCallback(() => {
//     logout();
//     navigate('/login');
//   }, [logout, navigate]);

//   const handleTabChange = useCallback((tab: 'all' | ContentItem['type']) => {
//     setActiveTab(tab);
//     setSelectedTag(null);
//   }, []);

//   const handleTagSelect = useCallback((tag: string) => {
//     setSelectedTag(selectedTag === tag ? null : tag);
//   }, [selectedTag]);

//   // ESC key handler for previews
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setImagePreview(null);
//         setPdfPreview(null);
//         setPlaylistPreview(null);
//         setPreviewContent(null);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => document.removeEventListener('keydown', handleEscKey);
//   }, []);

//   // Fetch data with debouncing
//   useEffect(() => {
//     const fetchContent = async () => {
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       setIsLoading(true);
      
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             type: activeTab !== 'all' ? activeTab : undefined,
//             tag: selectedTag || undefined,
//             search: searchTerm || undefined,
//           },
//         };
        
//         const response = await axios.get(API_URL, config);
        
//         // Handle different response structures
//         let data = [];
//         if (Array.isArray(response.data)) {
//           data = response.data;
//         } else if (response.data && Array.isArray(response.data.data)) {
//           data = response.data.data;
//         } else if (response.data && Array.isArray(response.data.contents)) {
//           data = response.data.contents;
//         }
        
//         const mappedData = data.map((item: any) => ({ ...item, id: item._id }));
//         setContents(mappedData);
//       } catch (error) {
//         console.error('Failed to fetch content:', error);
//         if (axios.isAxiosError(error)) {
//           if (error.response?.status === 401) {
//             logout();
//             navigate('/login');
//           } else if (error.response?.status !== 404) {
//             console.error('API Error:', error.response?.data);
//           }
//         }
//         setContents([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const debounceTimer = setTimeout(fetchContent, 300);
//     return () => clearTimeout(debounceTimer);
//   }, [activeTab, selectedTag, searchTerm, navigate, token, logout]);

//   const handleSubmit = async () => {
//     if (!selectedType || !token) return;
    
//     // Validation logic (kept from original)
//     if ((selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && !formData.url) {
//       alert('URL is required');
//       return;
//     }
//     if (selectedType === 'playlists' && (!formData.videoCount || !formData.about)) {
//       alert('Video count and description are required for playlists');
//       return;
//     }
//     if (selectedType === 'notes' && !formData.content) {
//       alert('Note content is required');
//       return;
//     }
//     if ((selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && !formData.about) {
//       alert('Description is required');
//       return;
//     }
//     if ((selectedType === 'pdfs' || selectedType === 'images') && (!formData.fileName || !formData.fileData)) {
//       alert('File upload is required');
//       return;
//     }

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       const newContentData = { type: selectedType, ...formData };
//       const response = await axios.post(API_URL, newContentData, config);
      
//       // Handle different response structures
//       let newContent;
//       if (response.data && response.data._id) {
//         newContent = { ...response.data, id: response.data._id };
//       } else if (response.data.data && response.data.data._id) {
//         newContent = { ...response.data.data, id: response.data.data._id };
//       } else if (response.data.content && response.data.content._id) {
//         newContent = { ...response.data.content, id: response.data.content._id };
//       } else {
//         window.location.reload();
//         return;
//       }
      
//       setContents(prev => [newContent, ...prev]);
//       setShowModal(false);
//       setSelectedType(null);
//       setFormData({ tags: [] });
//       setTagInput('');
//     } catch (error) {
//       console.error('Failed to add content:', error);
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           alert(`Could not add content: ${error.response?.data?.message || 'Unknown error'}`);
//         }
//       } else {
//         alert('Could not add content. Please try again.');
//       }
//     }
//   };

//   // Memoized content card component
//   const ContentCard = React.memo(({ content }: { content: ContentItem }) => {
//     const Icon = getContentIcon(content.type);
    
//     const handleCardClick = useCallback((e: React.MouseEvent) => {
//       if ((e.target as HTMLElement).closest('button, a')) return;
      
//       if (content.type === 'images') {
//         setImagePreview(content as ImageContent);
//       } else if (content.type === 'pdfs') {
//         setPdfPreview(content as PDF);
//       } else if (content.type === 'playlists') {
//         setPlaylistPreview(content as Playlist);
//       } else {
//         setPreviewContent(content);
//       }
//     }, [content]);
    
//     return (
//       <div
//         className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative group flex flex-col ${
//           (content.type === 'pdfs' || content.type === 'images' || content.type === 'playlists') 
//             ? 'cursor-pointer hover:border-blue-500' : ''
//         }`}
//         onClick={handleCardClick}
//       >
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Icon className="w-5 h-5 text-blue-400" />
//             <span className="text-sm text-gray-400 capitalize">
//               {content.type.replace('-', ' ')}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="text-right">
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleDateString()}
//               </span>
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleTimeString()}
//               </span>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDelete(content.id);
//               }}
//               className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
//               title="Delete"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-grow space-y-3">
//           {content.type === 'tweaks' && (
//             <div className="flex items-center gap-2">
//               <a
//                 href={content.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {content.url}
//               </a>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.url);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                 title="Copy URL"
//               >
//                 {copiedText === content.url ? 
//                   <Check className="w-4 h-4 text-green-400" /> : 
//                   <Copy className="w-4 h-4" />
//                 }
//               </button>
//             </div>
//           )}
          
//           {content.type === 'playlists' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? 
//                     <Check className="w-4 h-4 text-green-400" /> : 
//                     <Copy className="w-4 h-4" />
//                   }
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
          
//           {content.type === 'notes' && (
//             <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">
//               {content.content}
//             </p>
//           )}
          
//           {content.type === 'important-links' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? 
//                     <Check className="w-4 h-4 text-green-400" /> : 
//                     <Copy className="w-4 h-4" />
//                   }
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
          
//           {content.type === 'pdfs' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-md">
//                 <File className="w-8 h-8 text-red-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//                   <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview PDF</div>
//             </div>
//           )}
          
//           {content.type === 'images' && (
//             <div className="space-y-2">
//               <div className="relative">
//                 <img 
//                   src={content.fileData} 
//                   alt={content.fileName} 
//                   className="w-full h-48 object-cover rounded-md" 
//                   loading="lazy"
//                 />
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview image</div>
//             </div>
//           )}
//         </div>
        
//         {content.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-700 pt-3">
//             {content.tags.map(tag => (
//               <span
//                 key={tag}
//                 onClick={(e) => { 
//                   e.stopPropagation(); 
//                   handleTagSelect(tag);
//                 }}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                   selectedTag === tag
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   });

//   // Memoized filter panel component
//   const FilterPanel = React.memo(() => (
//     <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search in URLs, notes, file names, descriptions..."
//             value={contentFilter}
//             onChange={(e) => setContentFilter(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>
      
//       <div className="flex flex-wrap gap-4">
//         <div className="flex-1 min-w-48">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
//           <select
//             value={dateTimeFilter.dateRange || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ 
//               ...prev, 
//               dateRange: e.target.value as any,
//               dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
//               dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
//             }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Time</option>
//             {DATE_RANGE_OPTIONS.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {dateTimeFilter.dateRange === 'custom' && (
//           <>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateFrom || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateTo || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </>
//         )}

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeFrom || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeTo || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as any)}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//             <option value="alphabetical">Alphabetical</option>
//           </select>
//         </div>
//       </div>

//       {hasActiveFilters && (
//         <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-300">Active Filters:</span>
//             <button
//               onClick={clearAllFilters}
//               className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//             >
//               <RotateCcw className="w-3 h-3" />
//               Clear All
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {contentFilter && (
//               <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
//                 Content: "{contentFilter}"
//               </span>
//             )}
//             {activeTab !== 'all' && (
//               <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
//                 Type: {activeTab.replace('-', ' ')}
//               </span>
//             )}
//             {selectedTag && (
//               <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                 Tag: #{selectedTag}
//               </span>
//             )}
//             {searchTerm && (
//               <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
//                 Search: "{searchTerm}"
//               </span>
//             )}
//             {dateTimeFilter.dateRange && (
//               <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
//                 Date: {DATE_RANGE_OPTIONS.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
//               </span>
//             )}
//             {sortBy !== 'newest' && (
//               <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
//                 Sort: {sortBy}
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   ));

//   // Memoized form component
//   const ContentForm = React.memo(() => {
//     if (!selectedType) return null;
    
//     const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         handleAddTag();
//       }
//     };
    
//     return (
//       <div className="space-y-4">
//         {(selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
//             <input 
//               type="url" 
//               value={formData.url || ''} 
//               onChange={(e) => handleInputChange('url', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="https://example.com" 
//               required 
//             />
//           </div>
//         )}
        
//         {(selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               Upload {selectedType === 'pdfs' ? 'PDF' : 'Image'}
//             </label>
//             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
//               <div className="space-y-1 text-center">
//                 {selectedType === 'pdfs' ? (
//                   <File className="mx-auto h-12 w-12 text-gray-500" />
//                 ) : (
//                   <Image className="mx-auto h-12 w-12 text-gray-500" />
//                 )}
//                 <div className="flex text-sm text-gray-400">
//                   <label 
//                     htmlFor="file-upload" 
//                     className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500"
//                   >
//                     <span>Upload a file</span>
//                     <input 
//                       id="file-upload" 
//                       name="file-upload" 
//                       type="file" 
//                       className="sr-only" 
//                       accept={selectedType === 'pdfs' ? '.pdf' : 'image/*'} 
//                       onChange={handleFileUpload} 
//                       required 
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 {formData.fileName && (
//                   <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                     <p className="text-gray-300">{formData.fileName}</p>
//                     <p className="text-xs text-gray-400">{formData.fileSize && formatFileSize(formData.fileSize)}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
        
//         {selectedType === 'playlists' && (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Number of Videos</label>
//               <input 
//                 type="number" 
//                 value={formData.videoCount || ''} 
//                 onChange={(e) => handleInputChange('videoCount', parseInt(e.target.value) || 0)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 min="0" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
//               <textarea 
//                 value={formData.about || ''} 
//                 onChange={(e) => handleInputChange('about', e.target.value)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 rows={3} 
//                 required 
//               />
//             </div>
//           </>
//         )}
        
//         {selectedType === 'notes' && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
//             <textarea 
//               value={formData.content || ''} 
//               onChange={(e) => handleInputChange('content', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={4} 
//               required 
//             />
//           </div>
//         )}
        
//         {(selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">About / Description</label>
//             <textarea 
//               value={formData.about || ''} 
//               onChange={(e) => handleInputChange('about', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={3} 
//               required 
//             />
//           </div>
//         )}
        
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
//           <div className="flex gap-2">
//             <input 
//               type="text" 
//               value={tagInput} 
//               onChange={(e) => setTagInput(e.target.value)} 
//               onKeyDown={handleTagInputKeyPress} 
//               className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Add a tag and press Enter" 
//             />
//             <button 
//               type="button" 
//               onClick={handleAddTag} 
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
//             >
//               Add
//             </button>
//           </div>
//           {formData.tags && formData.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {formData.tags.map(tag => (
//                 <span key={tag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center gap-1">
//                   #{tag}
//                   <button 
//                     type="button" 
//                     onClick={() => handleRemoveTag(tag)} 
//                     className="hover:text-red-300"
//                   >
//                     &times;
//                   </button>
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="flex justify-end gap-3 pt-4">
//           <button 
//             type="button" 
//             onClick={() => setSelectedType(null)} 
//             className="px-4 py-2 text-gray-300 hover:text-white"
//           >
//             Back
//           </button>
//           <button 
//             type="button" 
//             onClick={handleSubmit} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Add Content
//           </button>
//         </div>
//       </div>
//     );
//   });

//   // Memoized sidebar component
//   const Sidebar = React.memo(() => (
//     <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700 flex flex-col">
//       <div className="flex items-center gap-2 mb-8">
//         <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
//           <Hash className="w-5 h-5 text-white" />
//         </div>
//         <h1 className="text-xl font-bold text-white">Second Brain</h1>
//       </div>
      
//       <nav className="space-y-2 flex-grow">
//         <button 
//           onClick={() => handleTabChange('all')} 
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//             activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//           }`}
//         >
//           <FileText className="w-4 h-4" /> All Contents
//         </button>
//         {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
//           <button 
//             key={id} 
//             onClick={() => handleTabChange(id)} 
//             className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//               activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//             }`}
//           >
//             <Icon className="w-4 h-4" /> {label}
//           </button>
//         ))}
//       </nav>
      
//       <div className="mt-4">
//         <button 
//           onClick={handleLogout} 
//           className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
//         >
//           <X className="w-4 h-4" /> Logout
//         </button>
//       </div>
//     </div>
//   ));

//   // Memoized preview panel component
//   const PreviewPanel = React.memo(() => {
//     if (!previewContent) return null;
    
//     return (
//       <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Preview</h3>
//           <button
//             onClick={() => setPreviewContent(null)}
//             className="text-gray-400 hover:text-white"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           <div>
//             <h4 className="font-medium text-gray-300 mb-2 capitalize">
//               {previewContent.type.replace('-', ' ')}
//             </h4>
//             {previewContent.type === 'notes' && (
//               <p className="text-sm text-gray-300 whitespace-pre-wrap">
//                 {(previewContent as Note).content}
//               </p>
//             )}
//             {(previewContent.type === 'tweaks' || previewContent.type === 'important-links') && (
//               <a 
//                 href={(previewContent as Tweaks | ImportantLink).url} 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
//               >
//                 {(previewContent as Tweaks | ImportantLink).url}
//               </a>
//             )}
//             {previewContent.type === 'important-links' && (
//               <p className="text-sm text-gray-300 mt-2">
//                 {(previewContent as ImportantLink).about}
//               </p>
//             )}
//           </div>
          
//           {previewContent.tags.length > 0 && (
//             <div>
//               <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
//               <div className="flex flex-wrap gap-1">
//                 {previewContent.tags.map(tag => (
//                   <span
//                     key={tag}
//                     onClick={() => handleTagSelect(tag)}
//                     className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                       selectedTag === tag
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
        
//         <div className="mt-4 text-xs text-gray-500">
//           Created: {new Date(previewContent.createdAt).toLocaleString()}
//         </div>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="flex">
//         <Sidebar />

//         {/* Main Content */}
//         <main className={`flex-1 p-6 transition-all duration-300 ${previewContent ? 'pr-0' : ''}`}>
//           <header className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold capitalize mb-2">
//                 {activeTab === 'all' ? 'All Contents' : activeTab.replace('-', ' ')}
//               </h2>
//               {selectedTag && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-400">Filtered by:</span>
//                   <span 
//                     onClick={() => setSelectedTag(null)} 
//                     className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
//                   >
//                     #{selectedTag} &times;
//                   </span>
//                 </div>
//               )}
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input 
//                   type="text" 
//                   placeholder="Search..." 
//                   value={searchTerm} 
//                   onChange={(e) => setSearchTerm(e.target.value)} 
//                   className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
//                 />
//               </div>
              
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
//                   showFilters || hasActiveFilters
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 <Filter className="w-4 h-4" />
//                 Filters
//                 {hasActiveFilters && (
//                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                     {[
//                       Object.keys(dateTimeFilter).length > 0,
//                       sortBy !== 'newest',
//                       selectedTag,
//                       searchTerm,
//                       contentFilter,
//                       activeTab !== 'all'
//                     ].filter(Boolean).length}
//                   </span>
//                 )}
//               </button>
              
//               <button 
//                 onClick={handleAddContent} 
//                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Content
//               </button>
//             </div>
//           </header>

//           {/* Filter Panel */}
//           {showFilters && <FilterPanel />}

//           {/* Content Grid */}
//           {isLoading ? (
//             <div className="text-center py-20 text-gray-400">
//               <div className="animate-pulse">Loading content...</div>
//             </div>
//           ) : filteredAndSortedContents.length > 0 ? (
//             <>
//               <div className="mb-4 text-sm text-gray-400">
//                 Showing {filteredAndSortedContents.length} of {contents.length} items
//               </div>
//               <div className={`grid gap-4 ${
//                 previewContent 
//                   ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' 
//                   : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//               }`}>
//                 {filteredAndSortedContents.map(content => (
//                   <ContentCard key={content.id} content={content} />
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p>
//                 {contents.length === 0 
//                   ? "No content found. Click \"Add Content\" to get started!" 
//                   : "No content matches your current filters. Try adjusting your search criteria."
//                 }
//               </p>
//             </div>
//           )}
//         </main>

//         <PreviewPanel />
//       </div>

//       {/* Preview Components */}
//       {imagePreview && (
//         <ImagePreview 
//           image={imagePreview} 
//           onClose={() => setImagePreview(null)} 
//         />
//       )}
      
//       {pdfPreview && (
//         <PDFPreview 
//           pdf={pdfPreview} 
//           onClose={() => setPdfPreview(null)} 
//         />
//       )}
      
//       {playlistPreview && (
//         <PlaylistPreview 
//           playlist={playlistPreview} 
//           onClose={() => setPlaylistPreview(null)} 
//         />
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">
//                 {selectedType ? `Add New ${selectedType.replace('-', ' ')}` : 'Choose Content Type'}
//               </h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             {!selectedType ? (
//               <div className="space-y-2">
//                 {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
//                   <button 
//                     key={id} 
//                     onClick={() => handleTypeSelect(id)} 
//                     className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
//                   >
//                     <Icon className="w-5 h-5 text-blue-400" /> 
//                     <span>{label}</span>
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <ContentForm />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SecondBrainApp;

// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../App';
// import { 
//   X, Plus, Edit3, PlayCircle, FileText, Link, Hash, Trash2, Copy, Check, 
//   Search, File, Image, Filter, RotateCcw 
// } from 'lucide-react';

// // Import preview components
// import ImagePreview from '../preview/ImagePreview';
// import PDFPreview from '../preview/PDFPreview';
// import PlaylistPreview from '../preview/PlaylistPreview';

// // Interfaces
// interface BaseContent {
//   id: string;
//   _id: string;
//   type: 'tweaks' | 'playlists' | 'notes' | 'important-links' | 'pdfs' | 'images';
//   createdAt: Date;
//   tags: string[];
// }

// interface Tweaks extends BaseContent {
//   type: 'tweaks';
//   url: string;
// }

// interface Playlist extends BaseContent {
//   type: 'playlists';
//   url: string;
//   videoCount: number;
//   about: string;
// }

// interface Note extends BaseContent {
//   type: 'notes';
//   content: string;
// }

// interface ImportantLink extends BaseContent {
//   type: 'important-links';
//   url: string;
//   about: string;
// }

// interface PDF extends BaseContent {
//   type: 'pdfs';
//   fileName: string;
//   fileSize: number;
//   fileData: string;
//   about: string;
// }

// interface ImageContent extends BaseContent {
//   type: 'images';
//   fileName: string;
//   fileSize: number;
//   fileData: string;
//   about: string;
// }

// type ContentItem = Tweaks | Playlist | Note | ImportantLink | PDF | ImageContent;

// interface ContentFormData {
//   url?: string;
//   videoCount?: number;
//   about?: string;
//   content?: string;
//   tags?: string[];
//   fileName?: string;
//   fileSize?: number;
//   fileData?: string;
// }

// interface DateTimeFilter {
//   dateFrom?: string;
//   dateTo?: string;
//   timeFrom?: string;
//   timeTo?: string;
//   dateRange?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
// }

// // Constants
// const API_URL = 'http://localhost:5000/api/content/';

// const CONTENT_TYPES = [
//   { id: 'tweaks', label: 'Tweaks', icon: Edit3 },
//   { id: 'playlists', label: 'Playlists', icon: PlayCircle },
//   { id: 'notes', label: 'Notes', icon: FileText },
//   { id: 'important-links', label: 'Important Links', icon: Link },
//   { id: 'pdfs', label: 'PDFs', icon: File },
//   { id: 'images', label: 'Images', icon: Image },
// ] as const;

// const DATE_RANGE_OPTIONS = [
//   { value: 'today', label: 'Today' },
//   { value: 'yesterday', label: 'Yesterday' },
//   { value: 'this-week', label: 'This Week' },
//   { value: 'last-week', label: 'Last Week' },
//   { value: 'this-month', label: 'This Month' },
//   { value: 'last-month', label: 'Last Month' },
//   { value: 'custom', label: 'Custom Range' },
// ];

// // Utility functions
// const getDateRange = (range: string) => {
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
//   switch (range) {
//     case 'today':
//       return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
//     case 'yesterday':
//       const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
//       return { start: yesterday, end: today };
//     case 'this-week':
//       const weekStart = new Date(today);
//       weekStart.setDate(today.getDate() - today.getDay());
//       return { start: weekStart, end: new Date() };
//     case 'last-week':
//       const lastWeekStart = new Date(today);
//       lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
//       const lastWeekEnd = new Date(lastWeekStart);
//       lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
//       return { start: lastWeekStart, end: lastWeekEnd };
//     case 'this-month':
//       const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//       return { start: monthStart, end: new Date() };
//     case 'last-month':
//       const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
//       return { start: lastMonthStart, end: lastMonthEnd };
//     default:
//       return null;
//   }
// };

// const formatFileSize = (bytes: number) => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

// const getContentIcon = (type: ContentItem['type']) => {
//   const iconMap = {
//     tweaks: Edit3,
//     playlists: PlayCircle,
//     notes: FileText,
//     'important-links': Link,
//     pdfs: File,
//     images: Image,
//   };
//   return iconMap[type];
// };

// const SecondBrainApp: React.FC = () => {
//   // State declarations
//   const [contents, setContents] = useState<ContentItem[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<ContentItem['type'] | null>(null);
//   const [formData, setFormData] = useState<ContentFormData>({});
//   const [activeTab, setActiveTab] = useState<'all' | ContentItem['type']>('all');
//   const [copiedText, setCopiedText] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [tagInput, setTagInput] = useState('');
//   const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [contentFilter, setContentFilter] = useState('');
  
//   // Preview states
//   const [imagePreview, setImagePreview] = useState<ImageContent | null>(null);
//   const [pdfPreview, setPdfPreview] = useState<PDF | null>(null);
//   const [playlistPreview, setPlaylistPreview] = useState<Playlist | null>(null);
  
//   // Filter states
//   const [showFilters, setShowFilters] = useState(false);
//   const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({});
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
//   const navigate = useNavigate();
//   const { logout, token } = useAuth();

//   // Memoized filter and sort function
//   const filteredAndSortedContents = useMemo(() => {
//     let filtered = [...contents];

//     // Apply content filter
//     if (contentFilter) {
//       const searchTermLower = contentFilter.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(searchTermLower);
//           case 'notes':
//             return item.content.toLowerCase().includes(searchTermLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(searchTermLower) || 
//                    item.about.toLowerCase().includes(searchTermLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply date/time filters
//     if (dateTimeFilter.dateRange && dateTimeFilter.dateRange !== 'custom') {
//       const range = getDateRange(dateTimeFilter.dateRange);
//       if (range) {
//         filtered = filtered.filter(item => {
//           const itemDate = new Date(item.createdAt);
//           return itemDate >= range.start && itemDate < range.end;
//         });
//       }
//     } else if (dateTimeFilter.dateFrom || dateTimeFilter.dateTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
        
//         if (dateTimeFilter.dateFrom) {
//           const fromDate = new Date(dateTimeFilter.dateFrom);
//           if (itemDate < fromDate) return false;
//         }
        
//         if (dateTimeFilter.dateTo) {
//           const toDate = new Date(dateTimeFilter.dateTo);
//           toDate.setHours(23, 59, 59, 999);
//           if (itemDate > toDate) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply time filters
//     if (dateTimeFilter.timeFrom || dateTimeFilter.timeTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         const itemTime = itemDate.getHours() * 60 + itemDate.getMinutes();
        
//         if (dateTimeFilter.timeFrom) {
//           const [hours, minutes] = dateTimeFilter.timeFrom.split(':').map(Number);
//           const fromTime = hours * 60 + minutes;
//           if (itemTime < fromTime) return false;
//         }
        
//         if (dateTimeFilter.timeTo) {
//           const [hours, minutes] = dateTimeFilter.timeTo.split(':').map(Number);
//           const toTime = hours * 60 + minutes;
//           if (itemTime > toTime) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         case 'oldest':
//           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//         case 'alphabetical':
//           const getContentForSort = (item: ContentItem) => {
//             switch (item.type) {
//               case 'notes':
//                 return item.content;
//               case 'tweaks':
//               case 'playlists':
//               case 'important-links':
//                 return item.url;
//               case 'pdfs':
//               case 'images':
//                 return item.fileName;
//               default:
//                 return '';
//             }
//           };
//           return getContentForSort(a).localeCompare(getContentForSort(b));
//         default:
//           return 0;
//       }
//     });

//     return filtered;
//   }, [contents, contentFilter, dateTimeFilter, sortBy]);

//   // Memoized active filters check
//   const hasActiveFilters = useMemo(() => {
//     return Object.keys(dateTimeFilter).length > 0 || 
//            sortBy !== 'newest' || 
//            selectedTag || 
//            searchTerm || 
//            contentFilter || 
//            activeTab !== 'all';
//   }, [dateTimeFilter, sortBy, selectedTag, searchTerm, contentFilter, activeTab]);

//   // Callback handlers
//   const handleAddContent = useCallback(() => {
//     setShowModal(true);
//     setSelectedType(null);
//     setFormData({ tags: [] });
//     setTagInput('');
//   }, []);

//   const handleTypeSelect = useCallback((type: ContentItem['type']) => {
//     setSelectedType(type);
//     setFormData({ tags: [] });
//     setTagInput('');
//   }, []);

//   const handleInputChange = useCallback((field: keyof ContentFormData, value: string | number) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   }, []);

//   const handleCopy = useCallback(async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedText(text);
//       setTimeout(() => setCopiedText(null), 2000);
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//     }
//   }, []);

//   const handleAddTag = useCallback(() => {
//     if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...(prev.tags || []), tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   }, [tagInput, formData.tags]);

//   const handleRemoveTag = useCallback((tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
//     }));
//   }, []);

//   const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const result = event.target?.result as string;
//       setFormData(prev => ({
//         ...prev,
//         fileName: file.name,
//         fileSize: file.size,
//         fileData: result,
//       }));
//     };
//     reader.readAsDataURL(file);
//   }, []);

//   const handleDelete = useCallback(async (id: string) => {
//     if (!token || !window.confirm("Are you sure you want to delete this item?")) return;

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.delete(`${API_URL}${id}`, config);
//       setContents(prev => prev.filter(content => content.id !== id));
//       if (previewContent?.id === id) {
//         setPreviewContent(null);
//       }
//     } catch (error) {
//       console.error('Failed to delete content:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         logout();
//         navigate('/login');
//       } else {
//         alert('Could not delete content.');
//       }
//     }
//   }, [token, logout, navigate, previewContent?.id]);

//   const clearAllFilters = useCallback(() => {
//     setDateTimeFilter({});
//     setSortBy('newest');
//     setSelectedTag(null);
//     setSearchTerm('');
//     setContentFilter('');
//     setActiveTab('all');
//   }, []);

//   const handleLogout = useCallback(() => {
//     logout();
//     navigate('/login');
//   }, [logout, navigate]);

//   // Optimized search handlers with stable references
//   const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleContentFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setContentFilter(e.target.value);
//   }, []);

//   const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setTagInput(e.target.value);
//   }, []);

//   const handleTabChange = useCallback((tab: 'all' | ContentItem['type']) => {
//     setActiveTab(tab);
//     setSelectedTag(null);
//   }, []);

//   const handleTagSelect = useCallback((tag: string) => {
//     setSelectedTag(selectedTag === tag ? null : tag);
//   }, [selectedTag]);

//   // ESC key handler for previews
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setImagePreview(null);
//         setPdfPreview(null);
//         setPlaylistPreview(null);
//         setPreviewContent(null);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => document.removeEventListener('keydown', handleEscKey);
//   }, []);

//   // Fetch data with debouncing - prevent focus loss during typing
//   useEffect(() => {
//     const fetchContent = async () => {
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       // Don't show loading if we're just filtering locally
//       const isLocalFilter = contentFilter || sortBy !== 'newest' || 
//                            Object.keys(dateTimeFilter).length > 0;
      
//       if (!isLocalFilter) {
//         setIsLoading(true);
//       }
      
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             type: activeTab !== 'all' ? activeTab : undefined,
//             tag: selectedTag || undefined,
//             search: searchTerm || undefined,
//           },
//         };
        
//         const response = await axios.get(API_URL, config);
        
//         // Handle different response structures
//         let data = [];
//         if (Array.isArray(response.data)) {
//           data = response.data;
//         } else if (response.data && Array.isArray(response.data.data)) {
//           data = response.data.data;
//         } else if (response.data && Array.isArray(response.data.contents)) {
//           data = response.data.contents;
//         }
        
//         const mappedData = data.map((item: any) => ({ ...item, id: item._id }));
//         setContents(mappedData);
//       } catch (error) {
//         console.error('Failed to fetch content:', error);
//         if (axios.isAxiosError(error)) {
//           if (error.response?.status === 401) {
//             logout();
//             navigate('/login');
//           } else if (error.response?.status !== 404) {
//             console.error('API Error:', error.response?.data);
//           }
//         }
//         setContents([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const debounceTimer = setTimeout(fetchContent, 300);
//     return () => clearTimeout(debounceTimer);
//   }, [activeTab, selectedTag, searchTerm, navigate, token, logout]); // Removed local filters from dependencies

//   const handleSubmit = async () => {
//     if (!selectedType || !token) return;
    
//     // Validation logic (kept from original)
//     if ((selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && !formData.url) {
//       alert('URL is required');
//       return;
//     }
//     if (selectedType === 'playlists' && (!formData.videoCount || !formData.about)) {
//       alert('Video count and description are required for playlists');
//       return;
//     }
//     if (selectedType === 'notes' && !formData.content) {
//       alert('Note content is required');
//       return;
//     }
//     if ((selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && !formData.about) {
//       alert('Description is required');
//       return;
//     }
//     if ((selectedType === 'pdfs' || selectedType === 'images') && (!formData.fileName || !formData.fileData)) {
//       alert('File upload is required');
//       return;
//     }

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       const newContentData = { type: selectedType, ...formData };
//       const response = await axios.post(API_URL, newContentData, config);
      
//       // Handle different response structures
//       let newContent;
//       if (response.data && response.data._id) {
//         newContent = { ...response.data, id: response.data._id };
//       } else if (response.data.data && response.data.data._id) {
//         newContent = { ...response.data.data, id: response.data.data._id };
//       } else if (response.data.content && response.data.content._id) {
//         newContent = { ...response.data.content, id: response.data.content._id };
//       } else {
//         window.location.reload();
//         return;
//       }
      
//       setContents(prev => [newContent, ...prev]);
//       setShowModal(false);
//       setSelectedType(null);
//       setFormData({ tags: [] });
//       setTagInput('');
//     } catch (error) {
//       console.error('Failed to add content:', error);
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           alert(`Could not add content: ${error.response?.data?.message || 'Unknown error'}`);
//         }
//       } else {
//         alert('Could not add content. Please try again.');
//       }
//     }
//   };

//   // Add ref for focus management
//   const searchInputRef = React.useRef<HTMLInputElement>(null);
//   const contentFilterRef = React.useRef<HTMLInputElement>(null);
//   const tagInputRef = React.useRef<HTMLInputElement>(null);

//   // Memoized content card component
//   const ContentCard = React.memo(({ content }: { content: ContentItem }) => {
//     const Icon = getContentIcon(content.type);
    
//     const handleCardClick = useCallback((e: React.MouseEvent) => {
//       if ((e.target as HTMLElement).closest('button, a')) return;
      
//       if (content.type === 'images') {
//         setImagePreview(content as ImageContent);
//       } else if (content.type === 'pdfs') {
//         setPdfPreview(content as PDF);
//       } else if (content.type === 'playlists') {
//         setPlaylistPreview(content as Playlist);
//       } else {
//         setPreviewContent(content);
//       }
//     }, [content]);
    
//     return (
//       <div
//         className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative group flex flex-col ${
//           (content.type === 'pdfs' || content.type === 'images' || content.type === 'playlists') 
//             ? 'cursor-pointer hover:border-blue-500' : ''
//         }`}
//         onClick={handleCardClick}
//       >
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Icon className="w-5 h-5 text-blue-400" />
//             <span className="text-sm text-gray-400 capitalize">
//               {content.type.replace('-', ' ')}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="text-right">
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleDateString()}
//               </span>
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleTimeString()}
//               </span>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDelete(content.id);
//               }}
//               className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
//               title="Delete"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-grow space-y-3">
//           {content.type === 'tweaks' && (
//             <div className="flex items-center gap-2">
//               <a
//                 href={content.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {content.url}
//               </a>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.url);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                 title="Copy URL"
//               >
//                 {copiedText === content.url ? 
//                   <Check className="w-4 h-4 text-green-400" /> : 
//                   <Copy className="w-4 h-4" />
//                 }
//               </button>
//             </div>
//           )}
          
//           {content.type === 'playlists' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? 
//                     <Check className="w-4 h-4 text-green-400" /> : 
//                     <Copy className="w-4 h-4" />
//                   }
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
          
//           {content.type === 'notes' && (
//             <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">
//               {content.content}
//             </p>
//           )}
          
//           {content.type === 'important-links' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? 
//                     <Check className="w-4 h-4 text-green-400" /> : 
//                     <Copy className="w-4 h-4" />
//                   }
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
          
//           {content.type === 'pdfs' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-md">
//                 <File className="w-8 h-8 text-red-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//                   <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview PDF</div>
//             </div>
//           )}
          
//           {content.type === 'images' && (
//             <div className="space-y-2">
//               <div className="relative">
//                 <img 
//                   src={content.fileData} 
//                   alt={content.fileName} 
//                   className="w-full h-48 object-cover rounded-md" 
//                   loading="lazy"
//                 />
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview image</div>
//             </div>
//           )}
//         </div>
        
//         {content.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-700 pt-3">
//             {content.tags.map(tag => (
//               <span
//                 key={tag}
//                 onClick={(e) => { 
//                   e.stopPropagation(); 
//                   handleTagSelect(tag);
//                 }}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                   selectedTag === tag
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   });

//   // Memoized filter panel component with stable refs
//   const FilterPanel = React.memo(() => (
//     <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search in URLs, notes, file names, descriptions..."
//             value={contentFilter}
//             onChange={handleContentFilterChange}
//             ref={contentFilterRef}
//             className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>
      
//       <div className="flex flex-wrap gap-4">
//         <div className="flex-1 min-w-48">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
//           <select
//             value={dateTimeFilter.dateRange || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ 
//               ...prev, 
//               dateRange: e.target.value as any,
//               dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
//               dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
//             }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Time</option>
//             {DATE_RANGE_OPTIONS.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {dateTimeFilter.dateRange === 'custom' && (
//           <>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateFrom || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateTo || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </>
//         )}

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeFrom || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeTo || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as any)}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//             <option value="alphabetical">Alphabetical</option>
//           </select>
//         </div>
//       </div>

//       {hasActiveFilters && (
//         <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-300">Active Filters:</span>
//             <button
//               onClick={clearAllFilters}
//               className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//             >
//               <RotateCcw className="w-3 h-3" />
//               Clear All
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {contentFilter && (
//               <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
//                 Content: "{contentFilter}"
//               </span>
//             )}
//             {activeTab !== 'all' && (
//               <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
//                 Type: {activeTab.replace('-', ' ')}
//               </span>
//             )}
//             {selectedTag && (
//               <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                 Tag: #{selectedTag}
//               </span>
//             )}
//             {searchTerm && (
//               <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
//                 Search: "{searchTerm}"
//               </span>
//             )}
//             {dateTimeFilter.dateRange && (
//               <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
//                 Date: {DATE_RANGE_OPTIONS.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
//               </span>
//             )}
//             {sortBy !== 'newest' && (
//               <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
//                 Sort: {sortBy}
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   ));

//   // Memoized form component with stable handlers
//   const ContentForm = React.memo(() => {
//     if (!selectedType) return null;
    
//     const handleTagInputKeyPress = useCallback((e: React.KeyboardEvent) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         handleAddTag();
//       }
//     }, [handleAddTag]);

//     const handleFormInputChange = useCallback((field: keyof ContentFormData) => 
//       (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
//         handleInputChange(field, value);
//       }, [handleInputChange]);
    
//     return (
//       <div className="space-y-4">
//         {(selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
//             <input 
//               type="url" 
//               value={formData.url || ''} 
//               onChange={handleFormInputChange('url')}
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="https://example.com" 
//               required 
//             />
//           </div>
//         )}
        
//         {(selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               Upload {selectedType === 'pdfs' ? 'PDF' : 'Image'}
//             </label>
//             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
//               <div className="space-y-1 text-center">
//                 {selectedType === 'pdfs' ? (
//                   <File className="mx-auto h-12 w-12 text-gray-500" />
//                 ) : (
//                   <Image className="mx-auto h-12 w-12 text-gray-500" />
//                 )}
//                 <div className="flex text-sm text-gray-400">
//                   <label 
//                     htmlFor="file-upload" 
//                     className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500"
//                   >
//                     <span>Upload a file</span>
//                     <input 
//                       id="file-upload" 
//                       name="file-upload" 
//                       type="file" 
//                       className="sr-only" 
//                       accept={selectedType === 'pdfs' ? '.pdf' : 'image/*'} 
//                       onChange={handleFileUpload} 
//                       required 
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 {formData.fileName && (
//                   <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                     <p className="text-gray-300">{formData.fileName}</p>
//                     <p className="text-xs text-gray-400">{formData.fileSize && formatFileSize(formData.fileSize)}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
        
//         {selectedType === 'playlists' && (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Number of Videos</label>
//               <input 
//                 type="number" 
//                 value={formData.videoCount || ''} 
//                 onChange={handleFormInputChange('videoCount')}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 min="0" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
//               <textarea 
//                 value={formData.about || ''} 
//                 onChange={handleFormInputChange('about')}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 rows={3} 
//                 required 
//               />
//             </div>
//           </>
//         )}
        
//         {selectedType === 'notes' && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
//             <textarea 
//               value={formData.content || ''} 
//               onChange={handleFormInputChange('content')}
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={4} 
//               required 
//             />
//           </div>
//         )}
        
//         {(selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">About / Description</label>
//             <textarea 
//               value={formData.about || ''} 
//               onChange={handleFormInputChange('about')}
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={3} 
//               required 
//             />
//           </div>
//         )}
        
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
//           <div className="flex gap-2">
//             <input 
//               type="text" 
//               value={tagInput} 
//               onChange={handleTagInputChange}
//               onKeyDown={handleTagInputKeyPress} 
//               ref={tagInputRef}
//               className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Add a tag and press Enter" 
//             />
//             <button 
//               type="button" 
//               onClick={handleAddTag} 
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
//             >
//               Add
//             </button>
//           </div>
//           {formData.tags && formData.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {formData.tags.map(tag => (
//                 <span key={tag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center gap-1">
//                   #{tag}
//                   <button 
//                     type="button" 
//                     onClick={() => handleRemoveTag(tag)} 
//                     className="hover:text-red-300"
//                   >
//                     &times;
//                   </button>
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="flex justify-end gap-3 pt-4">
//           <button 
//             type="button" 
//             onClick={() => setSelectedType(null)} 
//             className="px-4 py-2 text-gray-300 hover:text-white"
//           >
//             Back
//           </button>
//           <button 
//             type="button" 
//             onClick={handleSubmit} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Add Content
//           </button>
//         </div>
//       </div>
//     );
//   });

//   // Memoized sidebar component
//   const Sidebar = React.memo(() => (
//     <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700 flex flex-col">
//       <div className="flex items-center gap-2 mb-8">
//         <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
//           <Hash className="w-5 h-5 text-white" />
//         </div>
//         <h1 className="text-xl font-bold text-white">Second Brain</h1>
//       </div>
      
//       <nav className="space-y-2 flex-grow">
//         <button 
//           onClick={() => handleTabChange('all')} 
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//             activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//           }`}
//         >
//           <FileText className="w-4 h-4" /> All Contents
//         </button>
//         {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
//           <button 
//             key={id} 
//             onClick={() => handleTabChange(id)} 
//             className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//               activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//             }`}
//           >
//             <Icon className="w-4 h-4" /> {label}
//           </button>
//         ))}
//       </nav>
      
//       <div className="mt-4">
//         <button 
//           onClick={handleLogout} 
//           className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
//         >
//           <X className="w-4 h-4" /> Logout
//         </button>
//       </div>
//     </div>
//   ));

//   // Memoized preview panel component
//   const PreviewPanel = React.memo(() => {
//     if (!previewContent) return null;
    
//     return (
//       <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Preview</h3>
//           <button
//             onClick={() => setPreviewContent(null)}
//             className="text-gray-400 hover:text-white"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           <div>
//             <h4 className="font-medium text-gray-300 mb-2 capitalize">
//               {previewContent.type.replace('-', ' ')}
//             </h4>
//             {previewContent.type === 'notes' && (
//               <p className="text-sm text-gray-300 whitespace-pre-wrap">
//                 {(previewContent as Note).content}
//               </p>
//             )}
//             {(previewContent.type === 'tweaks' || previewContent.type === 'important-links') && (
//               <a 
//                 href={(previewContent as Tweaks | ImportantLink).url} 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
//               >
//                 {(previewContent as Tweaks | ImportantLink).url}
//               </a>
//             )}
//             {previewContent.type === 'important-links' && (
//               <p className="text-sm text-gray-300 mt-2">
//                 {(previewContent as ImportantLink).about}
//               </p>
//             )}
//           </div>
          
//           {previewContent.tags.length > 0 && (
//             <div>
//               <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
//               <div className="flex flex-wrap gap-1">
//                 {previewContent.tags.map(tag => (
//                   <span
//                     key={tag}
//                     onClick={() => handleTagSelect(tag)}
//                     className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                       selectedTag === tag
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
        
//         <div className="mt-4 text-xs text-gray-500">
//           Created: {new Date(previewContent.createdAt).toLocaleString()}
//         </div>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="flex">
//         <Sidebar />

//         {/* Main Content */}
//         <main className={`flex-1 p-6 transition-all duration-300 ${previewContent ? 'pr-0' : ''}`}>
//           <header className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold capitalize mb-2">
//                 {activeTab === 'all' ? 'All Contents' : activeTab.replace('-', ' ')}
//               </h2>
//               {selectedTag && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-400">Filtered by:</span>
//                   <span 
//                     onClick={() => setSelectedTag(null)} 
//                     className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
//                   >
//                     #{selectedTag} &times;
//                   </span>
//                 </div>
//               )}
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input 
//                   type="text" 
//                   placeholder="Search..." 
//                   value={searchTerm} 
//                   onChange={handleSearchChange}
//                   ref={searchInputRef}
//                   className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
//                 />
//               </div>
              
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
//                   showFilters || hasActiveFilters
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 <Filter className="w-4 h-4" />
//                 Filters
//                 {hasActiveFilters && (
//                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                     {[
//                       Object.keys(dateTimeFilter).length > 0,
//                       sortBy !== 'newest',
//                       selectedTag,
//                       searchTerm,
//                       contentFilter,
//                       activeTab !== 'all'
//                     ].filter(Boolean).length}
//                   </span>
//                 )}
//               </button>
              
//               <button 
//                 onClick={handleAddContent} 
//                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Content
//               </button>
//             </div>
//           </header>

//           {/* Filter Panel */}
//           {showFilters && <FilterPanel />}

//           {/* Content Grid */}
//           {isLoading ? (
//             <div className="text-center py-20 text-gray-400">
//               <div className="animate-pulse">Loading content...</div>
//             </div>
//           ) : filteredAndSortedContents.length > 0 ? (
//             <>
//               <div className="mb-4 text-sm text-gray-400">
//                 Showing {filteredAndSortedContents.length} of {contents.length} items
//               </div>
//               <div className={`grid gap-4 ${
//                 previewContent 
//                   ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' 
//                   : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//               }`}>
//                 {filteredAndSortedContents.map(content => (
//                   <ContentCard key={content.id} content={content} />
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p>
//                 {contents.length === 0 
//                   ? "No content found. Click \"Add Content\" to get started!" 
//                   : "No content matches your current filters. Try adjusting your search criteria."
//                 }
//               </p>
//             </div>
//           )}
//         </main>

//         <PreviewPanel />
//       </div>

//       {/* Preview Components */}
//       {imagePreview && (
//         <ImagePreview 
//           image={imagePreview} 
//           onClose={() => setImagePreview(null)} 
//         />
//       )}
      
//       {pdfPreview && (
//         <PDFPreview 
//           pdf={pdfPreview} 
//           onClose={() => setPdfPreview(null)} 
//         />
//       )}
      
//       {playlistPreview && (
//         <PlaylistPreview 
//           playlist={playlistPreview} 
//           onClose={() => setPlaylistPreview(null)} 
//         />
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">
//                 {selectedType ? `Add New ${selectedType.replace('-', ' ')}` : 'Choose Content Type'}
//               </h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             {!selectedType ? (
//               <div className="space-y-2">
//                 {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
//                   <button 
//                     key={id} 
//                     onClick={() => handleTypeSelect(id)} 
//                     className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
//                   >
//                     <Icon className="w-5 h-5 text-blue-400" /> 
//                     <span>{label}</span>
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <ContentForm />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SecondBrainApp;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; // Import the useAuth hook
import { 
  X, Plus, Edit3, PlayCircle, FileText, Link, Hash, Trash2, Copy, Check, 
  Search, File, Image, Filter, RotateCcw 
} from 'lucide-react';

// Import preview components
import ImagePreview from '../preview/ImagePreview';
import PDFPreview from '../preview/PDFPreview';
import PlaylistPreview from '../preview/PlaylistPreview';

// Interfaces
interface BaseContent {
  id: string;
  _id: string;
  type: 'tweaks' | 'playlists' | 'notes' | 'important-links' | 'pdfs' | 'images';
  createdAt: Date;
  tags: string[];
}

interface Tweaks extends BaseContent {
  type: 'tweaks';
  url: string;
}

interface Playlist extends BaseContent {
  type: 'playlists';
  url: string;
  videoCount: number;
  about: string;
}

interface Note extends BaseContent {
  type: 'notes';
  content: string;
}

interface ImportantLink extends BaseContent {
  type: 'important-links';
  url: string;
  about: string;
}

interface PDF extends BaseContent {
  type: 'pdfs';
  fileName: string;
  fileSize: number;
  fileData: string;
  about: string;
}

interface ImageContent extends BaseContent {
  type: 'images';
  fileName: string;
  fileSize: number;
  fileData: string;
  about: string;
}

type ContentItem = Tweaks | Playlist | Note | ImportantLink | PDF | ImageContent;

interface ContentFormData {
  url?: string;
  videoCount?: number;
  about?: string;
  content?: string;
  tags?: string[];
  fileName?: string;
  fileSize?: number;
  fileData?: string;
}

interface DateTimeFilter {
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  dateRange?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
}

const API_URL = 'http://localhost:5000/api/content/';

const SecondBrainApp: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentItem['type'] | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({});
  const [activeTab, setActiveTab] = useState<'all' | ContentItem['type']>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentFilter, setContentFilter] = useState('');
  
  // Preview states
  const [imagePreview, setImagePreview] = useState<ImageContent | null>(null);
  const [pdfPreview, setPdfPreview] = useState<PDF | null>(null);
  const [playlistPreview, setPlaylistPreview] = useState<Playlist | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({});
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  
  const contentTypes = [
    { id: 'tweaks' as const, label: 'Tweaks', icon: Edit3 },
    { id: 'playlists' as const, label: 'Playlists', icon: PlayCircle },
    { id: 'notes' as const, label: 'Notes', icon: FileText },
    { id: 'important-links' as const, label: 'Important Links', icon: Link },
    { id: 'pdfs' as const, label: 'PDFs', icon: File },
    { id: 'images' as const, label: 'Images', icon: Image },
  ];

  const dateRangeOptions = [
    { value: 'today' as const, label: 'Today' },
    { value: 'yesterday' as const, label: 'Yesterday' },
    { value: 'this-week' as const, label: 'This Week' },
    { value: 'last-week' as const, label: 'Last Week' },
    { value: 'this-month' as const, label: 'This Month' },
    { value: 'last-month' as const, label: 'Last Month' },
    { value: 'custom' as const, label: 'Custom Range' },
  ];

  // ESC key handler for previews
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setImagePreview(null);
        setPdfPreview(null);
        setPlaylistPreview(null);
        setPreviewContent(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Helper function to get date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date() };
      case 'last-week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
        return { start: lastWeekStart, end: lastWeekEnd };
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: new Date() };
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: lastMonthStart, end: lastMonthEnd };
      default:
        return null;
    }
  };

  // Enhanced filter and sort contents function
  const getFilteredAndSortedContents = () => {
    let filtered = [...contents];

    // Apply tab filter first
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(item => item.tags.includes(selectedTag));
    }

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        switch (item.type) {
          case 'tweaks':
          case 'playlists':
          case 'important-links':
            return item.url.toLowerCase().includes(searchLower) ||
                   ('about' in item && item.about.toLowerCase().includes(searchLower));
          case 'notes':
            return item.content.toLowerCase().includes(searchLower);
          case 'pdfs':
          case 'images':
            return item.fileName.toLowerCase().includes(searchLower) ||
                   item.about.toLowerCase().includes(searchLower);
          default:
            return true;
        }
      });
    }

    // Apply content filter
    if (contentFilter) {
      const contentFilterLower = contentFilter.toLowerCase();
      filtered = filtered.filter(item => {
        switch (item.type) {
          case 'tweaks':
          case 'playlists':
          case 'important-links':
            return item.url.toLowerCase().includes(contentFilterLower) ||
                   ('about' in item && item.about.toLowerCase().includes(contentFilterLower));
          case 'notes':
            return item.content.toLowerCase().includes(contentFilterLower);
          case 'pdfs':
          case 'images':
            return item.fileName.toLowerCase().includes(contentFilterLower) ||
                   item.about.toLowerCase().includes(contentFilterLower);
          default:
            return true;
        }
      });
    }

    // Apply date/time filters
    if (dateTimeFilter.dateRange && dateTimeFilter.dateRange !== 'custom') {
      const range = getDateRange(dateTimeFilter.dateRange);
      if (range) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= range.start && itemDate < range.end;
        });
      }
    } else if (dateTimeFilter.dateFrom || dateTimeFilter.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        
        if (dateTimeFilter.dateFrom) {
          const fromDate = new Date(dateTimeFilter.dateFrom);
          if (itemDate < fromDate) return false;
        }
        
        if (dateTimeFilter.dateTo) {
          const toDate = new Date(dateTimeFilter.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (itemDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Apply time filters
    if (dateTimeFilter.timeFrom || dateTimeFilter.timeTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        const itemTime = itemDate.getHours() * 60 + itemDate.getMinutes();
        
        if (dateTimeFilter.timeFrom) {
          const [hours, minutes] = dateTimeFilter.timeFrom.split(':').map(Number);
          const fromTime = hours * 60 + minutes;
          if (itemTime < fromTime) return false;
        }
        
        if (dateTimeFilter.timeTo) {
          const [hours, minutes] = dateTimeFilter.timeTo.split(':').map(Number);
          const toTime = hours * 60 + minutes;
          if (itemTime > toTime) return false;
        }
        
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alphabetical':
          const getContentForSort = (item: ContentItem) => {
            switch (item.type) {
              case 'notes':
                return item.content;
              case 'tweaks':
              case 'playlists':
              case 'important-links':
                return item.url;
              case 'pdfs':
              case 'images':
                return item.fileName;
              default:
                return '';
            }
          };
          return getContentForSort(a).localeCompare(getContentForSort(b));
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Fetch data from backend with proper error handling
  useEffect(() => {
    const fetchContent = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        
        const response = await axios.get(API_URL, config);
        console.log('API Response:', response.data);
        
        // Handle different response structures
        let dataArray: any[] = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (response.data && Array.isArray(response.data.contents)) {
          dataArray = response.data.contents;
        } else {
          console.warn('Unexpected API response structure:', response.data);
          dataArray = [];
        }
        
        // Map data to include id field
        const mappedData = dataArray.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          createdAt: new Date(item.createdAt),
        }));
        
        setContents(mappedData);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            logout();
            navigate('/login');
          } else if (error.response?.status === 404) {
            setContents([]);
          } else {
            console.error('API Error:', error.response?.data);
            setContents([]);
          }
        } else {
          console.error('Network Error:', error);
          setContents([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [navigate, token, logout]);

  const handleAddContent = () => {
    setShowModal(true);
    setSelectedType(null);
    setFormData({ tags: [] });
    setTagInput('');
  };

  const handleTypeSelect = (type: ContentItem['type']) => {
    setSelectedType(type);
    setFormData({ tags: [] });
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!selectedType || !token) return;
    
    // Validate required fields
    if ((selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && !formData.url) {
      alert('URL is required');
      return;
    }
    if (selectedType === 'playlists' && (!formData.videoCount || !formData.about)) {
      alert('Video count and description are required for playlists');
      return;
    }
    if (selectedType === 'notes' && !formData.content) {
      alert('Note content is required');
      return;
    }
    if ((selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && !formData.about) {
      alert('Description is required');
      return;
    }
    if ((selectedType === 'pdfs' || selectedType === 'images') && (!formData.fileName || !formData.fileData)) {
      alert('File upload is required');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newContentData = { type: selectedType, ...formData };
      const response = await axios.post(API_URL, newContentData, config);
      console.log('Add content response:', response.data);
      
      // Handle different response structures
      let newContent;
      if (response.data && response.data._id) {
        newContent = { ...response.data, id: response.data._id, createdAt: new Date(response.data.createdAt) };
      } else if (response.data.data && response.data.data._id) {
        newContent = { ...response.data.data, id: response.data.data._id, createdAt: new Date(response.data.data.createdAt) };
      } else if (response.data.content && response.data.content._id) {
        newContent = { ...response.data.content, id: response.data.content._id, createdAt: new Date(response.data.content.createdAt) };
      } else {
        console.warn('Unexpected response structure:', response.data);
        window.location.reload();
        return;
      }
      
      setContents(prev => [newContent, ...prev]);
      
      setShowModal(false);
      setSelectedType(null);
      setFormData({ tags: [] });
      setTagInput('');
    } catch (error) {
      console.error('Failed to add content:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          console.error('API Error:', error.response?.data);
          alert(`Could not add content: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else {
        alert('Could not add content. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}${id}`, config);
      setContents(contents.filter(content => content.id !== id));
      if (previewContent?.id === id) {
        setPreviewContent(null);
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        alert('Could not delete content.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearAllFilters = () => {
    setDateTimeFilter({});
    setSortBy('newest');
    setSelectedTag(null);
    setSearchTerm('');
    setContentFilter('');
    setActiveTab('all');
  };

  const hasActiveFilters = () => {
    return Object.keys(dateTimeFilter).length > 0 || 
           sortBy !== 'newest' || 
           selectedTag || 
           searchTerm || 
           contentFilter || 
           activeTab !== 'all';
  };

  const handleInputChange = (field: keyof ContentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        fileData: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getContentIcon = (type: ContentItem['type']) => {
    const iconMap = {
      tweaks: Edit3,
      playlists: PlayCircle,
      notes: FileText,
      'important-links': Link,
      pdfs: File,
      images: Image,
    };
    return iconMap[type];
  };

  const renderFilterPanel = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search in URLs, notes, file names, descriptions..."
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Search within: URLs (for tweaks/playlists/links), note content, file names, and descriptions
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
          <select
            value={dateTimeFilter.dateRange || ''}
            onChange={(e) => setDateTimeFilter(prev => ({ 
              ...prev, 
              dateRange: e.target.value as DateTimeFilter['dateRange'],
              dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
              dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
            }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {dateTimeFilter.dateRange === 'custom' && (
          <>
            <div className="flex-1 min-w-40">
              <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={dateTimeFilter.dateFrom || ''}
                onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={dateTimeFilter.dateTo || ''}
                onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
          <input
            type="time"
            value={dateTimeFilter.timeFrom || ''}
            onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
          <input
            type="time"
            value={dateTimeFilter.timeTo || ''}
            onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Active Filters:</span>
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {contentFilter && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Content: "{contentFilter}"
              </span>
            )}
            {activeTab !== 'all' && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                Type: {activeTab.replace('-', ' ')}
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                Tag: #{selectedTag}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            {dateTimeFilter.dateRange && (
              <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                Date: {dateRangeOptions.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                Sort: {sortBy}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderContentCard = (content: ContentItem) => {
    const Icon = getContentIcon(content.type);
    const handleCardClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) {
        return;
      }
      
      if (content.type === 'images') {
        setImagePreview(content as ImageContent);
      } else if (content.type === 'pdfs') {
        setPdfPreview(content as PDF);
      } else if (content.type === 'playlists') {
        setPlaylistPreview(content as Playlist);
      } else {
        setPreviewContent(content);
      }
    };
    
    return (
      <div
        key={content.id}
        className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative group flex flex-col ${
          (content.type === 'pdfs' || content.type === 'images' || content.type === 'playlists') ? 'cursor-pointer hover:border-blue-500' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400 capitalize">
              {content.type.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-gray-500 block">
                {new Date(content.createdAt).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500 block">
                {new Date(content.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(content.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-grow space-y-3">
          {content.type === 'tweaks' && (
            <div className="flex items-center gap-2">
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {content.url}
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(content.url);
                }}
                className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
                title="Copy URL"
              >
                {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          {content.type === 'playlists' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {content.url}
                </a>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(content.url);
                  }} 
                  className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
                  title="Copy URL"
                >
                  {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-300">{content.about}</p>
              <p className="text-xs text-gray-500">Videos: {content.videoCount}</p>
            </div>
          )}
          {content.type === 'notes' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{content.content}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(content.content);
                }}
                className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
                title="Copy content"
              >
                {copiedText === content.content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
          )}
          {content.type === 'important-links' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {content.url}
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(content.url);
                  }}
                  className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
                  title="Copy URL"
                >
                  {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-300">{content.about}</p>
            </div>
          )}
          {content.type === 'pdfs' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-md">
                <File className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">{content.about}</p>
              <div className="text-center text-xs text-blue-400 mt-2">Click to preview PDF</div>
            </div>
          )}
          {content.type === 'images' && (
            <div className="space-y-2">
              <div className="relative">
                <img src={content.fileData} alt={content.fileName} className="w-full h-48 object-cover rounded-md" />
              </div>
              <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
              <p className="text-sm text-gray-300">{content.about}</p>
              <div className="text-center text-xs text-blue-400 mt-2">Click to preview image</div>
            </div>
          )}
        </div>
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-700 pt-3">
            {content.tags.map(tag => (
              <span
                key={tag}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedTag(selectedTag === tag ? null : tag); 
                }}
                className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    if (!selectedType) return null;
    
    return (
      <div className="space-y-4">
        {(selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
            <input 
              type="url" 
              value={formData.url || ''} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="https://example.com" 
              required 
            />
          </div>
        )}
        {(selectedType === 'pdfs' || selectedType === 'images') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload {selectedType === 'pdfs' ? 'PDF' : 'Image'}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {selectedType === 'pdfs' ? (
                  <File className="mx-auto h-12 w-12 text-gray-500" />
                ) : (
                  <Image className="mx-auto h-12 w-12 text-gray-500" />
                )}
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
                    <span className="px-2 py-1">Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept={selectedType === 'pdfs' ? '.pdf' : 'image/*'} 
                      onChange={handleFileUpload} 
                      required 
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {formData.fileName && (
                  <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
                    <p className="text-gray-300">{formData.fileName}</p>
                    <p className="text-gray-400 text-xs">{formData.fileSize ? formatFileSize(formData.fileSize) : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedType === 'playlists' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Videos</label>
              <input 
                type="number" 
                value={formData.videoCount || ''} 
                onChange={(e) => handleInputChange('videoCount', parseInt(e.target.value) || 0)} 
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                min="0" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
              <textarea 
                value={formData.about || ''} 
                onChange={(e) => handleInputChange('about', e.target.value)} 
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows={3} 
                required 
              />
            </div>
          </>
        )}
        {selectedType === 'notes' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
            <textarea 
              value={formData.content || ''} 
              onChange={(e) => handleInputChange('content', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={4} 
              required 
            />
          </div>
        )}
        {(selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">About / Description</label>
            <textarea 
              value={formData.about || ''} 
              onChange={(e) => handleInputChange('about', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={3} 
              required 
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              onKeyDown={handleTagInputKeyPress} 
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Add a tag and press Enter" 
            />
            <button 
              type="button" 
              onClick={handleAddTag} 
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Add
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center gap-1">
                  #{tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)} 
                    className="hover:text-red-300"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => setSelectedType(null)} 
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Back
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Content
          </button>
        </div>
      </div>
    );
  };

  // Get filtered contents
  const filteredContents = getFilteredAndSortedContents();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Second Brain</h1>
          </div>
          <nav className="space-y-2 flex-grow">
            <button 
              onClick={() => { setActiveTab('all'); setSelectedTag(null); }} 
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" /> All Contents
            </button>
            {contentTypes.map(({ id, label, icon: Icon }) => (
              <button 
                key={id} 
                onClick={() => { setActiveTab(id); setSelectedTag(null); }} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
          <div className="mt-4">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
            >
              <X className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${previewContent ? 'pr-0' : ''}`}>
          <header className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold capitalize mb-2">
                {activeTab === 'all' ? 'All Contents' : activeTab.replace('-', ' ')}
              </h2>
              {selectedTag && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Filtered by:</span>
                  <span 
                    onClick={() => setSelectedTag(null)} 
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
                  >
                    #{selectedTag} &times;
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  showFilters || hasActiveFilters()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters() && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {Object.keys(dateTimeFilter).length + 
                     (sortBy !== 'newest' ? 1 : 0) + 
                     (selectedTag ? 1 : 0) + 
                     (searchTerm ? 1 : 0) + 
                     (contentFilter ? 1 : 0) + 
                     (activeTab !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
              <button 
                onClick={handleAddContent} 
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Content
              </button>
            </div>
          </header>

          {/* Filter Panel */}
          {showFilters && renderFilterPanel()}

          {/* Content Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-gray-400">Loading content...</div>
          ) : filteredContents.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredContents.length} of {contents.length} items
              </div>
              <div className={`grid gap-4 ${previewContent ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredContents.map(renderContentCard)}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>
                {contents.length === 0 
                  ? "No content found. Click \"Add Content\" to get started!" 
                  : "No content matches your current filters. Try adjusting your search criteria."
                }
              </p>
            </div>
          )}
        </main>

        {/* Preview Panel - Only for notes and links */}
        {previewContent && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-300 mb-2 capitalize">
                  {previewContent.type.replace('-', ' ')}
                </h4>
                {previewContent.type === 'notes' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{(previewContent as Note).content}</p>
                    <button
                      onClick={() => handleCopy((previewContent as Note).content)}
                      className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
                      title="Copy content"
                    >
                      {copiedText === (previewContent as Note).content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                )}
                {(previewContent.type === 'tweaks' || previewContent.type === 'important-links') && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <a 
                        href={(previewContent as Tweaks | ImportantLink).url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
                      >
                        {(previewContent as Tweaks | ImportantLink).url}
                      </a>
                      <button
                        onClick={() => handleCopy((previewContent as Tweaks | ImportantLink).url)}
                        className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
                        title="Copy URL"
                      >
                        {copiedText === (previewContent as Tweaks | ImportantLink).url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    {previewContent.type === 'important-links' && (
                      <p className="text-sm text-gray-300">{(previewContent as ImportantLink).about}</p>
                    )}
                  </div>
                )}
              </div>
              
              {previewContent.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewContent.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                          selectedTag === tag
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Created: {new Date(previewContent.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Preview Components */}
      {imagePreview && (
        <ImagePreview 
          image={imagePreview} 
          onClose={() => setImagePreview(null)} 
        />
      )}
      
      {pdfPreview && (
        <PDFPreview 
          pdf={pdfPreview} 
          onClose={() => setPdfPreview(null)} 
        />
      )}
      
      {playlistPreview && (
        <PlaylistPreview 
          playlist={playlistPreview} 
          onClose={() => setPlaylistPreview(null)} 
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedType ? `Add New ${selectedType.replace('-', ' ')}` : 'Choose Content Type'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {!selectedType ? (
              <div className="space-y-2">
                {contentTypes.map(({ id, label, icon: Icon }) => (
                  <button 
                    key={id} 
                    onClick={() => handleTypeSelect(id)} 
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-blue-400" /> 
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ) : (
              renderForm()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondBrainApp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../App'; // Import the useAuth hook
// import { 
//   X, Plus, Edit3, PlayCircle, FileText, Link, Hash, Trash2, Copy, Check, 
//   Search, File, Image, Filter, RotateCcw 
// } from 'lucide-react';

// // Import preview components
// import ImagePreview from '../preview/ImagePreview';
// import PDFPreview from '../preview/PDFPreview';
// import PlaylistPreview from '../preview/PlaylistPreview';

// // Interfaces
// interface BaseContent {
//   id: string;
//   _id: string;
//   type: 'tweaks' | 'playlists' | 'notes' | 'important-links' | 'pdfs' | 'images';
//   createdAt: Date;
//   tags: string[];
// }

// interface Tweaks extends BaseContent {
//   type: 'tweaks';
//   url: string;
// }

// interface Playlist extends BaseContent {
//   type: 'playlists';
//   url: string;
//   videoCount: number;
//   about: string;
// }

// interface Note extends BaseContent {
//   type: 'notes';
//   content: string;
// }

// interface ImportantLink extends BaseContent {
//   type: 'important-links';
//   url: string;
//   about: string;
// }

// interface PDF extends BaseContent {
//   type: 'pdfs';
//   fileName: string;
//   fileSize: number;
//   about: string;
// }

// interface ImageContent extends BaseContent {
//   type: 'images';
//   fileName: string;
//   fileSize: number;
//   about: string;
// }

// type ContentItem = Tweaks | Playlist | Note | ImportantLink | PDF | ImageContent;

// interface ContentFormData {
//   url?: string;
//   videoCount?: number;
//   about?: string;
//   content?: string;
//   tags?: string[];
//   fileName?: string;
//   fileSize?: number;
// }

// interface DateTimeFilter {
//   dateFrom?: string;
//   dateTo?: string;
//   timeFrom?: string;
//   timeTo?: string;
//   dateRange?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
// }

// const API_URL = 'http://localhost:5000/api/content/';

// const SecondBrainApp: React.FC = () => {
//   const [contents, setContents] = useState<ContentItem[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<ContentItem['type'] | null>(null);
//   const [formData, setFormData] = useState<ContentFormData>({});
//   const [activeTab, setActiveTab] = useState<'all' | ContentItem['type']>('all');
//   const [copiedText, setCopiedText] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [tagInput, setTagInput] = useState('');
//   const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [contentFilter, setContentFilter] = useState('');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
//   // Preview states
//   const [imagePreview, setImagePreview] = useState<ImageContent | null>(null);
//   const [pdfPreview, setPdfPreview] = useState<PDF | null>(null);
//   const [playlistPreview, setPlaylistPreview] = useState<Playlist | null>(null);
  
//   // Filter states
//   const [showFilters, setShowFilters] = useState(false);
//   const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({});
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
//   const navigate = useNavigate();
//   const { logout, token } = useAuth();
  
//   const contentTypes = [
//     { id: 'tweaks' as const, label: 'Tweaks', icon: Edit3 },
//     { id: 'playlists' as const, label: 'Playlists', icon: PlayCircle },
//     { id: 'notes' as const, label: 'Notes', icon: FileText },
//     { id: 'important-links' as const, label: 'Important Links', icon: Link },
//     { id: 'pdfs' as const, label: 'PDFs', icon: File },
//     { id: 'images' as const, label: 'Images', icon: Image },
//   ];

//   const dateRangeOptions = [
//     { value: 'today' as const, label: 'Today' },
//     { value: 'yesterday' as const, label: 'Yesterday' },
//     { value: 'this-week' as const, label: 'This Week' },
//     { value: 'last-week' as const, label: 'Last Week' },
//     { value: 'this-month' as const, label: 'This Month' },
//     { value: 'last-month' as const, label: 'Last Month' },
//     { value: 'custom' as const, label: 'Custom Range' },
//   ];

//   // ESC key handler for previews
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setImagePreview(null);
//         setPdfPreview(null);
//         setPlaylistPreview(null);
//         setPreviewContent(null);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => {
//       document.removeEventListener('keydown', handleEscKey);
//     };
//   }, []);

//   // Helper function to get file preview URL
//   const getFilePreviewUrl = (contentId: string) => {
//     return `${API_URL}${contentId}/preview`;
//   };

//   // Helper function to get date range
//   const getDateRange = (range: string) => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     switch (range) {
//       case 'today':
//         return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
//       case 'yesterday':
//         const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
//         return { start: yesterday, end: today };
//       case 'this-week':
//         const weekStart = new Date(today);
//         weekStart.setDate(today.getDate() - today.getDay());
//         return { start: weekStart, end: new Date() };
//       case 'last-week':
//         const lastWeekStart = new Date(today);
//         lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
//         const lastWeekEnd = new Date(lastWeekStart);
//         lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
//         return { start: lastWeekStart, end: lastWeekEnd };
//       case 'this-month':
//         const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         return { start: monthStart, end: new Date() };
//       case 'last-month':
//         const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
//         return { start: lastMonthStart, end: lastMonthEnd };
//       default:
//         return null;
//     }
//   };

//   // Enhanced filter and sort contents function
//   const getFilteredAndSortedContents = () => {
//     let filtered = [...contents];

//     // Apply tab filter first
//     if (activeTab !== 'all') {
//       filtered = filtered.filter(item => item.type === activeTab);
//     }

//     // Apply tag filter
//     if (selectedTag) {
//       filtered = filtered.filter(item => item.tags.includes(selectedTag));
//     }

//     // Apply search term filter
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(searchLower) ||
//                    ('about' in item && item.about.toLowerCase().includes(searchLower));
//           case 'notes':
//             return item.content.toLowerCase().includes(searchLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(searchLower) ||
//                    item.about.toLowerCase().includes(searchLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply content filter
//     if (contentFilter) {
//       const contentFilterLower = contentFilter.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(contentFilterLower) ||
//                    ('about' in item && item.about.toLowerCase().includes(contentFilterLower));
//           case 'notes':
//             return item.content.toLowerCase().includes(contentFilterLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(contentFilterLower) ||
//                    item.about.toLowerCase().includes(contentFilterLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply date/time filters
//     if (dateTimeFilter.dateRange && dateTimeFilter.dateRange !== 'custom') {
//       const range = getDateRange(dateTimeFilter.dateRange);
//       if (range) {
//         filtered = filtered.filter(item => {
//           const itemDate = new Date(item.createdAt);
//           return itemDate >= range.start && itemDate < range.end;
//         });
//       }
//     } else if (dateTimeFilter.dateFrom || dateTimeFilter.dateTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
        
//         if (dateTimeFilter.dateFrom) {
//           const fromDate = new Date(dateTimeFilter.dateFrom);
//           if (itemDate < fromDate) return false;
//         }
        
//         if (dateTimeFilter.dateTo) {
//           const toDate = new Date(dateTimeFilter.dateTo);
//           toDate.setHours(23, 59, 59, 999);
//           if (itemDate > toDate) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply time filters
//     if (dateTimeFilter.timeFrom || dateTimeFilter.timeTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         const itemTime = itemDate.getHours() * 60 + itemDate.getMinutes();
        
//         if (dateTimeFilter.timeFrom) {
//           const [hours, minutes] = dateTimeFilter.timeFrom.split(':').map(Number);
//           const fromTime = hours * 60 + minutes;
//           if (itemTime < fromTime) return false;
//         }
        
//         if (dateTimeFilter.timeTo) {
//           const [hours, minutes] = dateTimeFilter.timeTo.split(':').map(Number);
//           const toTime = hours * 60 + minutes;
//           if (itemTime > toTime) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         case 'oldest':
//           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//         case 'alphabetical':
//           const getContentForSort = (item: ContentItem) => {
//             switch (item.type) {
//               case 'notes':
//                 return item.content;
//               case 'tweaks':
//               case 'playlists':
//               case 'important-links':
//                 return item.url;
//               case 'pdfs':
//               case 'images':
//                 return item.fileName;
//               default:
//                 return '';
//             }
//           };
//           return getContentForSort(a).localeCompare(getContentForSort(b));
//         default:
//           return 0;
//       }
//     });

//     return filtered;
//   };

//   // Fetch data from backend with proper error handling
//   useEffect(() => {
//     const fetchContent = async () => {
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       setIsLoading(true);
      
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//         };
        
//         const response = await axios.get(API_URL, config);
//         console.log('API Response:', response.data);
        
//         // Handle different response structures
//         let dataArray: any[] = [];
//         if (Array.isArray(response.data)) {
//           dataArray = response.data;
//         } else if (response.data && Array.isArray(response.data.data)) {
//           dataArray = response.data.data;
//         } else if (response.data && Array.isArray(response.data.contents)) {
//           dataArray = response.data.contents;
//         } else {
//           console.warn('Unexpected API response structure:', response.data);
//           dataArray = [];
//         }
        
//         // Map data to include id field
//         const mappedData = dataArray.map((item: any) => ({
//           ...item,
//           id: item._id || item.id,
//           createdAt: new Date(item.createdAt),
//         }));
        
//         setContents(mappedData);
//       } catch (error) {
//         console.error('Failed to fetch content:', error);
//         if (axios.isAxiosError(error)) {
//           if (error.response?.status === 401) {
//             logout();
//             navigate('/login');
//           } else if (error.response?.status === 404) {
//             setContents([]);
//           } else {
//             console.error('API Error:', error.response?.data);
//             setContents([]);
//           }
//         } else {
//           console.error('Network Error:', error);
//           setContents([]);
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchContent();
//   }, [navigate, token, logout]);

//   const handleAddContent = () => {
//     setShowModal(true);
//     setSelectedType(null);
//     setFormData({ tags: [] });
//     setTagInput('');
//     setSelectedFile(null);
//   };

//   const handleTypeSelect = (type: ContentItem['type']) => {
//     setSelectedType(type);
//     setFormData({ tags: [] });
//     setTagInput('');
//     setSelectedFile(null);
//   };

//   const handleSubmit = async () => {
//     if (!selectedType || !token) return;
    
//     // Validate required fields
//     if ((selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && !formData.url) {
//       alert('URL is required');
//       return;
//     }
//     if (selectedType === 'playlists' && (!formData.videoCount || !formData.about)) {
//       alert('Video count and description are required for playlists');
//       return;
//     }
//     if (selectedType === 'notes' && !formData.content) {
//       alert('Note content is required');
//       return;
//     }
//     if ((selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && !formData.about) {
//       alert('Description is required');
//       return;
//     }
//     if ((selectedType === 'pdfs' || selectedType === 'images') && !selectedFile) {
//       alert('File upload is required');
//       return;
//     }

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
      
//       // Create FormData for file uploads
//       const submitData = new FormData();
//       submitData.append('type', selectedType);
      
//       // Add non-file fields
//       if (formData.url) submitData.append('url', formData.url);
//       if (formData.videoCount) submitData.append('videoCount', formData.videoCount.toString());
//       if (formData.about) submitData.append('about', formData.about);
//       if (formData.content) submitData.append('content', formData.content);
//       if (formData.tags && formData.tags.length > 0) {
//         submitData.append('tags', JSON.stringify(formData.tags));
//       }
      
//       // Add file if present
//       if (selectedFile) {
//         submitData.append('file', selectedFile);
//       }

//       const response = await axios.post(API_URL, submitData, {
//         ...config,
//         headers: {
//           ...config.headers,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       console.log('Add content response:', response.data);
      
//       // Handle different response structures
//       let newContent;
//       if (response.data && response.data._id) {
//         newContent = { ...response.data, id: response.data._id, createdAt: new Date(response.data.createdAt) };
//       } else if (response.data.data && response.data.data._id) {
//         newContent = { ...response.data.data, id: response.data.data._id, createdAt: new Date(response.data.data.createdAt) };
//       } else if (response.data.content && response.data.content._id) {
//         newContent = { ...response.data.content, id: response.data.content._id, createdAt: new Date(response.data.content.createdAt) };
//       } else {
//         console.warn('Unexpected response structure:', response.data);
//         window.location.reload();
//         return;
//       }
      
//       setContents(prev => [newContent, ...prev]);
      
//       setShowModal(false);
//       setSelectedType(null);
//       setFormData({ tags: [] });
//       setTagInput('');
//       setSelectedFile(null);
//     } catch (error) {
//       console.error('Failed to add content:', error);
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           console.error('API Error:', error.response?.data);
//           alert(`Could not add content: ${error.response?.data?.message || 'Unknown error'}`);
//         }
//       } else {
//         alert('Could not add content. Please try again.');
//       }
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!token) return;

//     if (!window.confirm("Are you sure you want to delete this item?")) return;

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.delete(`${API_URL}${id}`, config);
//       setContents(contents.filter(content => content.id !== id));
//       if (previewContent?.id === id) {
//         setPreviewContent(null);
//       }
//     } catch (error) {
//       console.error('Failed to delete content:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         logout();
//         navigate('/login');
//       } else {
//         alert('Could not delete content.');
//       }
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const clearAllFilters = () => {
//     setDateTimeFilter({});
//     setSortBy('newest');
//     setSelectedTag(null);
//     setSearchTerm('');
//     setContentFilter('');
//     setActiveTab('all');
//   };

//   const hasActiveFilters = () => {
//     return Object.keys(dateTimeFilter).length > 0 || 
//            sortBy !== 'newest' || 
//            selectedTag || 
//            searchTerm || 
//            contentFilter || 
//            activeTab !== 'all';
//   };

//   const handleInputChange = (field: keyof ContentFormData, value: string | number) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleCopy = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedText(text);
//       setTimeout(() => setCopiedText(null), 2000);
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//     }
//   };

//   const handleAddTag = () => {
//     if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...(prev.tags || []), tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
//     }));
//   };

//   const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleAddTag();
//     }
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setSelectedFile(file);
//     setFormData(prev => ({
//       ...prev,
//       fileName: file.name,
//       fileSize: file.size,
//     }));
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getContentIcon = (type: ContentItem['type']) => {
//     const iconMap = {
//       tweaks: Edit3,
//       playlists: PlayCircle,
//       notes: FileText,
//       'important-links': Link,
//       pdfs: File,
//       images: Image,
//     };
//     return iconMap[type];
//   };

//   // Create enhanced content objects for previews
//   const createEnhancedContent = (content: ContentItem) => {
//     if (content.type === 'images' || content.type === 'pdfs') {
//       return {
//         ...content,
//         fileData: getFilePreviewUrl(content.id), // Use the preview URL instead
//         previewUrl: getFilePreviewUrl(content.id)
//       };
//     }
//     return content;
//   };

//   const renderFilterPanel = () => (
//     <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search in URLs, notes, file names, descriptions..."
//             value={contentFilter}
//             onChange={(e) => setContentFilter(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <p className="text-xs text-gray-500 mt-1">
//           Search within: URLs (for tweaks/playlists/links), note content, file names, and descriptions
//         </p>
//       </div>
      
//       <div className="flex flex-wrap gap-4">
//         <div className="flex-1 min-w-48">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
//           <select
//             value={dateTimeFilter.dateRange || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ 
//               ...prev, 
//               dateRange: e.target.value as DateTimeFilter['dateRange'],
//               dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
//               dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
//             }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Time</option>
//             {dateRangeOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {dateTimeFilter.dateRange === 'custom' && (
//           <>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateFrom || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateTo || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </>
//         )}

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeFrom || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeTo || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//             <option value="alphabetical">Alphabetical</option>
//           </select>
//         </div>
//       </div>

//       {hasActiveFilters() && (
//         <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-300">Active Filters:</span>
//             <button
//               onClick={clearAllFilters}
//               className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//             >
//               <RotateCcw className="w-3 h-3" />
//               Clear All
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {contentFilter && (
//               <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
//                 Content: "{contentFilter}"
//               </span>
//             )}
//             {activeTab !== 'all' && (
//               <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
//                 Type: {activeTab.replace('-', ' ')}
//               </span>
//             )}
//             {selectedTag && (
//               <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                 Tag: #{selectedTag}
//               </span>
//             )}
//             {searchTerm && (
//               <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
//                 Search: "{searchTerm}"
//               </span>
//             )}
//             {dateTimeFilter.dateRange && (
//               <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
//                 Date: {dateRangeOptions.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
//               </span>
//             )}
//             {sortBy !== 'newest' && (
//               <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
//                 Sort: {sortBy}
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderContentCard = (content: ContentItem) => {
//     const Icon = getContentIcon(content.type);
//     const handleCardClick = (e: React.MouseEvent) => {
//       if ((e.target as HTMLElement).closest('button, a')) {
//         return;
//       }
      
//       if (content.type === 'images') {
//         const enhancedContent = createEnhancedContent(content);
//         setImagePreview(enhancedContent as ImageContent & { fileData: string; previewUrl: string });
//       } else if (content.type === 'pdfs') {
//         const enhancedContent = createEnhancedContent(content);
//         setPdfPreview(enhancedContent as PDF & { fileData: string; previewUrl: string });
//       } else if (content.type === 'playlists') {
//         setPlaylistPreview(content as Playlist);
//       } else {
//         setPreviewContent(content);
//       }
//     };
    
//     return (
//       <div
//         key={content.id}
//         className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative group flex flex-col ${
//           (content.type === 'pdfs' || content.type === 'images' || content.type === 'playlists') ? 'cursor-pointer hover:border-blue-500' : ''
//         }`}
//         onClick={handleCardClick}
//       >
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Icon className="w-5 h-5 text-blue-400" />
//             <span className="text-sm text-gray-400 capitalize">
//               {content.type.replace('-', ' ')}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="text-right">
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleDateString()}
//               </span>
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleTimeString()}
//               </span>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDelete(content.id);
//               }}
//               className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
//               title="Delete"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//         <div className="flex-grow space-y-3">
//           {content.type === 'tweaks' && (
//             <div className="flex items-center gap-2">
//               <a
//                 href={content.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {content.url}
//               </a>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.url);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                 title="Copy URL"
//               >
//                 {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//               </button>
//             </div>
//           )}
//           {content.type === 'playlists' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <p className="text-xs text-gray-500">Videos: {content.videoCount}</p>
//             </div>
//           )}
//           {content.type === 'notes' && (
//             <div className="space-y-2">
//               <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{content.content}</p>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.content);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
//                 title="Copy content"
//               >
//                 {copiedText === content.content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
//                 Copy
//               </button>
//             </div>
//           )}
//           {content.type === 'important-links' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a
//                   href={content.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }}
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
//           {content.type === 'pdfs' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-md">
//                 <File className="w-8 h-8 text-red-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//                   <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview PDF</div>
//             </div>
//           )}
//           {content.type === 'images' && (
//             <div className="space-y-2">
//               <div className="relative">
//                 <img 
//                   src={getFilePreviewUrl(content.id)} 
//                   alt={content.fileName} 
//                   className="w-full h-48 object-cover rounded-md"
//                   onError={(e) => {
//                     // Fallback if preview URL fails
//                     e.currentTarget.src = '/api/placeholder-image.png';
//                   }}
//                 />
//               </div>
//               <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//               <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview image</div>
//             </div>
//           )}
//         </div>
//         {content.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-700 pt-3">
//             {content.tags.map(tag => (
//               <span
//                 key={tag}
//                 onClick={(e) => { 
//                   e.stopPropagation(); 
//                   setSelectedTag(selectedTag === tag ? null : tag); 
//                 }}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                   selectedTag === tag
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderForm = () => {
//     if (!selectedType) return null;
    
//     return (
//       <div className="space-y-4">
//         {(selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
//             <input 
//               type="url" 
//               value={formData.url || ''} 
//               onChange={(e) => handleInputChange('url', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="https://example.com" 
//               required 
//             />
//           </div>
//         )}
//         {(selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Upload {selectedType === 'pdfs' ? 'PDF' : 'Image'}</label>
//             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
//               <div className="space-y-1 text-center">
//                 {selectedType === 'pdfs' ? (
//                   <File className="mx-auto h-12 w-12 text-gray-500" />
//                 ) : (
//                   <Image className="mx-auto h-12 w-12 text-gray-500" />
//                 )}
//                 <div className="flex text-sm text-gray-400">
//                   <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
//                     <span className="px-2 py-1">Upload a file</span>
//                     <input 
//                       id="file-upload" 
//                       name="file-upload" 
//                       type="file" 
//                       className="sr-only" 
//                       accept={selectedType === 'pdfs' ? '.pdf' : 'image/*'} 
//                       onChange={handleFileUpload} 
//                       required 
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 {selectedFile && (
//                   <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                     <p className="text-gray-300">{selectedFile.name}</p>
//                     <p className="text-gray-400 text-xs">{formatFileSize(selectedFile.size)}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//         {selectedType === 'playlists' && (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Number of Videos</label>
//               <input 
//                 type="number" 
//                 value={formData.videoCount || ''} 
//                 onChange={(e) => handleInputChange('videoCount', parseInt(e.target.value) || 0)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 min="0" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
//               <textarea 
//                 value={formData.about || ''} 
//                 onChange={(e) => handleInputChange('about', e.target.value)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 rows={3} 
//                 required 
//               />
//             </div>
//           </>
//         )}
//         {selectedType === 'notes' && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
//             <textarea 
//               value={formData.content || ''} 
//               onChange={(e) => handleInputChange('content', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={4} 
//               required 
//             />
//           </div>
//         )}
//         {(selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">About / Description</label>
//             <textarea 
//               value={formData.about || ''} 
//               onChange={(e) => handleInputChange('about', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={3} 
//               required 
//             />
//           </div>
//         )}
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
//           <div className="flex gap-2">
//             <input 
//               type="text" 
//               value={tagInput} 
//               onChange={(e) => setTagInput(e.target.value)} 
//               onKeyDown={handleTagInputKeyPress} 
//               className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Add a tag and press Enter" 
//             />
//             <button 
//               type="button" 
//               onClick={handleAddTag} 
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
//             >
//               Add
//             </button>
//           </div>
//           {formData.tags && formData.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {formData.tags.map(tag => (
//                 <span key={tag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center gap-1">
//                   #{tag}
//                   <button 
//                     type="button" 
//                     onClick={() => handleRemoveTag(tag)} 
//                     className="hover:text-red-300"
//                   >
//                     &times;
//                   </button>
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="flex justify-end gap-3 pt-4">
//           <button 
//             type="button" 
//             onClick={() => setSelectedType(null)} 
//             className="px-4 py-2 text-gray-300 hover:text-white"
//           >
//             Back
//           </button>
//           <button 
//             type="button" 
//             onClick={handleSubmit} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Add Content
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Get filtered contents
//   const filteredContents = getFilteredAndSortedContents();

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700 flex flex-col">
//           <div className="flex items-center gap-2 mb-8">
//             <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
//               <Hash className="w-5 h-5 text-white" />
//             </div>
//             <h1 className="text-xl font-bold text-white">Second Brain</h1>
//           </div>
//           <nav className="space-y-2 flex-grow">
//             <button 
//               onClick={() => { setActiveTab('all'); setSelectedTag(null); }} 
//               className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//                 activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//               }`}
//             >
//               <FileText className="w-4 h-4" /> All Contents
//             </button>
//             {contentTypes.map(({ id, label, icon: Icon }) => (
//               <button 
//                 key={id} 
//                 onClick={() => { setActiveTab(id); setSelectedTag(null); }} 
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//                   activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//                 }`}
//               >
//                 <Icon className="w-4 h-4" /> {label}
//               </button>
//             ))}
//           </nav>
//           <div className="mt-4">
//             <button 
//               onClick={handleLogout} 
//               className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
//             >
//               <X className="w-4 h-4" /> Logout
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         <main className={`flex-1 p-6 transition-all duration-300 ${previewContent ? 'pr-0' : ''}`}>
//           <header className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold capitalize mb-2">
//                 {activeTab === 'all' ? 'All Contents' : activeTab.replace('-', ' ')}
//               </h2>
//               {selectedTag && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-400">Filtered by:</span>
//                   <span 
//                     onClick={() => setSelectedTag(null)} 
//                     className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
//                   >
//                     #{selectedTag} &times;
//                   </span>
//                 </div>
//               )}
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input 
//                   type="text" 
//                   placeholder="Search..." 
//                   value={searchTerm} 
//                   onChange={(e) => setSearchTerm(e.target.value)} 
//                   className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
//                 />
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
//                   showFilters || hasActiveFilters()
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 <Filter className="w-4 h-4" />
//                 Filters
//                 {hasActiveFilters() && (
//                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                     {Object.keys(dateTimeFilter).length + 
//                      (sortBy !== 'newest' ? 1 : 0) + 
//                      (selectedTag ? 1 : 0) + 
//                      (searchTerm ? 1 : 0) + 
//                      (contentFilter ? 1 : 0) + 
//                      (activeTab !== 'all' ? 1 : 0)}
//                   </span>
//                 )}
//               </button>
//               <button 
//                 onClick={handleAddContent} 
//                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Content
//               </button>
//             </div>
//           </header>

//           {/* Filter Panel */}
//           {showFilters && renderFilterPanel()}

//           {/* Content Grid */}
//           {isLoading ? (
//             <div className="text-center py-20 text-gray-400">Loading content...</div>
//           ) : filteredContents.length > 0 ? (
//             <>
//               <div className="mb-4 text-sm text-gray-400">
//                 Showing {filteredContents.length} of {contents.length} items
//               </div>
//               <div className={`grid gap-4 ${previewContent ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
//                 {filteredContents.map(renderContentCard)}
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p>
//                 {contents.length === 0 
//                   ? "No content found. Click \"Add Content\" to get started!" 
//                   : "No content matches your current filters. Try adjusting your search criteria."
//                 }
//               </p>
//             </div>
//           )}
//         </main>

//         {/* Preview Panel - Only for notes and links */}
//         {previewContent && (
//           <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Preview</h3>
//               <button
//                 onClick={() => setPreviewContent(null)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-300 mb-2 capitalize">
//                   {previewContent.type.replace('-', ' ')}
//                 </h4>
//                 {previewContent.type === 'notes' && (
//                   <div className="space-y-2">
//                     <p className="text-sm text-gray-300 whitespace-pre-wrap">{(previewContent as Note).content}</p>
//                     <button
//                       onClick={() => handleCopy((previewContent as Note).content)}
//                       className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
//                       title="Copy content"
//                     >
//                       {copiedText === (previewContent as Note).content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
//                       Copy
//                     </button>
//                   </div>
//                 )}
//                 {(previewContent.type === 'tweaks' || previewContent.type === 'important-links') && (
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <a 
//                         href={(previewContent as Tweaks | ImportantLink).url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                       >
//                         {(previewContent as Tweaks | ImportantLink).url}
//                       </a>
//                       <button
//                         onClick={() => handleCopy((previewContent as Tweaks | ImportantLink).url)}
//                         className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                         title="Copy URL"
//                       >
//                         {copiedText === (previewContent as Tweaks | ImportantLink).url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                       </button>
//                     </div>
//                     {previewContent.type === 'important-links' && (
//                       <p className="text-sm text-gray-300">{(previewContent as ImportantLink).about}</p>
//                     )}
//                   </div>
//                 )}
//               </div>
              
//               {previewContent.tags.length > 0 && (
//                 <div>
//                   <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
//                   <div className="flex flex-wrap gap-1">
//                     {previewContent.tags.map(tag => (
//                       <span
//                         key={tag}
//                         onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
//                         className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                           selectedTag === tag
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                         }`}
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-4 text-xs text-gray-500">
//               Created: {new Date(previewContent.createdAt).toLocaleString()}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Preview Components */}
//       {imagePreview && (
//         <ImagePreview 
//           image={imagePreview} 
//           onClose={() => setImagePreview(null)} 
//         />
//       )}
      
//       {pdfPreview && (
//         <PDFPreview 
//           pdf={pdfPreview} 
//           onClose={() => setPdfPreview(null)} 
//         />
//       )}
      
//       {playlistPreview && (
//         <PlaylistPreview 
//           playlist={playlistPreview} 
//           onClose={() => setPlaylistPreview(null)} 
//         />
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">
//                 {selectedType ? `Add New ${selectedType.replace('-', ' ')}` : 'Choose Content Type'}
//               </h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             {!selectedType ? (
//               <div className="space-y-2">
//                 {contentTypes.map(({ id, label, icon: Icon }) => (
//                   <button 
//                     key={id} 
//                     onClick={() => handleTypeSelect(id)} 
//                     className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
//                   >
//                     <Icon className="w-5 h-5 text-blue-400" /> 
//                     <span>{label}</span>
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               renderForm()
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SecondBrainApp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../App'; // Import the useAuth hook
// import { 
//   X, Plus, Edit3, PlayCircle, FileText, Link, Hash, Trash2, Copy, Check, 
//   Search, File, Image, Filter, RotateCcw 
// } from 'lucide-react';

// // Import preview components
// import ImagePreview from '../preview/ImagePreview';
// import PDFPreview from '../preview/PDFPreview';
// import PlaylistPreview from '../preview/PlaylistPreview';

// // Interfaces
// interface BaseContent {
//   id: string;
//   _id: string;
//   type: 'tweaks' | 'playlists' | 'notes' | 'important-links' | 'pdfs' | 'images';
//   createdAt: Date;
//   tags: string[];
// }

// interface Tweaks extends BaseContent {
//   type: 'tweaks';
//   url: string;
// }

// interface Playlist extends BaseContent {
//   type: 'playlists';
//   url: string;
//   videoCount: number;
//   about: string;
// }

// interface Note extends BaseContent {
//   type: 'notes';
//   content: string;
// }

// interface ImportantLink extends BaseContent {
//   type: 'important-links';
//   url: string;
//   about: string;
// }

// interface PDF extends BaseContent {
//   type: 'pdfs';
//   fileName: string;
//   fileSize: number;
//   about: string;
// }

// interface ImageContent extends BaseContent {
//   type: 'images';
//   fileName: string;
//   fileSize: number;
//   about: string;
// }

// // Enhanced interfaces for preview components
// interface EnhancedImageContent extends ImageContent {
//   fileData: string;
//   previewUrl: string;
// }

// interface EnhancedPDFContent extends PDF {
//   fileData: string;
//   previewUrl: string;
// }

// type ContentItem = Tweaks | Playlist | Note | ImportantLink | PDF | ImageContent;

// interface ContentFormData {
//   url?: string;
//   videoCount?: number;
//   about?: string;
//   content?: string;
//   tags?: string[];
//   fileName?: string;
//   fileSize?: number;
// }

// interface DateTimeFilter {
//   dateFrom?: string;
//   dateTo?: string;
//   timeFrom?: string;
//   timeTo?: string;
//   dateRange?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
// }

// const API_URL = 'http://localhost:5000/api/content/';

// const SecondBrainApp: React.FC = () => {
//   const [contents, setContents] = useState<ContentItem[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedType, setSelectedType] = useState<ContentItem['type'] | null>(null);
//   const [formData, setFormData] = useState<ContentFormData>({});
//   const [activeTab, setActiveTab] = useState<'all' | ContentItem['type']>('all');
//   const [copiedText, setCopiedText] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [tagInput, setTagInput] = useState('');
//   const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [contentFilter, setContentFilter] = useState('');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
//   // Preview states - Fixed types
//   const [imagePreview, setImagePreview] = useState<EnhancedImageContent | null>(null);
//   const [pdfPreview, setPdfPreview] = useState<EnhancedPDFContent | null>(null);
//   const [playlistPreview, setPlaylistPreview] = useState<Playlist | null>(null);
  
//   // Filter states
//   const [showFilters, setShowFilters] = useState(false);
//   const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({});
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
//   const navigate = useNavigate();
//   const { logout, token } = useAuth();
  
//   const contentTypes = [
//     { id: 'tweaks' as const, label: 'Tweaks', icon: Edit3 },
//     { id: 'playlists' as const, label: 'Playlists', icon: PlayCircle },
//     { id: 'notes' as const, label: 'Notes', icon: FileText },
//     { id: 'important-links' as const, label: 'Important Links', icon: Link },
//     { id: 'pdfs' as const, label: 'PDFs', icon: File },
//     { id: 'images' as const, label: 'Images', icon: Image },
//   ];

//   const dateRangeOptions = [
//     { value: 'today' as const, label: 'Today' },
//     { value: 'yesterday' as const, label: 'Yesterday' },
//     { value: 'this-week' as const, label: 'This Week' },
//     { value: 'last-week' as const, label: 'Last Week' },
//     { value: 'this-month' as const, label: 'This Month' },
//     { value: 'last-month' as const, label: 'Last Month' },
//     { value: 'custom' as const, label: 'Custom Range' },
//   ];

//   // ESC key handler for previews
//   useEffect(() => {
//     const handleEscKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setImagePreview(null);
//         setPdfPreview(null);
//         setPlaylistPreview(null);
//         setPreviewContent(null);
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => {
//       document.removeEventListener('keydown', handleEscKey);
//     };
//   }, []);

//   // Helper function to get file preview URL
//   const getFilePreviewUrl = (contentId: string): string => {
//     return `${API_URL}${contentId}/preview`;
//   };

//   // Helper functions to create enhanced content objects
//   const createEnhancedImageContent = (content: ImageContent): EnhancedImageContent => {
//     return {
//       ...content,
//       fileData: getFilePreviewUrl(content.id),
//       previewUrl: getFilePreviewUrl(content.id)
//     };
//   };

//   const createEnhancedPDFContent = (content: PDF): EnhancedPDFContent => {
//     return {
//       ...content,
//       fileData: getFilePreviewUrl(content.id),
//       previewUrl: getFilePreviewUrl(content.id)
//     };
//   };

//   // Helper function to get date range
//   const getDateRange = (range: string): { start: Date; end: Date } | null => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     switch (range) {
//       case 'today':
//         return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
//       case 'yesterday':
//         const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
//         return { start: yesterday, end: today };
//       case 'this-week':
//         const weekStart = new Date(today);
//         weekStart.setDate(today.getDate() - today.getDay());
//         return { start: weekStart, end: new Date() };
//       case 'last-week':
//         const lastWeekStart = new Date(today);
//         lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
//         const lastWeekEnd = new Date(lastWeekStart);
//         lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
//         return { start: lastWeekStart, end: lastWeekEnd };
//       case 'this-month':
//         const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         return { start: monthStart, end: new Date() };
//       case 'last-month':
//         const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
//         return { start: lastMonthStart, end: lastMonthEnd };
//       default:
//         return null;
//     }
//   };

//   // Enhanced filter and sort contents function
//   const getFilteredAndSortedContents = (): ContentItem[] => {
//     let filtered = [...contents];

//     // Apply tab filter first
//     if (activeTab !== 'all') {
//       filtered = filtered.filter(item => item.type === activeTab);
//     }

//     // Apply tag filter
//     if (selectedTag) {
//       filtered = filtered.filter(item => item.tags.includes(selectedTag));
//     }

//     // Apply search term filter
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(searchLower) ||
//                    ('about' in item && item.about.toLowerCase().includes(searchLower));
//           case 'notes':
//             return item.content.toLowerCase().includes(searchLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(searchLower) ||
//                    item.about.toLowerCase().includes(searchLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply content filter
//     if (contentFilter) {
//       const contentFilterLower = contentFilter.toLowerCase();
//       filtered = filtered.filter(item => {
//         switch (item.type) {
//           case 'tweaks':
//           case 'playlists':
//           case 'important-links':
//             return item.url.toLowerCase().includes(contentFilterLower) ||
//                    ('about' in item && item.about.toLowerCase().includes(contentFilterLower));
//           case 'notes':
//             return item.content.toLowerCase().includes(contentFilterLower);
//           case 'pdfs':
//           case 'images':
//             return item.fileName.toLowerCase().includes(contentFilterLower) ||
//                    item.about.toLowerCase().includes(contentFilterLower);
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply date/time filters
//     if (dateTimeFilter.dateRange && dateTimeFilter.dateRange !== 'custom') {
//       const range = getDateRange(dateTimeFilter.dateRange);
//       if (range) {
//         filtered = filtered.filter(item => {
//           const itemDate = new Date(item.createdAt);
//           return itemDate >= range.start && itemDate < range.end;
//         });
//       }
//     } else if (dateTimeFilter.dateFrom || dateTimeFilter.dateTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
        
//         if (dateTimeFilter.dateFrom) {
//           const fromDate = new Date(dateTimeFilter.dateFrom);
//           if (itemDate < fromDate) return false;
//         }
        
//         if (dateTimeFilter.dateTo) {
//           const toDate = new Date(dateTimeFilter.dateTo);
//           toDate.setHours(23, 59, 59, 999);
//           if (itemDate > toDate) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply time filters
//     if (dateTimeFilter.timeFrom || dateTimeFilter.timeTo) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         const itemTime = itemDate.getHours() * 60 + itemDate.getMinutes();
        
//         if (dateTimeFilter.timeFrom) {
//           const [hours, minutes] = dateTimeFilter.timeFrom.split(':').map(Number);
//           const fromTime = hours * 60 + minutes;
//           if (itemTime < fromTime) return false;
//         }
        
//         if (dateTimeFilter.timeTo) {
//           const [hours, minutes] = dateTimeFilter.timeTo.split(':').map(Number);
//           const toTime = hours * 60 + minutes;
//           if (itemTime > toTime) return false;
//         }
        
//         return true;
//       });
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         case 'oldest':
//           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//         case 'alphabetical':
//           const getContentForSort = (item: ContentItem): string => {
//             switch (item.type) {
//               case 'notes':
//                 return item.content;
//               case 'tweaks':
//               case 'playlists':
//               case 'important-links':
//                 return item.url;
//               case 'pdfs':
//               case 'images':
//                 return item.fileName;
//               default:
//                 return '';
//             }
//           };
//           return getContentForSort(a).localeCompare(getContentForSort(b));
//         default:
//           return 0;
//       }
//     });

//     return filtered;
//   };

//   // Fetch data from backend with proper error handling
//   useEffect(() => {
//     const fetchContent = async () => {
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       setIsLoading(true);
      
//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//         };
        
//         const response = await axios.get(API_URL, config);
//         console.log('API Response:', response.data);
        
//         // Handle different response structures
//         let dataArray: any[] = [];
//         if (Array.isArray(response.data)) {
//           dataArray = response.data;
//         } else if (response.data && Array.isArray(response.data.data)) {
//           dataArray = response.data.data;
//         } else if (response.data && Array.isArray(response.data.contents)) {
//           dataArray = response.data.contents;
//         } else {
//           console.warn('Unexpected API response structure:', response.data);
//           dataArray = [];
//         }
        
//         // Map data to include id field
//         const mappedData: ContentItem[] = dataArray.map((item: any) => ({
//           ...item,
//           id: item._id || item.id,
//           createdAt: new Date(item.createdAt),
//         }));
        
//         setContents(mappedData);
//       } catch (error) {
//         console.error('Failed to fetch content:', error);
//         if (axios.isAxiosError(error)) {
//           if (error.response?.status === 401) {
//             logout();
//             navigate('/login');
//           } else if (error.response?.status === 404) {
//             setContents([]);
//           } else {
//             console.error('API Error:', error.response?.data);
//             setContents([]);
//           }
//         } else {
//           console.error('Network Error:', error);
//           setContents([]);
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchContent();
//   }, [navigate, token, logout]);

//   const handleAddContent = (): void => {
//     setShowModal(true);
//     setSelectedType(null);
//     setFormData({ tags: [] });
//     setTagInput('');
//     setSelectedFile(null);
//   };

//   const handleTypeSelect = (type: ContentItem['type']): void => {
//     setSelectedType(type);
//     setFormData({ tags: [] });
//     setTagInput('');
//     setSelectedFile(null);
//   };

//   const handleSubmit = async (): Promise<void> => {
//     if (!selectedType || !token) return;
    
//     // Validate required fields
//     if ((selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && !formData.url) {
//       alert('URL is required');
//       return;
//     }
//     if (selectedType === 'playlists' && (!formData.videoCount || !formData.about)) {
//       alert('Video count and description are required for playlists');
//       return;
//     }
//     if (selectedType === 'notes' && !formData.content) {
//       alert('Note content is required');
//       return;
//     }
//     if ((selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && !formData.about) {
//       alert('Description is required');
//       return;
//     }
//     if ((selectedType === 'pdfs' || selectedType === 'images') && !selectedFile) {
//       alert('File upload is required');
//       return;
//     }

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
      
//       // Create FormData for file uploads
//       const submitData = new FormData();
//       submitData.append('type', selectedType);
      
//       // Add non-file fields
//       if (formData.url) submitData.append('url', formData.url);
//       if (formData.videoCount) submitData.append('videoCount', formData.videoCount.toString());
//       if (formData.about) submitData.append('about', formData.about);
//       if (formData.content) submitData.append('content', formData.content);
//       if (formData.tags && formData.tags.length > 0) {
//         submitData.append('tags', JSON.stringify(formData.tags));
//       }
      
//       // Add file if present
//       if (selectedFile) {
//         submitData.append('file', selectedFile);
//       }

//       const response = await axios.post(API_URL, submitData, {
//         ...config,
//         headers: {
//           ...config.headers,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       console.log('Add content response:', response.data);
      
//       // Handle different response structures
//       let newContent: ContentItem;
//       if (response.data && response.data._id) {
//         newContent = { ...response.data, id: response.data._id, createdAt: new Date(response.data.createdAt) };
//       } else if (response.data.data && response.data.data._id) {
//         newContent = { ...response.data.data, id: response.data.data._id, createdAt: new Date(response.data.data.createdAt) };
//       } else if (response.data.content && response.data.content._id) {
//         newContent = { ...response.data.content, id: response.data.content._id, createdAt: new Date(response.data.content.createdAt) };
//       } else {
//         console.warn('Unexpected response structure:', response.data);
//         window.location.reload();
//         return;
//       }
      
//       setContents(prev => [newContent, ...prev]);
      
//       setShowModal(false);
//       setSelectedType(null);
//       setFormData({ tags: [] });
//       setTagInput('');
//       setSelectedFile(null);
//     } catch (error) {
//       console.error('Failed to add content:', error);
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           console.error('API Error:', error.response?.data);
//           alert(`Could not add content: ${error.response?.data?.message || 'Unknown error'}`);
//         }
//       } else {
//         alert('Could not add content. Please try again.');
//       }
//     }
//   };

//   const handleDelete = async (id: string): Promise<void> => {
//     if (!token) return;

//     if (!window.confirm("Are you sure you want to delete this item?")) return;

//     try {
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       await axios.delete(`${API_URL}${id}`, config);
//       setContents(contents.filter(content => content.id !== id));
//       if (previewContent?.id === id) {
//         setPreviewContent(null);
//       }
//     } catch (error) {
//       console.error('Failed to delete content:', error);
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         logout();
//         navigate('/login');
//       } else {
//         alert('Could not delete content.');
//       }
//     }
//   };

//   const handleLogout = (): void => {
//     logout();
//     navigate('/login');
//   };

//   const clearAllFilters = (): void => {
//     setDateTimeFilter({});
//     setSortBy('newest');
//     setSelectedTag(null);
//     setSearchTerm('');
//     setContentFilter('');
//     setActiveTab('all');
//   };

//   const hasActiveFilters = (): boolean => {
//     return Object.keys(dateTimeFilter).length > 0 || 
//            sortBy !== 'newest' || 
//            selectedTag !== null || 
//            searchTerm !== '' || 
//            contentFilter !== '' || 
//            activeTab !== 'all';
//   };

//   const handleInputChange = (field: keyof ContentFormData, value: string | number): void => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleCopy = async (text: string): Promise<void> => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedText(text);
//       setTimeout(() => setCopiedText(null), 2000);
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//     }
//   };

//   const handleAddTag = (): void => {
//     if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...(prev.tags || []), tagInput.trim()]
//       }));
//       setTagInput('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string): void => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
//     }));
//   };

//   const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleAddTag();
//     }
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setSelectedFile(file);
//     setFormData(prev => ({
//       ...prev,
//       fileName: file.name,
//       fileSize: file.size,
//     }));
//   };

//   const formatFileSize = (bytes: number): string => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getContentIcon = (type: ContentItem['type']) => {
//     const iconMap = {
//       tweaks: Edit3,
//       playlists: PlayCircle,
//       notes: FileText,
//       'important-links': Link,
//       pdfs: File,
//       images: Image,
//     };
//     return iconMap[type];
//   };

//   const renderFilterPanel = (): JSX.Element => (
//     <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search in URLs, notes, file names, descriptions..."
//             value={contentFilter}
//             onChange={(e) => setContentFilter(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <p className="text-xs text-gray-500 mt-1">
//           Search within: URLs (for tweaks/playlists/links), note content, file names, and descriptions
//         </p>
//       </div>
      
//       <div className="flex flex-wrap gap-4">
//         <div className="flex-1 min-w-48">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
//           <select
//             value={dateTimeFilter.dateRange || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ 
//               ...prev, 
//               dateRange: e.target.value as DateTimeFilter['dateRange'],
//               dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
//               dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
//             }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Time</option>
//             {dateRangeOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {dateTimeFilter.dateRange === 'custom' && (
//           <>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateFrom || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex-1 min-w-40">
//               <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
//               <input
//                 type="date"
//                 value={dateTimeFilter.dateTo || ''}
//                 onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </>
//         )}

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeFrom || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
//           <input
//             type="time"
//             value={dateTimeFilter.timeTo || ''}
//             onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex-1 min-w-40">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
//             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//             <option value="alphabetical">Alphabetical</option>
//           </select>
//         </div>
//       </div>

//       {hasActiveFilters() && (
//         <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-300">Active Filters:</span>
//             <button
//               onClick={clearAllFilters}
//               className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//             >
//               <RotateCcw className="w-3 h-3" />
//               Clear All
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {contentFilter && (
//               <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
//                 Content: "{contentFilter}"
//               </span>
//             )}
//             {activeTab !== 'all' && (
//               <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
//                 Type: {activeTab.replace('-', ' ')}
//               </span>
//             )}
//             {selectedTag && (
//               <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                 Tag: #{selectedTag}
//               </span>
//             )}
//             {searchTerm && (
//               <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
//                 Search: "{searchTerm}"
//               </span>
//             )}
//             {dateTimeFilter.dateRange && (
//               <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
//                 Date: {dateRangeOptions.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
//               </span>
//             )}
//             {sortBy !== 'newest' && (
//               <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
//                 Sort: {sortBy}
//               </span>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderContentCard = (content: ContentItem): JSX.Element => {
//     const Icon = getContentIcon(content.type);
//     const handleCardClick = (e: React.MouseEvent) => {
//       if ((e.target as HTMLElement).closest('button, a')) {
//         return;
//       }
      
//       if (content.type === 'images') {
//         const enhancedContent = createEnhancedImageContent(content as ImageContent);
//         setImagePreview(enhancedContent);
//       } else if (content.type === 'pdfs') {
//         const enhancedContent = createEnhancedPDFContent(content as PDF);
//         setPdfPreview(enhancedContent);
//       } else if (content.type === 'playlists') {
//         setPlaylistPreview(content as Playlist);
//       } else {
//         setPreviewContent(content);
//       }
//     };
    
//     return (
//       <div
//         key={content.id}
//         className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative group flex flex-col ${
//           (content.type === 'pdfs' || content.type === 'images' || content.type === 'playlists') ? 'cursor-pointer hover:border-blue-500' : ''
//         }`}
//         onClick={handleCardClick}
//       >
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Icon className="w-5 h-5 text-blue-400" />
//             <span className="text-sm text-gray-400 capitalize">
//               {content.type.replace('-', ' ')}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="text-right">
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleDateString()}
//               </span>
//               <span className="text-xs text-gray-500 block">
//                 {new Date(content.createdAt).toLocaleTimeString()}
//               </span>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDelete(content.id);
//               }}
//               className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
//               title="Delete"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//         <div className="flex-grow space-y-3">
//           {content.type === 'tweaks' && (
//             <div className="flex items-center gap-2">
//               <a
//                 href={content.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {content.url}
//               </a>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.url);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                 title="Copy URL"
//               >
//                 {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//               </button>
//             </div>
//           )}
//           {content.type === 'playlists' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a 
//                   href={content.url} 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }} 
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0" 
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <p className="text-xs text-gray-500">Videos: {content.videoCount}</p>
//             </div>
//           )}
//           {content.type === 'notes' && (
//             <div className="space-y-2">
//               <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{content.content}</p>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopy(content.content);
//                 }}
//                 className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
//                 title="Copy content"
//               >
//                 {copiedText === content.content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
//                 Copy
//               </button>
//             </div>
//           )}
//           {content.type === 'important-links' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <a
//                   href={content.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {content.url}
//                 </a>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCopy(content.url);
//                   }}
//                   className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                   title="Copy URL"
//                 >
//                   {copiedText === content.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                 </button>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//             </div>
//           )}
//           {content.type === 'pdfs' && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-md">
//                 <File className="w-8 h-8 text-red-400 flex-shrink-0" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//                   <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview PDF</div>
//             </div>
//           )}
//           {content.type === 'images' && (
//             <div className="space-y-2">
//               <div className="relative">
//                 <img 
//                   src={getFilePreviewUrl(content.id)} 
//                   alt={content.fileName} 
//                   className="w-full h-48 object-cover rounded-md"
//                   onError={(e) => {
//                     // Fallback if preview URL fails
//                     e.currentTarget.src = '/api/placeholder-image.png';
//                   }}
//                 />
//               </div>
//               <p className="text-sm font-medium text-gray-300 truncate">{content.fileName}</p>
//               <p className="text-xs text-gray-500">{formatFileSize(content.fileSize)}</p>
//               <p className="text-sm text-gray-300">{content.about}</p>
//               <div className="text-center text-xs text-blue-400 mt-2">Click to preview image</div>
//             </div>
//           )}
//         </div>
//         {content.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-700 pt-3">
//             {content.tags.map(tag => (
//               <span
//                 key={tag}
//                 onClick={(e) => { 
//                   e.stopPropagation(); 
//                   setSelectedTag(selectedTag === tag ? null : tag); 
//                 }}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                   selectedTag === tag
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderForm = (): JSX.Element | null => {
//     if (!selectedType) return null;
    
//     return (
//       <div className="space-y-4">
//         {(selectedType === 'tweaks' || selectedType === 'playlists' || selectedType === 'important-links') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
//             <input 
//               type="url" 
//               value={formData.url || ''} 
//               onChange={(e) => handleInputChange('url', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="https://example.com" 
//               required 
//             />
//           </div>
//         )}
//         {(selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Upload {selectedType === 'pdfs' ? 'PDF' : 'Image'}</label>
//             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
//               <div className="space-y-1 text-center">
//                 {selectedType === 'pdfs' ? (
//                   <File className="mx-auto h-12 w-12 text-gray-500" />
//                 ) : (
//                   <Image className="mx-auto h-12 w-12 text-gray-500" />
//                 )}
//                 <div className="flex text-sm text-gray-400">
//                   <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
//                     <span className="px-2 py-1">Upload a file</span>
//                     <input 
//                       id="file-upload" 
//                       name="file-upload" 
//                       type="file" 
//                       className="sr-only" 
//                       accept={selectedType === 'pdfs' ? '.pdf' : 'image/*'} 
//                       onChange={handleFileUpload} 
//                       required 
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 {selectedFile && (
//                   <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                     <p className="text-gray-300">{selectedFile.name}</p>
//                     <p className="text-gray-400 text-xs">{formatFileSize(selectedFile.size)}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//         {selectedType === 'playlists' && (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">Number of Videos</label>
//               <input 
//                 type="number" 
//                 value={formData.videoCount || ''} 
//                 onChange={(e) => handleInputChange('videoCount', parseInt(e.target.value) || 0)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 min="0" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
//               <textarea 
//                 value={formData.about || ''} 
//                 onChange={(e) => handleInputChange('about', e.target.value)} 
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                 rows={3} 
//                 required 
//               />
//             </div>
//           </>
//         )}
//         {selectedType === 'notes' && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Note Content</label>
//             <textarea 
//               value={formData.content || ''} 
//               onChange={(e) => handleInputChange('content', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={4} 
//               required 
//             />
//           </div>
//         )}
//         {(selectedType === 'important-links' || selectedType === 'pdfs' || selectedType === 'images') && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">About / Description</label>
//             <textarea 
//               value={formData.about || ''} 
//               onChange={(e) => handleInputChange('about', e.target.value)} 
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               rows={3} 
//               required 
//             />
//           </div>
//         )}
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
//           <div className="flex gap-2">
//             <input 
//               type="text" 
//               value={tagInput} 
//               onChange={(e) => setTagInput(e.target.value)} 
//               onKeyDown={handleTagInputKeyPress} 
//               className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
//               placeholder="Add a tag and press Enter" 
//             />
//             <button 
//               type="button" 
//               onClick={handleAddTag} 
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
//             >
//               Add
//             </button>
//           </div>
//           {formData.tags && formData.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {formData.tags.map(tag => (
//                 <span key={tag} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center gap-1">
//                   #{tag}
//                   <button 
//                     type="button" 
//                     onClick={() => handleRemoveTag(tag)} 
//                     className="hover:text-red-300"
//                   >
//                     &times;
//                   </button>
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="flex justify-end gap-3 pt-4">
//           <button 
//             type="button" 
//             onClick={() => setSelectedType(null)} 
//             className="px-4 py-2 text-gray-300 hover:text-white"
//           >
//             Back
//           </button>
//           <button 
//             type="button" 
//             onClick={handleSubmit} 
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Add Content
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Get filtered contents
//   const filteredContents = getFilteredAndSortedContents();

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700 flex flex-col">
//           <div className="flex items-center gap-2 mb-8">
//             <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
//               <Hash className="w-5 h-5 text-white" />
//             </div>
//             <h1 className="text-xl font-bold text-white">Second Brain</h1>
//           </div>
//           <nav className="space-y-2 flex-grow">
//             <button 
//               onClick={() => { setActiveTab('all'); setSelectedTag(null); }} 
//               className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//                 activeTab === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//               }`}
//             >
//               <FileText className="w-4 h-4" /> All Contents
//             </button>
//             {contentTypes.map(({ id, label, icon: Icon }) => (
//               <button 
//                 key={id} 
//                 onClick={() => { setActiveTab(id); setSelectedTag(null); }} 
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
//                   activeTab === id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
//                 }`}
//               >
//                 <Icon className="w-4 h-4" /> {label}
//               </button>
//             ))}
//           </nav>
//           <div className="mt-4">
//             <button 
//               onClick={handleLogout} 
//               className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
//             >
//               <X className="w-4 h-4" /> Logout
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         <main className={`flex-1 p-6 transition-all duration-300 ${previewContent ? 'pr-0' : ''}`}>
//           <header className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold capitalize mb-2">
//                 {activeTab === 'all' ? 'All Contents' : activeTab.replace('-', ' ')}
//               </h2>
//               {selectedTag && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-400">Filtered by:</span>
//                   <span 
//                     onClick={() => setSelectedTag(null)} 
//                     className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
//                   >
//                     #{selectedTag} &times;
//                   </span>
//                 </div>
//               )}
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input 
//                   type="text" 
//                   placeholder="Search..." 
//                   value={searchTerm} 
//                   onChange={(e) => setSearchTerm(e.target.value)} 
//                   className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
//                 />
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
//                   showFilters || hasActiveFilters()
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                 }`}
//               >
//                 <Filter className="w-4 h-4" />
//                 Filters
//                 {hasActiveFilters() && (
//                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                     {Object.keys(dateTimeFilter).length + 
//                      (sortBy !== 'newest' ? 1 : 0) + 
//                      (selectedTag ? 1 : 0) + 
//                      (searchTerm ? 1 : 0) + 
//                      (contentFilter ? 1 : 0) + 
//                      (activeTab !== 'all' ? 1 : 0)}
//                   </span>
//                 )}
//               </button>
//               <button 
//                 onClick={handleAddContent} 
//                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Content
//               </button>
//             </div>
//           </header>

//           {/* Filter Panel */}
//           {showFilters && (
//             <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Search in Content</label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search in URLs, notes, file names, descriptions..."
//                     value={contentFilter}
//                     onChange={(e) => setContentFilter(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Search within: URLs (for tweaks/playlists/links), note content, file names, and descriptions
//                 </p>
//               </div>
              
//               <div className="flex flex-wrap gap-4">
//                 <div className="flex-1 min-w-48">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
//                   <select
//                     value={dateTimeFilter.dateRange || ''}
//                     onChange={(e) => setDateTimeFilter(prev => ({ 
//                       ...prev, 
//                       dateRange: e.target.value as DateTimeFilter['dateRange'],
//                       dateFrom: e.target.value !== 'custom' ? undefined : prev.dateFrom,
//                       dateTo: e.target.value !== 'custom' ? undefined : prev.dateTo
//                     }))}
//                     className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">All Time</option>
//                     {dateRangeOptions.map(option => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {dateTimeFilter.dateRange === 'custom' && (
//                   <>
//                     <div className="flex-1 min-w-40">
//                       <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
//                       <input
//                         type="date"
//                         value={dateTimeFilter.dateFrom || ''}
//                         onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
//                         className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div className="flex-1 min-w-40">
//                       <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
//                       <input
//                         type="date"
//                         value={dateTimeFilter.dateTo || ''}
//                         onChange={(e) => setDateTimeFilter(prev => ({ ...prev, dateTo: e.target.value }))}
//                         className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div className="flex-1 min-w-40">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">From Time</label>
//                   <input
//                     type="time"
//                     value={dateTimeFilter.timeFrom || ''}
//                     onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeFrom: e.target.value }))}
//                     className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div className="flex-1 min-w-40">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">To Time</label>
//                   <input
//                     type="time"
//                     value={dateTimeFilter.timeTo || ''}
//                     onChange={(e) => setDateTimeFilter(prev => ({ ...prev, timeTo: e.target.value }))}
//                     className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div className="flex-1 min-w-40">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
//                     className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="newest">Newest First</option>
//                     <option value="oldest">Oldest First</option>
//                     <option value="alphabetical">Alphabetical</option>
//                   </select>
//                 </div>
//               </div>

//               {hasActiveFilters() && (
//                 <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium text-gray-300">Active Filters:</span>
//                     <button
//                       onClick={clearAllFilters}
//                       className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
//                     >
//                       <RotateCcw className="w-3 h-3" />
//                       Clear All
//                     </button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {contentFilter && (
//                       <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
//                         Content: "{contentFilter}"
//                       </span>
//                     )}
//                     {activeTab !== 'all' && (
//                       <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
//                         Type: {activeTab.replace('-', ' ')}
//                       </span>
//                     )}
//                     {selectedTag && (
//                       <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                         Tag: #{selectedTag}
//                       </span>
//                     )}
//                     {searchTerm && (
//                       <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
//                         Search: "{searchTerm}"
//                       </span>
//                     )}
//                     {dateTimeFilter.dateRange && (
//                       <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
//                         Date: {dateRangeOptions.find(opt => opt.value === dateTimeFilter.dateRange)?.label}
//                       </span>
//                     )}
//                     {sortBy !== 'newest' && (
//                       <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
//                         Sort: {sortBy}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Content Grid */}
//           {isLoading ? (
//             <div className="text-center py-20 text-gray-400">Loading content...</div>
//           ) : filteredContents.length > 0 ? (
//             <>
//               <div className="mb-4 text-sm text-gray-400">
//                 Showing {filteredContents.length} of {contents.length} items
//               </div>
//               <div className={`grid gap-4 ${previewContent ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
//                 {filteredContents.map(renderContentCard)}
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-400">
//               <p>
//                 {contents.length === 0 
//                   ? "No content found. Click \"Add Content\" to get started!" 
//                   : "No content matches your current filters. Try adjusting your search criteria."
//                 }
//               </p>
//             </div>
//           )}
//         </main>

//         {/* Preview Panel - Only for notes and links */}
//         {previewContent && (
//           <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Preview</h3>
//               <button
//                 onClick={() => setPreviewContent(null)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-300 mb-2 capitalize">
//                   {previewContent.type.replace('-', ' ')}
//                 </h4>
//                 {previewContent.type === 'notes' && (
//                   <div className="space-y-2">
//                     <p className="text-sm text-gray-300 whitespace-pre-wrap">{(previewContent as Note).content}</p>
//                     <button
//                       onClick={() => handleCopy((previewContent as Note).content)}
//                       className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1"
//                       title="Copy content"
//                     >
//                       {copiedText === (previewContent as Note).content ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
//                       Copy
//                     </button>
//                   </div>
//                 )}
//                 {(previewContent.type === 'tweaks' || previewContent.type === 'important-links') && (
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <a 
//                         href={(previewContent as Tweaks | ImportantLink).url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className="text-blue-400 hover:text-blue-300 underline text-sm break-all flex-1"
//                       >
//                         {(previewContent as Tweaks | ImportantLink).url}
//                       </a>
//                       <button
//                         onClick={() => handleCopy((previewContent as Tweaks | ImportantLink).url)}
//                         className="text-gray-400 hover:text-gray-300 p-1 flex-shrink-0"
//                         title="Copy URL"
//                       >
//                         {copiedText === (previewContent as Tweaks | ImportantLink).url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
//                       </button>
//                     </div>
//                     {previewContent.type === 'important-links' && (
//                       <p className="text-sm text-gray-300">{(previewContent as ImportantLink).about}</p>
//                     )}
//                   </div>
//                 )}
//               </div>
              
//               {previewContent.tags.length > 0 && (
//                 <div>
//                   <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
//                   <div className="flex flex-wrap gap-1">
//                     {previewContent.tags.map(tag => (
//                       <span
//                         key={tag}
//                         onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
//                         className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
//                           selectedTag === tag
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                         }`}
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-4 text-xs text-gray-500">
//               Created: {new Date(previewContent.createdAt).toLocaleString()}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Preview Components */}
//       {imagePreview && (
//         <ImagePreview 
//           image={imagePreview} 
//           onClose={() => setImagePreview(null)} 
//         />
//       )}
      
//       {pdfPreview && (
//         <PDFPreview 
//           pdf={pdfPreview} 
//           onClose={() => setPdfPreview(null)} 
//         />
//       )}
      
//       {playlistPreview && (
//         <PlaylistPreview 
//           playlist={playlistPreview} 
//           onClose={() => setPlaylistPreview(null)} 
//         />
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">
//                 {selectedType ? `Add New ${selectedType.replace('-', ' ')}` : 'Choose Content Type'}
//               </h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             {!selectedType ? (
//               <div className="space-y-2">
//                 {contentTypes.map(({ id, label, icon: Icon }) => (
//                   <button 
//                     key={id} 
//                     onClick={() => handleTypeSelect(id)} 
//                     className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
//                   >
//                     <Icon className="w-5 h-5 text-blue-400" /> 
//                     <span>{label}</span>
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               renderForm()
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SecondBrainApp;