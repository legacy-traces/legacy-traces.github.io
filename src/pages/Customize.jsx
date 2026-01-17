import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
    ZoomIn, ZoomOut, Type, Image as ImageIcon, Trash2,
    RotateCcw, Save, Download, RefreshCw, X, Check, Palette,
    Layout, Shirt, Upload, MousePointer2, Layers
} from 'lucide-react';

const mockups = {
    men: {
        black: {
            round: {
                front: '/assets/T-Shirts/Men/Black T-Shirts/Black-Tshirt-Front.jpg',
                back: '/assets/T-Shirts/Men/Black T-Shirts/Black-Tshirt-Back.jpg'
            },
            oversized: {
                front: '/assets/T-Shirts/Men/Black T-Shirts/black-Tshirt-oversized-front.png',
                back: '/assets/T-Shirts/Men/Black T-Shirts/black-Tshirt-oversized-back.png'
            }
        },
        white: {
            round: {
                front: '/assets/T-Shirts/Men/White T-Shirts/white-tshirt-front.jpg',
                back: '/assets/T-Shirts/Men/White T-Shirts/white-tshirt-back.jpg'
            },
            oversized: {
                front: '/assets/T-Shirts/Men/White T-Shirts/white-Tshirt-oversized-front.png',
                back: '/assets/T-Shirts/Men/White T-Shirts/white-Tshirt-oversized-back.png'
            }
        },
        blue: {
            round: {
                front: '/assets/T-Shirts/Men/Blue T-Shirts/blue-Tshirt-Front.jpg',
                back: '/assets/T-Shirts/Men/Blue T-Shirts/blue-Tshirt-Back.jpg'
            }
        },
        red: {
            oversized: {
                front: '/assets/T-Shirts/Men/Red T-Shirt/red-Tshirt-oversized-front.png',
                back: '/assets/T-Shirts/Men/Red T-Shirt/red-Tshirt-oversized-back.png'
            }
        }
    }
};

