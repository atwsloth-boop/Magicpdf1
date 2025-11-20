
// Initialize PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Initialize Tool Interface
function initTool(toolId) {
    const ws = document.getElementById('tool-workspace');
    if (!ws) return; 
    
    renderToolInterface(toolId, ws);
}

function renderToolInterface(toolId, ws) {
    // Clear previous content
    ws.innerHTML = '';
    
    // Create status div if not exists
    if(!document.getElementById('tool-status')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'tool-status';
        statusDiv.className = 'mt-6 hidden p-4 rounded bg-slate-800/50 border border-slate-700 text-center';
        ws.parentElement.appendChild(statusDiv);
    }

    const createDropZone = (accept, label, multiple = false) => {
        return `
        <div id="drop-zone" class="border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-xl p-12 text-center transition-colors hover:border-cyan-500 hover:bg-slate-800/50 cursor-pointer relative group">
            <input type="file" id="file-input" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="${accept}" ${multiple ? 'multiple' : ''}>
            <div class="pointer-events-none">
                <div class="mx-auto w-16 h-16 text-slate-500 mb-4 group-hover:text-cyan-400 transition-colors">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <h4 class="text-lg font-semibold text-white mb-1">Drag & Drop Files</h4>
                <p class="text-slate-400 text-sm">${label}</p>
            </div>
        </div>
        <div id="file-list" class="mt-6 space-y-2"></div>
        <div id="extra-options" class="mt-6 hidden"></div>
        <div class="mt-8 flex justify-center">
            <button id="action-btn" class="btn-primary px-10 py-3 rounded-lg hidden flex items-center gap-2" disabled>
                <span>Process</span>
            </button>
        </div>
        `;
    };

    // Logic for Specific Tools
    if (toolId === 'password-generator') {
        ws.innerHTML = `
            <div class="max-w-md mx-auto">
                <div class="bg-slate-800 p-6 rounded-lg text-center mb-6 relative">
                    <span id="pw-result" class="text-3xl font-mono text-cyan-400 tracking-wider break-all">Generating...</span>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('pw-result').innerText)" class="absolute top-2 right-2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white">COPY</button>
                </div>
                <div class="space-y-4">
                     <div class="flex justify-between text-sm text-slate-400"><span>Length</span><span id="len-val">16</span></div>
                     <input type="range" id="pw-length" min="6" max="32" value="16" class="w-full accent-cyan-400" oninput="document.getElementById('len-val').innerText = this.value">
                     <div class="flex gap-4 justify-center">
                        <label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" id="pw-num" checked class="accent-cyan-400"> 123</label>
                        <label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" id="pw-sym" checked class="accent-cyan-400"> !@#</label>
                        <label class="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" id="pw-upper" checked class="accent-cyan-400"> ABC</label>
                     </div>
                     <button id="gen-btn" class="btn-primary w-full py-3 rounded">Generate</button>
                </div>
            </div>`;
        setupPasswordGen();
        return;
    }

    if (toolId === 'word-counter') {
        ws.innerHTML = `
            <div class="grid grid-cols-1 gap-6">
                <textarea id="txt-input" rows="10" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white focus:border-cyan-400 outline-none" placeholder="Type or paste your text here..."></textarea>
                <div class="flex gap-4">
                    <div class="flex-1 bg-slate-800 p-4 rounded-lg text-center border border-slate-700">
                        <div class="text-2xl font-bold text-cyan-400" id="count-words">0</div>
                        <div class="text-xs text-slate-500 uppercase">Words</div>
                    </div>
                    <div class="flex-1 bg-slate-800 p-4 rounded-lg text-center border border-slate-700">
                        <div class="text-2xl font-bold text-purple-400" id="count-chars">0</div>
                        <div class="text-xs text-slate-500 uppercase">Characters</div>
                    </div>
                </div>
            </div>`;
        setupWordCounter();
        return;
    }

    // Dropzone based tools
    if (toolId === 'unlock-pdf') {
        ws.innerHTML = createDropZone('.pdf', 'Select Locked PDF');
        const opts = document.getElementById('extra-options');
        if (opts) {
            opts.classList.remove('hidden');
            opts.innerHTML = `<input type="password" id="pdf-password" placeholder="Enter PDF Password" class="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white focus:border-cyan-400 outline-none">`;
        }
        setupFileHandlers('unlock-pdf');
        return;
    }

    if (toolId === 'add-watermark') {
        ws.innerHTML = createDropZone('.pdf', 'Select PDF');
        const opts = document.getElementById('extra-options');
        if (opts) {
            opts.classList.remove('hidden');
            opts.className = "mt-6 space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700";
            opts.innerHTML = `
                <div>
                    <label class="text-sm text-slate-400 block mb-1">Watermark Text</label>
                    <input type="text" id="wm-text" value="CONFIDENTIAL" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-sm text-slate-400 block mb-1">Color</label><input type="color" id="wm-color" value="#ff0000" class="w-full h-10 rounded cursor-pointer"></div>
                    <div><label class="text-sm text-slate-400 block mb-1">Opacity</label><input type="number" id="wm-opacity" value="0.5" step="0.1" min="0.1" max="1" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"></div>
                </div>
            `;
        }
        setupFileHandlers('add-watermark');
        return;
    }

    if (toolId === 'image-converter') {
        ws.innerHTML = createDropZone('image/*', 'Select Images (JPG, PNG, WEBP)', true);
        const opts = document.getElementById('extra-options');
        if (opts) {
            opts.classList.remove('hidden');
            opts.innerHTML = `
                <label class="text-sm text-slate-400 mr-2">Convert to:</label>
                <select id="convert-format" class="bg-slate-800 text-white p-2 rounded border border-slate-700">
                    <option value="jpeg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                </select>
            `;
        }
        setupFileHandlers('image-converter');
        return;
    }
    
    const supportedTools = ['merge-pdf','split-pdf','compress-pdf','word-to-pdf','pdf-to-word','pdf-to-jpg','jpg-to-pdf','add-page-numbers','image-compressor'];
    if (supportedTools.includes(toolId)) {
        const ext = toolId.includes('word') ? '.docx' : (toolId.includes('image') ? 'image/*' : '.pdf');
        const multiple = ['merge-pdf','image-compressor','jpg-to-pdf'].includes(toolId);
        // Special case for JPG to PDF
        if(toolId === 'jpg-to-pdf') {
             ws.innerHTML = createDropZone('image/*', 'Select Images', true);
        } else {
             ws.innerHTML = createDropZone(ext, `Select file${multiple?'s':''}`, multiple);
        }
        setupFileHandlers(toolId);
    }
}

