import React, { useState, useRef } from 'react';
import { Input } from 'zmp-ui';

interface AIInputProps {
	onSend: (content: string, images?: string[]) => void | Promise<void>;
	disabled?: boolean;
	onImagesSelect?: (images: string[]) => void;
}

export const AIInput: React.FC<AIInputProps> = ({ onSend, disabled = false, onImagesSelect }) => {
	const [value, setValue] = useState('');
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const doSend = async () => {
		const content = value.trim();
		if (!content && selectedImages.length === 0) return;
		await onSend(content, selectedImages.length > 0 ? selectedImages : undefined);
		setValue('');
		setSelectedImages([]);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void doSend();
		}
	};

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const imagePaths: string[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				// In real app, you would upload these files and get paths
				// For now, we'll create object URLs as placeholders
				imagePaths.push(URL.createObjectURL(file));
			}
		}

		if (imagePaths.length > 0) {
			setSelectedImages((prev) => [...prev, ...imagePaths]);
			if (onImagesSelect) {
				onImagesSelect([...selectedImages, ...imagePaths]);
			}
		}
	};

	const removeImage = (index: number) => {
		setSelectedImages((prev) => {
			const updated = prev.filter((_, i) => i !== index);
			if (onImagesSelect) {
				onImagesSelect(updated);
			}
			return updated;
		});
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white shadow-lg" style={{ zIndex: 40 }}>
			<div className="max-w-4xl mx-auto">
				{/* Image previews */}
				{selectedImages.length > 0 && (
					<div className="flex gap-2 mb-2 overflow-x-auto pb-2">
						{selectedImages.map((img, index) => (
							<div key={index} className="relative flex-shrink-0">
								<img src={img} alt="" className="w-16 h-16 object-cover rounded border" />
								<button
									onClick={() => removeImage(index)}
									className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
								>
									×
								</button>
							</div>
						))}
					</div>
				)}
				
				<div className="flex items-center gap-2">
					<button
						onClick={handleImageClick}
						disabled={disabled}
						className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30"
						aria-label="Chọn ảnh"
					>
						📷
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={handleFileChange}
						className="hidden"
					/>
					<Input
						type="text"
						placeholder="Hỏi gì cũng được..."
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={onKeyDown}
						disabled={disabled}
						className="flex-1 bg-gray-50 border-gray-200 rounded-full px-4 py-3 text-sm"
					/>
					<button
						onClick={() => void doSend()}
						disabled={disabled || (value.trim().length === 0 && selectedImages.length === 0)}
						className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white disabled:opacity-30 disabled:bg-gray-300 flex-shrink-0 hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-md font-bold text-lg"
						aria-label="Gửi"
						title="Gửi"
					>
						↑
					</button>
				</div>
			</div>
		</div>
	);
};
