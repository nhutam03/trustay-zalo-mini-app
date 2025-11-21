import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Text } from 'zmp-ui';

interface AIMessageMarkdownProps {
	content: string;
	onOpenTable?: (table: React.ReactNode) => void;
}

export const AIMessageMarkdown: React.FC<AIMessageMarkdownProps> = ({ content, onOpenTable }) => {
	return (
		<ReactMarkdown
			components={{
				a: (props) => (
					<a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
						{props.children}
					</a>
				),
				table: ({ children, ...props }) => (
					<div className="space-y-2">
						<div className="overflow-auto max-h-48">
							<table {...props} className="min-w-full text-xs border bg-white">
								{children as React.ReactNode}
							</table>
						</div>
						{onOpenTable && (
							<div>
								<button
									className="text-xs text-blue-700 hover:underline"
									onClick={() => {
										onOpenTable(
											<div className="overflow-auto max-h-[70vh]">
												<table className="min-w-full text-sm border bg-white">
													{children as React.ReactNode}
												</table>
											</div>,
										);
									}}
								>
									Xem chi tiết
								</button>
							</div>
						)}
					</div>
				),
				pre: ({ children }) => (
					<pre className="overflow-auto max-h-64 bg-gray-100 p-2 rounded">
						{children as React.ReactNode}
					</pre>
				),
				code: (props) => (
					<code className={`${props.className} bg-gray-100 px-1 rounded`}>
						{props.children as React.ReactNode}
					</code>
				),
				img: ({ src, alt }) => {
					const s = typeof src === 'string' ? src : undefined;
					return s ? (
						<img src={s} alt={alt || ''} className="max-w-full h-auto rounded border" />
					) : null;
				},
			}}
		>
			{content}
		</ReactMarkdown>
	);
};