// --- Logic Handlers ---

function setupFileHandlers(toolId) {
    const input = document.getElementById('file-input');
    const list = document.getElementById('file-list');
    const btn = document.getElementById('action-btn');
    let selectedFiles = [];

    if (!input) return;

    input.addEventListener('change', (e) => {
        if (e.target.files.length) {
            if (input.multiple) {
                selectedFiles = [...selectedFiles, ...Array.from(e.target.files)];
            } else {
                selectedFiles = [e.target.files[0]];
            }
            updateList();
        }
    });

    function updateList() {
        list.innerHTML = '';
        selectedFiles.forEach((f, i) => {
            list.innerHTML += `
                <div class="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700 text-sm animate-fade-in">
                    <span class="text-slate-300 truncate max-w-[80%]">${f.name} <span class="text-slate-500 text-xs">(${(f.size/1024/1024).toFixed(2)} MB)</span></span>
                    <button onclick="window.removeFile(${i})" class="text-red-400 hover:text-red-300 font-bold">×</button>
                </div>`;
        });
        
        if (selectedFiles.length > 0) {
            btn.classList.remove('hidden');
            btn.disabled = false;
            btn.onclick = () => processFiles(toolId, selectedFiles);
            
            // Text updates
            const btnSpan = btn.querySelector('span');
            if (btnSpan) {
                if(toolId === 'merge-pdf') btnSpan.innerText = `Merge ${selectedFiles.length} PDFs`;
                else if(toolId === 'split-pdf') btnSpan.innerText = `Split PDF`;
                else if(toolId === 'compress-pdf') btnSpan.innerText = `Compress PDF`;
                else btnSpan.innerText = 'Process';
            }
        } else {
            btn.classList.add('hidden');
        }
    }

    window.removeFile = (index) => {
        selectedFiles.splice(index, 1);
        updateList();
    };
}

