import React, { useState } from 'react';
import { Input } from 'zmp-ui';

interface AIInputProps {
	onSend: (content: string) => void | Promise<void>;
	disabled?: boolean;
}

export const AIInput: React.FC<AIInputProps> = ({ onSend, disabled = false }) => {
	const [value, setValue] = useState('');

	const doSend = async () => {
		const content = value.trim();
		if (!content) return;
		await onSend(content);
		setValue('');
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void doSend();
		}
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white shadow-lg" style={{ zIndex: 40 }}>
			<div className="flex items-center gap-2 max-w-4xl mx-auto">
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
					disabled={disabled || value.trim().length === 0}
					className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white disabled:opacity-30 disabled:bg-gray-300 flex-shrink-0 hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-md font-bold text-lg"
					aria-label="Gửi"
					title="Gửi"
				>
					↑
				</button>
			</div>
		</div>
	);
};