const Customize = () => {
    const [activeTab, setActiveTab] = useState('product'); // product, text, upload, layers
    const [canvasFront, setCanvasFront] = useState(null);
    const [canvasBack, setCanvasBack] = useState(null);
    const [activeCanvas, setActiveCanvas] = useState(null);

    const [currentType, setCurrentType] = useState('round');
    const [currentColor, setCurrentColor] = useState('black');
    const [isFlipped, setIsFlipped] = useState(false);

    const [selectedObject, setSelectedObject] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Initialize Canvases
    useEffect(() => {
        const initCanvas = (id) => {
            return new fabric.Canvas(id, {
                width: 500,
                height: 600,
                backgroundColor: 'transparent',
                preserveObjectStacking: true,
                selection: true
            });
        };

        const cf = initCanvas('tshirt-canvas-front');
        const cb = initCanvas('tshirt-canvas-back');

        setCanvasFront(cf);
        setCanvasBack(cb);
        setActiveCanvas(cf);

        const handleSelection = (c) => {
            c.on('selection:created', (e) => setSelectedObject(e.selected[0]));
            c.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
            c.on('selection:cleared', () => setSelectedObject(null));
        };

        handleSelection(cf);
        handleSelection(cb);

        return () => {
            cf.dispose();
            cb.dispose();
        };
    }, []);

    // Update Background Image
    useEffect(() => {
        if (!canvasFront || !canvasBack) return;

        const updateBackground = (canvas, side) => {
            let url = '';
            const modelData = mockups.men[currentColor];

            if (modelData) {
                if (modelData[currentType]) {
                    url = modelData[currentType][side];
                } else {
                    const firstType = Object.keys(modelData)[0];
                    if (firstType) url = modelData[firstType][side];
                }
            }

            if (url) {
                fabric.Image.fromURL(url, (img) => {
                    const scaleX = canvas.width / img.width;
                    const scaleY = canvas.height / img.height;
                    const scale = Math.min(scaleX, scaleY);

                    img.set({
                        scaleX: scale,
                        scaleY: scale,
                        originX: 'center',
                        originY: 'center',
                        left: canvas.width / 2,
                        top: canvas.height / 2
                    });

                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                });
            }
        };

        updateBackground(canvasFront, 'front');
        updateBackground(canvasBack, 'back');
    }, [currentType, currentColor, canvasFront, canvasBack]);

    // Tools
    const addText = () => {
        if (!activeCanvas) return;
        const text = new fabric.IText('Your Text', {
            left: 250,
            top: 300,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter',
            fill: '#ffffff',
            fontSize: 40,
            editable: true
        });
        activeCanvas.add(text);
        activeCanvas.setActiveObject(text);
        activeCanvas.requestRenderAll();
    };

    const addImage = (e) => {
        if (!activeCanvas || !e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                const maxSize = 200;
                if (img.width > maxSize) {
                    img.scaleToWidth(maxSize);
                }
                img.set({
                    left: 250,
                    top: 300,
                    originX: 'center',
                    originY: 'center'
                });
                activeCanvas.add(img);
                activeCanvas.setActiveObject(img);
                activeCanvas.requestRenderAll();
            });
        };
        reader.readAsDataURL(e.target.files[0]);
        e.target.value = '';
    };

    const deleteObject = () => {
        if (!activeCanvas || !selectedObject) return;
        activeCanvas.remove(selectedObject);
        activeCanvas.discardActiveObject();
        activeCanvas.requestRenderAll();
        setSelectedObject(null);
    };

    const changeColor = (color) => {
        if (!activeCanvas || !selectedObject) return;
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
            selectedObject.set('fill', color);
            activeCanvas.requestRenderAll();
        }
    };

    const changeFont = (font) => {
        if (!activeCanvas || !selectedObject) return;
        if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
            selectedObject.set('fontFamily', font);
            activeCanvas.requestRenderAll();
        }
    };

    const zoom = (factor) => {
        const newZoom = Math.max(0.5, Math.min(3, zoomLevel * factor));
        setZoomLevel(newZoom);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        setActiveCanvas(isFlipped ? canvasFront : canvasBack);
        // Deselect objects when flipping
        if (canvasFront) canvasFront.discardActiveObject().requestRenderAll();
        if (canvasBack) canvasBack.discardActiveObject().requestRenderAll();
    };

    const handleDownload = () => {
        if (!activeCanvas) return;

        // Deselect before download
        activeCanvas.discardActiveObject().requestRenderAll();

        const dataURL = activeCanvas.toDataURL({
            format: 'png',
            quality: 1
        });

        const link = document.createElement('a');
        link.download = `tshirt-design-${isFlipped ? 'back' : 'front'}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-gray-100 dark:bg-[#121212]">

            {/* 1. Left Sidebar - Navigation */}
            <aside className="w-16 md:w-20 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-6 z-20 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('product')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'product' ? 'bg-primary text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title="Product"
                >
                    <Shirt size={24} />
                </button>
                <button
                    onClick={() => setActiveTab('text')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'text' ? 'bg-primary text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title="Text"
                >
                    <Type size={24} />
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`p-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-primary text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title="Upload"
                >
                    <Upload size={24} />
                </button>
            </aside>

            {/* 2. Context Panel (Slide-out) */}
            <aside className="w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 flex flex-col z-10 hidden md:flex">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="font-heading font-bold text-xl capitalize">{activeTab}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'product' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 tracking-wider mb-3 block">STYLE</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setCurrentType('round')}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${currentType === 'round' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700'}`}
                                    >
                                        Regular
                                    </button>
                                    <button
                                        onClick={() => setCurrentType('oversized')}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${currentType === 'oversized' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700'}`}
                                    >
                                        Oversized
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 tracking-wider mb-3 block">COLOR</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['black', 'white', 'red', 'blue'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setCurrentColor(color)}
                                            className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? 'border-primary scale-110' : 'border-gray-200 dark:border-gray-700'}`}
                                            style={{ backgroundColor: color === 'white' ? '#ffffff' : color === 'black' ? '#000000' : color === 'red' ? '#c62828' : '#1976d2' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <button
                                onClick={addText}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Add Heading
                            </button>
                            <div className="text-xs text-gray-500 mt-4">
                                Click to add text, then customize using the floating toolbar.
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={addImage} />
                            </label>
                        </div>
                    )}
                </div>
            </aside>

            {/* 3. Main Canvas Area */}
            <main className="flex-1 relative flex flex-col bg-gray-100 dark:bg-[#121212] overflow-hidden">

                {/* Top Toolbar */}
                <div className="h-16 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-2">
                        <button onClick={() => zoom(0.9)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ZoomOut size={20} /></button>
                        <span className="text-sm font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => zoom(1.1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ZoomIn size={20} /></button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFlip}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <RefreshCw size={16} /> Flip
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download size={16} /> Download
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm hover:bg-green-400 transition-colors">
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-auto relative">
                    <div
                        className="relative transition-transform duration-300 ease-out"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        {/* Flip Container */}
                        <div className="relative w-[500px] h-[600px] perspective-1000">
                            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                                {/* Front */}
                                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-transparent shadow-2xl">
                                    <canvas id="tshirt-canvas-front" />
                                </div>

                                {/* Back */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-transparent shadow-2xl">
                                    <canvas id="tshirt-canvas-back" />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Properties Panel (When Object Selected) */}
                {selectedObject && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1e1e1e] px-6 py-3 rounded-full shadow-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-6 animate-in slide-in-from-bottom-5 z-30">
                        {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                            <>
                                <div className="flex items-center gap-3">
                                    <Palette size={18} className="text-gray-500" />
                                    <input
                                        type="color"
                                        className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-none p-0"
                                        value={selectedObject.fill}
                                        onChange={(e) => changeColor(e.target.value)}
                                    />
                                </div>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <select
                                    className="bg-transparent font-medium text-sm focus:outline-none"
                                    value={selectedObject.fontFamily}
                                    onChange={(e) => changeFont(e.target.value)}
                                >
                                    <option value="Inter">Inter</option>
                                    <option value="Outfit">Outfit</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Courier New">Courier</option>
                                </select>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                            </>
                        )}
                        <button
                            onClick={deleteObject}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}

            </main>

            {/* Mobile Bottom Bar (Replaces Sidebar on Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 flex justify-around py-3 z-50">
                <button onClick={() => setActiveTab('product')} className={`flex flex-col items-center gap-1 ${activeTab === 'product' ? 'text-primary' : 'text-gray-500'}`}>
                    <Shirt size={20} />
                    <span className="text-[10px] font-bold">Product</span>
                </button>
                <button onClick={() => setActiveTab('text')} className={`flex flex-col items-center gap-1 ${activeTab === 'text' ? 'text-primary' : 'text-gray-500'}`}>
                    <Type size={20} />
                    <span className="text-[10px] font-bold">Text</span>
                </button>
                <button onClick={() => setActiveTab('upload')} className={`flex flex-col items-center gap-1 ${activeTab === 'upload' ? 'text-primary' : 'text-gray-500'}`}>
                    <Upload size={20} />
                    <span className="text-[10px] font-bold">Upload</span>
                </button>
            </div>

            {/* Mobile Context Drawer (If needed, can be modal or slide-up) */}
            {/* For simplicity, mobile users can use the sidebar logic but rendered differently or just rely on the main view. 
          The current sidebar is hidden on mobile. We might need a mobile specific drawer. 
          Let's add a simple mobile drawer for the active tool. */}

            <div className={`md:hidden fixed bottom-[60px] left-0 w-full bg-white dark:bg-[#1e1e1e] rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 z-40 ${activeTab ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold capitalize">{activeTab}</h3>
                        <button onClick={() => setActiveTab('')}><X size={20} /></button>
                    </div>

                    {/* Mobile Content Reuse */}
                    {activeTab === 'product' && (
                        <div className="space-y-4">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <button onClick={() => setCurrentType('round')} className={`px-4 py-2 rounded-lg border ${currentType === 'round' ? 'border-primary bg-primary/10' : 'border-gray-200'}`}>Regular</button>
                                <button onClick={() => setCurrentType('oversized')} className={`px-4 py-2 rounded-lg border ${currentType === 'oversized' ? 'border-primary bg-primary/10' : 'border-gray-200'}`}>Oversized</button>
                            </div>
                            <div className="flex gap-3">
                                {['black', 'white', 'red', 'blue'].map(color => (
                                    <button key={color} onClick={() => setCurrentColor(color)} className={`w-10 h-10 rounded-full border-2 ${currentColor === color ? 'border-primary' : 'border-gray-200'}`} style={{ backgroundColor: color === 'white' ? '#fff' : color === 'black' ? '#000' : color === 'red' ? '#c62828' : '#1976d2' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'text' && (
                        <button onClick={addText} className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold">Add Heading</button>
                    )}

                    {activeTab === 'upload' && (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg">
                            <Upload className="mb-2 text-gray-400" />
                            <span className="text-xs text-gray-500">Upload Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={addImage} />
                        </label>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Customize;