function setupPasswordGen() {
    const gen = () => {
        const lenInput = document.getElementById('pw-length');
        const len = lenInput ? parseInt(lenInput.value) : 16;
        
        const numCheck = document.getElementById('pw-num');
        const useNum = numCheck ? numCheck.checked : true;
        
        const symCheck = document.getElementById('pw-sym');
        const useSym = symCheck ? symCheck.checked : true;
        
        const upperCheck = document.getElementById('pw-upper');
        const useUpper = upperCheck ? upperCheck.checked : true;

        let chars = 'abcdefghijklmnopqrstuvwxyz';
        if(useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if(useNum) chars += '0123456789';
        if(useSym) chars += '!@#$%^&*()_+';
        
        let ret = '';
        for(let i=0; i<len; i++) ret += chars.charAt(Math.floor(Math.random() * chars.length));
        
        const resultEl = document.getElementById('pw-result');
        if (resultEl) resultEl.innerText = ret;
    };
    
    const genBtn = document.getElementById('gen-btn');
    if (genBtn) genBtn.onclick = gen;
    
    gen();
}

function setupWordCounter() {
    const area = document.getElementById('txt-input');
    if (area) {
        area.addEventListener('input', () => {
            const val = area.value.trim();
            const wordCountEl = document.getElementById('count-words');
            const charCountEl = document.getElementById('count-chars');
            if (wordCountEl) wordCountEl.innerText = val ? val.split(/\s+/).length : 0;
            if (charCountEl) charCountEl.innerText = val.length;
        });
    }
}

// --- Engine ---

async function processFiles(toolId, files) {
    showLoading('Processing...');
    try {
        if (toolId === 'merge-pdf') await handleMerge(files);
        else if (toolId === 'split-pdf') await handleSplit(files[0]);
        else if (toolId === 'compress-pdf') await handleCompress(files[0]);
        else if (toolId === 'word-to-pdf') await handleWordToPdf(files[0]);
        else if (toolId === 'pdf-to-word') await handlePdfToWord(files[0]);
        else if (toolId === 'jpg-to-pdf') await handleJpgToPdf(files);
        else if (toolId === 'pdf-to-jpg') await handlePdfToJpg(files[0]);
        else if (toolId === 'unlock-pdf') await handleUnlock(files[0]);
        else if (toolId === 'add-watermark') await handleWatermark(files[0]);
        else if (toolId === 'add-page-numbers') await handlePageNumbers(files[0]);
        else if (toolId === 'image-compressor') await handleImgCompress(files);
        else if (toolId === 'image-converter') await handleImgConvert(files);
    } catch (e) {
        console.error(e);
        showError(e.message || "An unexpected error occurred.");
    }
}

// --- Tool Implementations ---

async function handleMerge(files) {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
        const ab = await file.arrayBuffer();
        const pdf = await PDFDocument.load(ab);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    download(await mergedPdf.save(), 'merged-document.pdf', 'application/pdf');
    showSuccess('PDFs merged successfully!');
}

async function handleSplit(file) {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const zip = new JSZip();
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        zip.file(`page_${i+1}.pdf`, await newPdf.save());
    }
    download(await zip.generateAsync({type:"blob"}), 'split-pages.zip', 'application/zip');
    showSuccess(`Split into ${pdfDoc.getPageCount()} files.`);
}

async function handleCompress(file) {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const bytes = await pdfDoc.save({ useObjectStreams: false }); 
    download(bytes, 'compressed.pdf', 'application/pdf');
    showSuccess('PDF Compressed.');
}

async function handleWordToPdf(file) {
    const ab = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: ab });
    const container = document.createElement('div');
    container.innerHTML = html;
    Object.assign(container.style, { position:'absolute', left:'-9999px', width:'794px', padding:'40px', background:'white', color:'black' });
    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 2 });
    document.body.removeChild(container);
    
    const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
    if (!jsPDF) throw new Error("jsPDF library not loaded");

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(canvas.toDataURL('image/png'));
    const pdfHeight = (imgProps.height * 210) / imgProps.width;
    pdf.addImage(imgProps.data, 'PNG', 0, 0, 210, pdfHeight);
    pdf.save(file.name.replace('.docx', '.pdf'));
    showSuccess('Word document converted.');
}

async function handlePdfToWord(file) {
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(ab).promise;
    let text = "";
    for(let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(" ") + "\n\n";
    }
    download(new Blob([text], { type: "text/plain" }), file.name.replace('.pdf','.doc'), 'application/msword');
    showSuccess('Text extracted to .doc file.');
}

