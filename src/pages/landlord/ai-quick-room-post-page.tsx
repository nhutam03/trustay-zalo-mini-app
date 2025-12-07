import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Page, Box, Input, Button, Text } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { postAIRoomPublish } from '@/services/ai-service';
import { RoomPublishingStatus, type RoomPublishResponse } from '@/interfaces/ai';
import { useUploadBulkImages } from '@/hooks/useUploadService';
import { processImageUrl } from '@/utils/image-proxy';
import useSetHeader from '@/hooks/useSetHeader';

interface ImagePreview {
	id: string;
	file?: File;
	uploadPath?: string;
	isUploading: boolean;
	uploadError?: boolean;
}

type DialogState = 'form' | 'loading' | 'clarification' | 'ready-to-create' | 'created' | 'creation-failed';

interface ConversationMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

// Helper function to translate plan description
const translatePlanDescription = (description: string): string => {
	const translations: Record<string, string> = {
		'Create building (if needed) then create room with collected draft data.':
			'Tạo tòa nhà (nếu cần) sau đó tạo phòng với dữ liệu đã thu thập.',
		'Create room with collected draft data.':
			'Tạo phòng với dữ liệu đã thu thập.',
		'Create building then create room.':
			'Tạo tòa nhà sau đó tạo phòng.',
		'Create room in existing building.':
			'Tạo phòng trong tòa nhà hiện có.',
	};

	return translations[description] || description;
};

const AIQuickRoomPostPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();

	useEffect(() => {
		setHeader({
			customTitle: 'Tạo Phòng Nhanh với AI',
			hasLeftIcon: true,
			type: 'primary',
		});
	}, [setHeader]);

	const [description, setDescription] = useState('');
	const [images, setImages] = useState<ImagePreview[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dialogState, setDialogState] = useState<DialogState>('form');
	const [replyText, setReplyText] = useState('');
	const [publishPlan, setPublishPlan] = useState<RoomPublishResponse['data'] | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [creationError, setCreationError] = useState<string | null>(null);
	const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadBulkImagesMutation = useUploadBulkImages();
	const MAX_IMAGES = 5;

	// Auto scroll to bottom
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [conversationMessages, isThinking]);

	const sendRoomPublishMessage = async (
		message: string,
		imagePaths?: string[],
		buildingId?: string,
	): Promise<RoomPublishResponse> => {
		return await postAIRoomPublish(message, imagePaths, buildingId);
	};

	const handleResponse = (response: RoomPublishResponse) => {
		const data = response.data;
		if (!data) return;

		// Add assistant message to conversation for clarification
		const assistantMessage: ConversationMessage = {
			id: `assistant_${Date.now()}`,
			role: 'assistant',
			content: data.message || '',
			timestamp: data.timestamp || new Date().toISOString(),
		};

		const status = data.payload?.status;

		switch (status) {
			case RoomPublishingStatus.NEED_MORE_INFO:
				// Store the message for display
				setConversationMessages((prev) => [...prev, assistantMessage]);
				// Also set clarification state
				setDialogState('clarification');
				break;

			case RoomPublishingStatus.READY_TO_CREATE:
				setPublishPlan(data);
				setDialogState('ready-to-create');
				break;

			case RoomPublishingStatus.CREATED:
				setPublishPlan(data);
				setDialogState('created');
				if (data.payload?.roomId) {
					setTimeout(() => {
						navigate(`/landlord/rooms/${data.payload!.roomId}`);
					}, 2000);
				}
				break;

			case RoomPublishingStatus.CREATION_FAILED:
				setCreationError(data.payload?.error || data.message || 'Không thể tạo phòng');
				setDialogState('creation-failed');
				break;

			default:
				setConversationMessages((prev) => [...prev, assistantMessage]);
				setDialogState('clarification');
				break;
		}
	};

	const handleImagePicker = async () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const remainingSlots = MAX_IMAGES - images.length;
		if (remainingSlots <= 0) return;

		const filesToProcess = Array.from(files).slice(0, remainingSlots);

		// Create loading placeholders
		const newImageIds = filesToProcess.map(() => Math.random().toString(36).substr(2, 9));
		const loadingImages: ImagePreview[] = newImageIds.map((id, index) => ({
			id,
			file: filesToProcess[index],
			isUploading: true,
		}));

		setImages((prev) => [...prev, ...loadingImages]);

		// Upload images
		try {
			const uploadResult = await uploadBulkImagesMutation.mutateAsync({
				files: filesToProcess,
			});

			if (uploadResult.results) {
				setImages((prev) =>
					prev.map((img) => {
						const loadingImageIndex = loadingImages.findIndex((li) => li.id === img.id);
						if (loadingImageIndex !== -1 && uploadResult.results[loadingImageIndex]) {
							return {
								id: img.id,
								uploadPath: uploadResult.results[loadingImageIndex].imagePath,
								isUploading: false,
							};
						}
						return img;
					}),
				);
			}
		} catch (error) {
			console.error('Failed to upload images:', error);
			setImages((prev) =>
				prev.map((img) => {
					if (loadingImages.some((li) => li.id === img.id)) {
						return { ...img, isUploading: false, uploadError: true };
					}
					return img;
				}),
			);
		}

		// Reset input
		if (event.target) {
			event.target.value = '';
		}
	};

	const removeImage = (id: string) => {
		setImages((prev) => prev.filter((img) => img.id !== id));
	};

	const handleSubmit = async () => {
		const content = description.trim();
		if (!content && images.length === 0) return;

		const hasUploadingImages = images.some((img) => img.isUploading);
		if (hasUploadingImages) return;

		const imagePaths = images
			.filter((img) => img.uploadPath && !img.isUploading && !img.uploadError)
			.map((img) => img.uploadPath!);

		try {
			setIsSubmitting(true);
			const messageContent = content || 'Đăng tải phòng trọ';

			const userMessage: ConversationMessage = {
				id: `user_${Date.now()}`,
				role: 'user',
				content: messageContent,
				timestamp: new Date().toISOString(),
			};
			setConversationMessages([userMessage]);

			setDialogState('loading');

			const response = await sendRoomPublishMessage(
				messageContent,
				imagePaths.length > 0 ? imagePaths : undefined,
			);

			handleResponse(response);
			setDescription('');
		} catch (error) {
			console.error('Failed to send:', error);
			// Show error in form state
			setDialogState('form');
			alert((error as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReply = async (question?: string) => {
		const content = question || replyText.trim();
		if (!content || isThinking) return;

		try {
			const userMessage: ConversationMessage = {
				id: `user_${Date.now()}`,
				role: 'user',
				content,
				timestamp: new Date().toISOString(),
			};
			setConversationMessages((prev) => [...prev, userMessage]);

			setReplyText('');
			setIsThinking(true);
			if (dialogState === 'clarification') {
				setDialogState('loading');
			}

			const imagePaths = images
				.filter((img) => img.uploadPath && !img.isUploading && !img.uploadError)
				.map((img) => img.uploadPath!);

			const response = await sendRoomPublishMessage(
				content,
				imagePaths.length > 0 ? imagePaths : undefined,
			);

			handleResponse(response);
		} catch (error) {
			console.error('Failed to reply:', error);
		} finally {
			setIsThinking(false);
		}
	};

	const handleCreateRoom = async () => {
		if (!publishPlan) return;

		try {
			setIsCreating(true);
			setDialogState('loading');

			const imagePaths = images
				.filter((img) => img.uploadPath && !img.isUploading && !img.uploadError)
				.map((img) => img.uploadPath!);

			const response = await sendRoomPublishMessage(
				'',
				imagePaths.length > 0 ? imagePaths : undefined,
			);

			handleResponse(response);
		} catch (error) {
			console.error('Failed to create room:', error);
			setDialogState('ready-to-create');
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Page className="bg-gray-50">
			<Box className="p-4 space-y-4">
				{dialogState === 'form' && (
					<Box className="bg-white rounded-lg shadow p-4 space-y-4">
						<Text size="small" className="text-gray-600">
							Mô tả phòng trọ của bạn và thêm hình ảnh. AI sẽ giúp bạn tạo bài đăng hoàn chỉnh.
						</Text>

						{/* Images preview */}
						{images.length > 0 && (
							<div className="flex gap-2 overflow-x-auto pb-2">
								{images.map((img) => (
									<div key={img.id} className="relative flex-shrink-0">
										{img.uploadPath ? (
											<img
												src={processImageUrl(img.uploadPath)}
												alt=""
												className="w-20 h-20 object-cover rounded border"
												crossOrigin="anonymous"
											/>
										) : (
											<div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
												<span className="text-gray-400 text-xs">📷</span>
											</div>
										)}
										{img.isUploading && (
											<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
											</div>
										)}
										{img.uploadError && (
											<div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center rounded">
												<Text size="xSmall" className="text-white">
													Lỗi
												</Text>
											</div>
										)}
										<button
											onClick={() => removeImage(img.id)}
											disabled={img.isUploading}
											className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs disabled:opacity-50"
										>
											×
										</button>
									</div>
								))}
							</div>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleFileChange}
							className="hidden"
						/>

						<Button
							onClick={handleImagePicker}
							disabled={images.length >= MAX_IMAGES}
							variant="secondary"
							fullWidth
						>
							📷 Chọn ảnh ({images.length}/{MAX_IMAGES})
						</Button>

						<Input.TextArea
							placeholder="Mô tả phòng trọ của bạn..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={1000}
							showCount
							rows={6}
						/>

						<Button
							onClick={handleSubmit}
							disabled={
								isSubmitting ||
								(!description.trim() && images.length === 0) ||
								images.some((img) => img.isUploading)
							}
							fullWidth
						>
							{isSubmitting ? 'Đang xử lý...' : '✨ Tạo phòng ngay'}
						</Button>
					</Box>
				)}

				{dialogState === 'loading' && (
					<Box className="bg-white rounded-lg shadow p-8 text-center">
						<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<Text className="text-gray-600">AI đang xử lý yêu cầu của bạn...</Text>
					</Box>
				)}

				{dialogState === 'clarification' && (
					<Box className="bg-white rounded-lg shadow p-4 space-y-4">
						<Text size="small" className="text-gray-600 mb-2">
							Tiếp tục trò chuyện với AI để hoàn thiện bài đăng của bạn.
						</Text>

						{/* Conversation Messages */}
						<div className="max-h-96 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded p-3">
							{conversationMessages.map((msg) => (
								<div
									key={msg.id}
									className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
											msg.role === 'user'
												? 'bg-blue-500 text-white'
												: 'bg-white text-gray-800 border'
										}`}
									>
										{msg.content}
									</div>
								</div>
							))}
							{isThinking && (
								<div className="flex justify-start">
									<div className="bg-white border rounded-lg px-3 py-2 text-sm">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: '0.1s' }}
											/>
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: '0.2s' }}
											/>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Reply Input */}
						<div className="space-y-2">
							<Input
								placeholder="Trả lời AI..."
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter' && !isThinking) {
										void handleReply();
									}
								}}
								disabled={isThinking}
							/>
							<Button onClick={() => handleReply()} disabled={!replyText.trim() || isThinking} fullWidth>
								{isThinking ? 'Đang gửi...' : 'Gửi'}
							</Button>
						</div>
					</Box>
				)}

				{dialogState === 'ready-to-create' && publishPlan?.payload?.plan && (
					<Box className="bg-white rounded-lg shadow p-4 space-y-4">
						<Box className="bg-green-50 border border-green-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<span className="text-green-600 text-2xl">✓</span>
								<div className="flex-1">
									<Text className="text-green-800 font-bold text-base mb-1">Sẵn sàng tạo phòng!</Text>
									<Text size="small" className="text-green-700">
										{publishPlan.message || 'AI đã hoàn thiện bài đăng. Bạn có muốn tạo ngay không?'}
									</Text>
								</div>
							</div>
						</Box>

						<Box className="space-y-3 max-h-96 overflow-y-auto">
							<Text bold className="text-gray-800 mb-2">
								📋 Thông tin sẽ được tạo:
							</Text>

							{/* Building Info */}
							{publishPlan.payload.plan.shouldCreateBuilding &&
								publishPlan.payload.plan.buildingPayload && (
									<Box className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
										<div className="flex items-center gap-2 mb-2">
											<Text bold size="small" className="text-blue-600">
												🏢 Tòa nhà mới
											</Text>
										</div>
										<div className="space-y-1 text-sm">
											<div className="flex">
												<span className="text-gray-600 w-24">Tên:</span>
												<span className="text-gray-800 font-medium">
													{publishPlan.payload.plan.buildingPayload.name}
												</span>
											</div>
											<div className="flex">
												<span className="text-gray-600 w-24">Địa chỉ:</span>
												<span className="text-gray-800">
													{publishPlan.payload.plan.buildingPayload.addressLine1}
												</span>
											</div>
											<div className="flex">
												<span className="text-gray-600 w-24">Khu vực:</span>
												<span className="text-gray-800">
													Ward {publishPlan.payload.plan.buildingPayload.wardId}, District{' '}
													{publishPlan.payload.plan.buildingPayload.districtId}
												</span>
											</div>
										</div>
									</Box>
								)}

							{/* Room Info */}
							{publishPlan.payload.plan.roomPayload && (
								<Box className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
									<div className="flex items-center gap-2 mb-2">
										<Text bold size="small" className="text-green-600">
											🚪 Thông tin phòng
										</Text>
									</div>
									<div className="space-y-1 text-sm">
										<div className="flex">
											<span className="text-gray-600 w-32">Tên phòng:</span>
											<span className="text-gray-800 font-medium">
												{publishPlan.payload.plan.roomPayload.name}
											</span>
										</div>
										{publishPlan.payload.plan.roomPayload.areaSqm && (
											<div className="flex">
												<span className="text-gray-600 w-32">Diện tích:</span>
												<span className="text-gray-800">
													{publishPlan.payload.plan.roomPayload.areaSqm} m²
												</span>
											</div>
										)}
										{publishPlan.payload.plan.roomPayload.maxOccupancy && (
											<div className="flex">
												<span className="text-gray-600 w-32">Số người tối đa:</span>
												<span className="text-gray-800">
													{publishPlan.payload.plan.roomPayload.maxOccupancy} người
												</span>
											</div>
										)}
										{publishPlan.payload.plan.roomPayload.pricing && (
											<>
												<div className="flex">
													<span className="text-gray-600 w-32">Giá thuê:</span>
													<span className="font-semibold text-red-600">
														{publishPlan.payload.plan.roomPayload.pricing.basePriceMonthly?.toLocaleString(
															'vi-VN',
														)}{' '}
														đ/tháng
													</span>
												</div>
												<div className="flex">
													<span className="text-gray-600 w-32">Tiền cọc:</span>
													<span className="text-gray-800">
														{publishPlan.payload.plan.roomPayload.pricing.depositAmount?.toLocaleString(
															'vi-VN',
														)}{' '}
														đ
													</span>
												</div>
											</>
										)}
										{publishPlan.payload.plan.roomPayload.description && (
											<div className="mt-2 pt-2 border-t border-gray-100">
												<span className="text-gray-600 block mb-1">Mô tả:</span>
												<div
													className="text-gray-800 text-xs"
													dangerouslySetInnerHTML={{
														__html: publishPlan.payload.plan.roomPayload.description,
													}}
												/>
											</div>
										)}
										{publishPlan.payload.plan.roomPayload.amenities &&
											publishPlan.payload.plan.roomPayload.amenities.length > 0 && (
												<div className="mt-2 pt-2 border-t border-gray-100">
													<span className="text-gray-600 block mb-1">Tiện nghi:</span>
													<div className="text-gray-800 text-xs">
														{publishPlan.payload.plan.roomPayload.amenities.length} tiện nghi được
														chọn
													</div>
												</div>
											)}
										{publishPlan.payload.plan.roomPayload.images?.images &&
											publishPlan.payload.plan.roomPayload.images.images.length > 0 && (
												<div className="mt-2 pt-2 border-t border-gray-100">
													<span className="text-gray-600 block mb-1">Hình ảnh:</span>
													<div className="flex gap-2 flex-wrap">
														{publishPlan.payload.plan.roomPayload.images.images
															.slice(0, 3)
															.map((img, idx) => (
																<div
																	key={idx}
																	className="w-16 h-16 bg-gray-100 rounded border overflow-hidden"
																>
																	<img
																		src={processImageUrl(img.path)}
																		alt={img.alt || `Image ${idx + 1}`}
																		crossOrigin="anonymous"
																		className="w-full h-full object-cover"
																	/>
																</div>
															))}
														{publishPlan.payload.plan.roomPayload.images.images.length > 3 && (
															<div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
																<Text size="xSmall" className="text-gray-600">
																	+{publishPlan.payload.plan.roomPayload.images.images.length - 3}
																</Text>
															</div>
														)}
													</div>
												</div>
											)}
									</div>
								</Box>
							)}

							{publishPlan.payload.plan.description && (
								<Box className="bg-blue-50 border border-blue-200 rounded-lg p-3">
									<Text size="xSmall" className="text-blue-800">
										💡 {translatePlanDescription(publishPlan.payload.plan.description)}
									</Text>
								</Box>
							)}
						</Box>

						<div className="flex gap-2">
							<Button
								onClick={() => navigate(-1)}
								disabled={isCreating}
								variant="secondary"
								fullWidth
							>
								Hủy
							</Button>
							<Button onClick={handleCreateRoom} disabled={isCreating} fullWidth>
								{isCreating ? 'Đang tạo...' : '✨ Tạo phòng ngay'}
							</Button>
						</div>
					</Box>
				)}

				{dialogState === 'created' && (
					<Box className="bg-white rounded-lg shadow p-8">
						<Box className="flex flex-col items-center justify-center space-y-6">
							<Box className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
								<Text className="text-6xl">✅</Text>
							</Box>
							<Box className="text-center space-y-2">
								<Text bold size="xLarge" className="text-green-600">
									Tạo phòng thành công!
								</Text>
								<Text size="small" className="text-gray-600">
									{publishPlan?.message || 'Phòng trọ của bạn đã được tạo và đang chờ duyệt'}
								</Text>
							</Box>
							<Box className="w-full space-y-3">
								<Button
									fullWidth
									variant="primary"
									onClick={() => {
										if (publishPlan?.payload?.roomId) {
											navigate(`/landlord/rooms/${publishPlan.payload.roomId}`);
										} else {
											navigate('/landlord/rooms');
										}
									}}
								>
									Xem phòng đã tạo
								</Button>
								<Button
									fullWidth
									variant="secondary"
									onClick={() => {
										setConversationMessages([]);
										setPublishPlan(null);
										setDialogState('form');
										setImages([]);
										setDescription('');
									}}
								>
									Tạo phòng khác
								</Button>
							</Box>
						</Box>
					</Box>
				)}

				{dialogState === 'creation-failed' && (
					<Box className="bg-white rounded-lg shadow p-8">
						<Box className="flex flex-col items-center justify-center space-y-6">
							<Box className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
								<Text className="text-6xl">❌</Text>
							</Box>
							<Box className="text-center space-y-2">
								<Text bold size="xLarge" className="text-red-600">
									Tạo phòng thất bại
								</Text>
								<Text size="small" className="text-gray-600">
									{creationError || 'Đã xảy ra lỗi khi tạo phòng. Vui lòng thử lại.'}
								</Text>
							</Box>
							<Box className="w-full space-y-3">
								<Button
									fullWidth
									variant="primary"
									onClick={() => {
										setDialogState('ready-to-create');
										setCreationError(null);
									}}
								>
									Thử lại
								</Button>
								<Button fullWidth variant="secondary" onClick={() => navigate(-1)}>
									Quay lại
								</Button>
							</Box>
						</Box>
					</Box>
				)}
			</Box>
		</Page>
	);
};

export default AIQuickRoomPostPage;
