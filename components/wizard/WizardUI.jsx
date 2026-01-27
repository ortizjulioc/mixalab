import React from 'react';
import { UploadCloud, FileAudio, CheckCircle2 } from 'lucide-react';

export const Label = ({ children, required }) => (
    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
        {children} {required && <span className="text-amber-500">*</span>}
    </label>
);

export const Input = ({ label, type = "text", placeholder, value, onChange, name, required }) => (
    <div className="mb-5">
        {label && <Label required={required}>{label}</Label>}
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
        />
    </div>
);

export const TextArea = ({ label, placeholder, value, onChange, name, rows = 3, required }) => (
    <div className="mb-5">
        {label && <Label required={required}>{label}</Label>}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
        />
    </div>
);

export const SelectionCard = ({ icon: Icon, title, description, selected, onClick, badge }) => (
    <div
        onClick={onClick}
        className={`cursor-pointer group border rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/10 ${selected
            ? 'border-amber-500 bg-zinc-900/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
            }`}
    >
        <div className={`p-3 rounded-full mb-4 transition-colors ${selected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400 group-hover:text-white'
            }`}>
            <Icon size={24} />
        </div>
        <h3 className={`font-bold text-lg mb-2 ${selected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
            {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        {badge && (
            <span className="mt-3 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                {badge}
            </span>
        )}
        {/* Optional Check Circle for explicit selection feedback */}
        {selected && (
            <div className="mt-4 text-amber-500">
                <CheckCircle2 size={20} />
            </div>
        )}
    </div>
);

export const FileUploadZone = ({ label, onFileSelect, fileName, required, acceptedFileTypes = "audio/*,.zip" }) => (
    <div className="mb-8">
        <Label required={required}>{label}</Label>
        <div className="group border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:bg-zinc-900 hover:border-zinc-600 transition-all cursor-pointer relative bg-zinc-900/20">
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => onFileSelect(e.target.files[0])}
                accept={acceptedFileTypes}
            />
            <div className="flex flex-col items-center justify-center space-y-3">
                {fileName ? (
                    <>
                        <div className="bg-cyan-500/10 p-3 rounded-full">
                            <FileAudio className="text-cyan-400 w-8 h-8" />
                        </div>
                        <span className="text-sm font-medium text-white truncate max-w-xs">{fileName}</span>
                        <span className="text-xs text-cyan-500 font-semibold uppercase tracking-wide">File Ready</span>
                    </>
                ) : (
                    <>
                        <div className="bg-zinc-800 p-3 rounded-full group-hover:bg-zinc-700 transition-colors">
                            <UploadCloud className="text-gray-400 w-8 h-8 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                            Drag & drop or click to browse
                        </span>
                        <span className="text-xs text-zinc-600">Max size 2GB</span>
                    </>
                )}
            </div>
        </div>
    </div>
);