async function handleJpgToPdf(files) {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    for(const file of files) {
        const imgBytes = await file.arrayBuffer();
        let image;
        if(file.type === 'image/jpeg') image = await pdfDoc.embedJpg(imgBytes);
        else if(file.type === 'image/png') image = await pdfDoc.embedPng(imgBytes);
        if(image) {
            const page = pdfDoc.addPage();
            const { width, height } = image.scale(1);
            const pageW = page.getWidth();
            const pageH = page.getHeight();
            const scale = Math.min(pageW/width, pageH/height);
            page.drawImage(image, { x: (pageW - width*scale)/2, y: (pageH - height*scale)/2, width: width*scale, height: height*scale });
        }
    }
    download(await pdfDoc.save(), 'images.pdf', 'application/pdf');
    showSuccess('Images converted to PDF.');
}

async function handlePdfToJpg(file) {
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(ab).promise;
    const zip = new JSZip();
    for(let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({scale: 2});
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        zip.file(`page_${i}.jpg`, imgData.split(',')[1], {base64:true});
    }
    download(await zip.generateAsync({type:"blob"}), 'pdf-images.zip', 'application/zip');
    showSuccess('Pages converted to JPG images.');
}

async function handleUnlock(file) {
    const pwdInput = document.getElementById('pdf-password');
    const pwd = pwdInput ? pwdInput.value : '';
    
    if(!pwd) throw new Error("Password is required.");
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), { password: pwd });
    download(await pdfDoc.save(), 'unlocked.pdf', 'application/pdf');
    showSuccess('PDF Unlocked!');
}

async function handleWatermark(file) {
    const textInput = document.getElementById('wm-text');
    const text = textInput ? textInput.value : '';
    
    const colorInput = document.getElementById('wm-color');
    const colorHex = colorInput ? colorInput.value : '#ff0000';
    
    const opacityInput = document.getElementById('wm-opacity');
    const opacity = opacityInput ? parseFloat(opacityInput.value) : 0.5;
    
    const { PDFDocument, rgb, degrees } = PDFLib;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    const r = parseInt(colorHex.substr(1,2), 16)/255;
    const g = parseInt(colorHex.substr(3,2), 16)/255;
    const b = parseInt(colorHex.substr(5,2), 16)/255;
    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, { x: width/2 - (text.length*15)/2, y: height/2, size: 50, color: rgb(r,g,b), opacity: opacity, rotate: degrees(45) });
    });
    download(await pdfDoc.save(), 'watermarked.pdf', 'application/pdf');
    showSuccess('Watermark applied.');
}

async function handlePageNumbers(file) {
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(`${idx+1} / ${pages.length}`, { x: width - 50, y: 20, size: 12, color: rgb(0,0,0) });
    });
    download(await pdfDoc.save(), 'numbered.pdf', 'application/pdf');
    showSuccess('Page numbers added.');
}

async function handleImgConvert(files) {
    const formatInput = document.getElementById('convert-format');
    const format = formatInput ? formatInput.value : 'jpeg';
    const zip = new JSZip();
    for(const file of files) {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        canvas.getContext('2d').drawImage(bmp,0,0);
        const blob = await new Promise(r => canvas.toBlob(r, `image/${format}`));
        zip.file(file.name.split('.')[0] + '.' + format, blob);
    }
    download(await zip.generateAsync({type:'blob'}), 'converted-images.zip', 'application/zip');
    showSuccess('Images converted.');
}

async function handleImgCompress(files) {
    const zip = new JSZip();
    for(const file of files) {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        canvas.getContext('2d').drawImage(bmp,0,0);
        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.6)); 
        zip.file(file.name, blob);
    }
    download(await zip.generateAsync({type:'blob'}), 'compressed-images.zip', 'application/zip');
    showSuccess('Images compressed.');
}

function download(data, name, type) {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

function showLoading(msg) {
    const status = document.getElementById('tool-status');
    if(status) {
        status.classList.remove('hidden', 'bg-green-900/50', 'border-green-500', 'text-green-200', 'bg-red-900/50', 'border-red-500', 'text-red-200');
        status.classList.add('bg-slate-800/50', 'border-cyan-500/30', 'text-cyan-400');
        status.innerHTML = `<div class="flex items-center justify-center gap-3"><div class="loader"></div><span>${msg}</span></div>`;
        status.style.display = 'block';
    }
}

function showSuccess(msg) {
    const status = document.getElementById('tool-status');
    if(status) {
        status.className = 'mt-6 p-4 rounded border text-center bg-green-900/20 border-green-500 text-green-400';
        status.innerHTML = msg;
    }
}

function showError(msg) {
    const status = document.getElementById('tool-status');
    if(status) {
        status.className = 'mt-6 p-4 rounded border text-center bg-red-900/20 border-red-500 text-red-400';
        status.innerHTML = msg;
    }
}
