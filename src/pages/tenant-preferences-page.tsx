import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Button, Input, Select, Checkbox, useNavigate } from 'zmp-ui';
import useSetHeader from '@/hooks/useSetHeader';
import {
	useRoomPreferences,
	useRoommatePreferences,
	useCreateOrUpdateRoomPreferences,
	useCreateOrUpdateRoommatePreferences,
	useDeleteRoomPreferences,
	useDeleteRoommatePreferences,
} from '@/hooks/useTenantPreferencesService';
import { useAmenities, useRules } from '@/hooks/useReferenceService';
import { formatCurrency } from '@/utils/format';

const { Option } = Select;

const TenantPreferencesPage: React.FC = () => {
	const navigate = useNavigate();
	const setHeader = useSetHeader();

	React.useEffect(() => {
		setHeader({ title: 'Sở thích tìm phòng', hasLeftIcon: true });
	}, [setHeader]);

	const [activeTab, setActiveTab] = useState<'room' | 'roommate'>('room');

	// Fetch reference data
	const { data: amenitiesData } = useAmenities();
	const { data: rulesData } = useRules();

	// Fetch preferences
	const { data: roomPrefs, isLoading: roomPrefsLoading } = useRoomPreferences();
	const { data: roommatePrefs, isLoading: roommatePrefsLoading } = useRoommatePreferences();

	// Mutations
	const createOrUpdateRoomPrefsMutation = useCreateOrUpdateRoomPreferences();
	const createOrUpdateRoommatePrefsMutation = useCreateOrUpdateRoommatePreferences();
	const deleteRoomPrefsMutation = useDeleteRoomPreferences();
	const deleteRoommatePrefsMutation = useDeleteRoommatePreferences();

	// Room Preferences State
	const [roomPreferences, setRoomPreferences] = useState({
		minPrice: '',
		maxPrice: '',
		preferredProvinces: [] as number[],
		preferredDistricts: [] as number[],
		roomType: '',
		minArea: '',
		maxArea: '',
		selectedAmenities: [] as string[],
		selectedRules: [] as string[],
	});

	// Roommate Preferences State
	const [roommatePreferences, setRoommatePreferences] = useState({
		preferredGender: '',
		minAge: '',
		maxAge: '',
		occupation: '',
		smokingAllowed: false,
		drinkingAllowed: false,
		petsAllowed: false,
		nightOwlAcceptable: false,
		cleanlinessLevel: '',
		noiseLevel: '',
	});

	// Initialize room preferences
	useEffect(() => {
		if (roomPrefs) {
			setRoomPreferences({
				minPrice: roomPrefs.minMonthlyRent?.toString() || '',
				maxPrice: roomPrefs.maxMonthlyRent?.toString() || '',
				preferredProvinces: roomPrefs.provinceIds || [],
				preferredDistricts: roomPrefs.districtIds || [],
				roomType: roomPrefs.roomTypes?.[0] || '',
				minArea: roomPrefs.minAreaSqm?.toString() || '',
				maxArea: roomPrefs.maxAreaSqm?.toString() || '',
				selectedAmenities: roomPrefs.requiredAmenities || [],
				selectedRules: [], // Rules will be derived from allowPets, allowSmoking etc
			});
		}
	}, [roomPrefs]);

	// Initialize roommate preferences
	useEffect(() => {
		if (roommatePrefs) {
			setRoommatePreferences({
				preferredGender: roommatePrefs.preferredGender || '',
				minAge: roommatePrefs.minAge?.toString() || '',
				maxAge: roommatePrefs.maxAge?.toString() || '',
				occupation: Array.isArray(roommatePrefs.occupation) ? roommatePrefs.occupation.join(', ') : '',
				smokingAllowed: roommatePrefs.smokingPreference === 'yes',
				drinkingAllowed: false, // Not in backend
				petsAllowed: roommatePrefs.petsPreference === 'yes',
				nightOwlAcceptable: roommatePrefs.scheduleType === 'night_owl',
				cleanlinessLevel: roommatePrefs.cleanlinessLevel || '',
				noiseLevel: roommatePrefs.noiseLevel || '',
			});
		}
	}, [roommatePrefs]);

	const handleSaveRoomPreferences = async () => {
		try {
			await createOrUpdateRoomPrefsMutation.mutateAsync({
				minMonthlyRent: roomPreferences.minPrice ? Number(roomPreferences.minPrice) : undefined,
				maxMonthlyRent: roomPreferences.maxPrice ? Number(roomPreferences.maxPrice) : undefined,
				provinceIds: roomPreferences.preferredProvinces.length > 0 ? roomPreferences.preferredProvinces : undefined,
				districtIds: roomPreferences.preferredDistricts.length > 0 ? roomPreferences.preferredDistricts : undefined,
				roomTypes: roomPreferences.roomType ? [roomPreferences.roomType] : undefined,
				minAreaSqm: roomPreferences.minArea ? Number(roomPreferences.minArea) : undefined,
				maxAreaSqm: roomPreferences.maxArea ? Number(roomPreferences.maxArea) : undefined,
				allowPets: roomPreferences.selectedRules.includes('allow_pets'),
				allowSmoking: roomPreferences.selectedRules.includes('allow_smoking'),
				requiredAmenities: roomPreferences.selectedAmenities.length > 0 ? roomPreferences.selectedAmenities : undefined,
			});
			alert('Đã lưu sở thích tìm phòng');
		} catch (error) {
			console.error('Failed to save room preferences:', error);
			alert('Không thể lưu sở thích');
		}
	};

	const handleSaveRoommatePreferences = async () => {
		try {
			await createOrUpdateRoommatePrefsMutation.mutateAsync({
				preferredGender: roommatePreferences.preferredGender as 'male' | 'female' | 'other' | 'any' | undefined,
				minAge: roommatePreferences.minAge ? Number(roommatePreferences.minAge) : undefined,
				maxAge: roommatePreferences.maxAge ? Number(roommatePreferences.maxAge) : undefined,
				occupation: roommatePreferences.occupation ? roommatePreferences.occupation.split(',').map(o => o.trim()) : undefined,
				smokingPreference: roommatePreferences.smokingAllowed ? 'yes' : 'no',
				petsPreference: roommatePreferences.petsAllowed ? 'yes' : 'no',
				scheduleType: roommatePreferences.nightOwlAcceptable ? 'night_owl' : 'flexible',
				cleanlinessLevel: roommatePreferences.cleanlinessLevel as 'very_clean' | 'clean' | 'moderate' | 'relaxed' | undefined,
				noiseLevel: roommatePreferences.noiseLevel as 'very_quiet' | 'quiet' | 'moderate' | 'lively' | undefined,
			});
			alert('Đã lưu sở thích tìm bạn cùng phòng');
		} catch (error) {
			console.error('Failed to save roommate preferences:', error);
			alert('Không thể lưu sở thích');
		}
	};

	const handleDeleteRoomPreferences = async () => {
		if (confirm('Bạn có chắc muốn xóa sở thích tìm phòng?')) {
			try {
				await deleteRoomPrefsMutation.mutateAsync();
				alert('Đã xóa sở thích tìm phòng');
			} catch (error) {
				console.error('Failed to delete room preferences:', error);
				alert('Không thể xóa sở thích');
			}
		}
	};

	const handleDeleteRoommatePreferences = async () => {
		if (confirm('Bạn có chắc muốn xóa sở thích tìm bạn cùng phòng?')) {
			try {
				await deleteRoommatePrefsMutation.mutateAsync();
				alert('Đã xóa sở thích tìm bạn cùng phòng');
			} catch (error) {
				console.error('Failed to delete roommate preferences:', error);
				alert('Không thể xóa sở thích');
			}
		}
	};

	const renderRoomPreferences = () => (
		<Box className="space-y-4">
			{/* Price Range */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Giá thuê</Text>
				<Box className="grid grid-cols-2 gap-3">
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Từ (VNĐ)</Text>
						<Input
							type="number"
							placeholder="0"
							value={roomPreferences.minPrice}
							onChange={(e) =>
								setRoomPreferences({ ...roomPreferences, minPrice: e.target.value })
							}
						/>
					</Box>
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Đến (VNĐ)</Text>
						<Input
							type="number"
							placeholder="10000000"
							value={roomPreferences.maxPrice}
							onChange={(e) =>
								setRoomPreferences({ ...roomPreferences, maxPrice: e.target.value })
							}
						/>
					</Box>
				</Box>
			</Box>

			{/* Room Type */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Loại phòng</Text>
				<Select
					value={roomPreferences.roomType}
					onChange={(value) => setRoomPreferences({ ...roomPreferences, roomType: value as string })}
					placeholder="Chọn loại phòng"
				>
					<Option value="" title="Tất cả" />
					<Option value="single" title="Phòng đơn" />
					<Option value="shared" title="Phòng chia sẻ" />
					<Option value="studio" title="Phòng studio" />
					<Option value="apartment" title="Căn hộ" />
				</Select>
			</Box>

			{/* Area Range */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Diện tích (m²)</Text>
				<Box className="grid grid-cols-2 gap-3">
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Tối thiểu</Text>
						<Input
							type="number"
							placeholder="15"
							value={roomPreferences.minArea}
							onChange={(e) =>
								setRoomPreferences({ ...roomPreferences, minArea: e.target.value })
							}
						/>
					</Box>
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Tối đa</Text>
						<Input
							type="number"
							placeholder="50"
							value={roomPreferences.maxArea}
							onChange={(e) =>
								setRoomPreferences({ ...roomPreferences, maxArea: e.target.value })
							}
						/>
					</Box>
				</Box>
			</Box>

			{/* Amenities */}
			{amenitiesData && amenitiesData.length > 0 && (
				<Box className="bg-white rounded-lg p-4 shadow-sm">
					<Text className="font-semibold text-gray-800 mb-3">Tiện nghi yêu cầu</Text>
					<Box className="space-y-3">
					{amenitiesData.map((amenity) => (
						<Checkbox
							key={amenity.id}
							value={amenity.id}
							label={amenity.name}
							checked={roomPreferences.selectedAmenities.includes(amenity.id)}
							onChange={(e) => {
								const newAmenities = e.target.checked
									? [...roomPreferences.selectedAmenities, amenity.id]
									: roomPreferences.selectedAmenities.filter((a) => a !== amenity.id);
								setRoomPreferences({ ...roomPreferences, selectedAmenities: newAmenities });
							}}
						/>
					))}
					</Box>
				</Box>
			)}

			{/* Rules */}
			{rulesData && rulesData.length > 0 && (
				<Box className="bg-white rounded-lg p-4 shadow-sm">
					<Text className="font-semibold text-gray-800 mb-3">Quy định chấp nhận</Text>
					<Box className="space-y-3">
					{rulesData.map((rule) => (
						<Checkbox
							key={rule.id}
							value={rule.id}
							label={rule.name}
							checked={roomPreferences.selectedRules.includes(rule.id)}
							onChange={(e) => {
								const newRules = e.target.checked
									? [...roomPreferences.selectedRules, rule.id]
									: roomPreferences.selectedRules.filter((r) => r !== rule.id);
								setRoomPreferences({ ...roomPreferences, selectedRules: newRules });
							}}
						/>
					))}
					</Box>
				</Box>
			)}

			{/* Action Buttons */}
			<Box className="space-y-3">
				<Button
					fullWidth
					variant="primary"
					onClick={handleSaveRoomPreferences}
					disabled={createOrUpdateRoomPrefsMutation.isPending}
				>
					{createOrUpdateRoomPrefsMutation.isPending ? 'Đang lưu...' : 'Lưu sở thích'}
				</Button>
				{roomPrefs && (
					<Button
						fullWidth
						variant="tertiary"
						onClick={handleDeleteRoomPreferences}
						disabled={deleteRoomPrefsMutation.isPending}
					>
						Xóa sở thích
					</Button>
				)}
			</Box>
		</Box>
	);

	const renderRoommatePreferences = () => (
		<Box className="space-y-4">
			{/* Gender Preference */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Giới tính ưu tiên</Text>
				<Select
					value={roommatePreferences.preferredGender}
					onChange={(value) =>
						setRoommatePreferences({ ...roommatePreferences, preferredGender: value as string })
					}
					placeholder="Chọn giới tính"
				>
					<Option value="" title="Không yêu cầu" />
					<Option value="male" title="Nam" />
					<Option value="female" title="Nữ" />
					<Option value="other" title="Khác" />
				</Select>
			</Box>

			{/* Age Range */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Độ tuổi</Text>
				<Box className="grid grid-cols-2 gap-3">
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Từ</Text>
						<Input
							type="number"
							placeholder="18"
							value={roommatePreferences.minAge}
							onChange={(e) =>
								setRoommatePreferences({ ...roommatePreferences, minAge: e.target.value })
							}
						/>
					</Box>
					<Box>
						<Text className="text-sm text-gray-600 mb-2">Đến</Text>
						<Input
							type="number"
							placeholder="35"
							value={roommatePreferences.maxAge}
							onChange={(e) =>
								setRoommatePreferences({ ...roommatePreferences, maxAge: e.target.value })
							}
						/>
					</Box>
				</Box>
			</Box>

			{/* Occupation */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Nghề nghiệp</Text>
				<Select
					value={roommatePreferences.occupation}
					onChange={(value) =>
						setRoommatePreferences({ ...roommatePreferences, occupation: value as string })
					}
					placeholder="Chọn nghề nghiệp"
				>
					<Option value="" title="Không yêu cầu" />
					<Option value="student" title="Sinh viên" />
					<Option value="office_worker" title="Nhân viên văn phòng" />
					<Option value="freelancer" title="Freelancer" />
					<Option value="other" title="Khác" />
				</Select>
			</Box>

			{/* Lifestyle */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Lối sống</Text>
				<Box className="space-y-3">
					<Checkbox
						value="smoking"
						label="Chấp nhận hút thuốc"
						checked={roommatePreferences.smokingAllowed}
						onChange={(e) =>
							setRoommatePreferences({
								...roommatePreferences,
								smokingAllowed: e.target.checked,
							})
						}
					/>
					<Checkbox
						value="drinking"
						label="Chấp nhận uống rượu"
						checked={roommatePreferences.drinkingAllowed}
						onChange={(e) =>
							setRoommatePreferences({
								...roommatePreferences,
								drinkingAllowed: e.target.checked,
							})
						}
					/>
					<Checkbox
						value="pets"
						label="Chấp nhận nuôi thú cưng"
						checked={roommatePreferences.petsAllowed}
						onChange={(e) =>
							setRoommatePreferences({
								...roommatePreferences,
								petsAllowed: e.target.checked,
							})
						}
					/>
					<Checkbox
						value="night_owl"
						label="Chấp nhận thức khuya"
						checked={roommatePreferences.nightOwlAcceptable}
						onChange={(e) =>
							setRoommatePreferences({
								...roommatePreferences,
								nightOwlAcceptable: e.target.checked,
							})
						}
					/>
				</Box>
			</Box>

			{/* Cleanliness Level */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Mức độ sạch sẽ</Text>
				<Select
					value={roommatePreferences.cleanlinessLevel}
					onChange={(value) =>
						setRoommatePreferences({
							...roommatePreferences,
							cleanlinessLevel: value as string,
						})
					}
					placeholder="Chọn mức độ"
				>
					<Option value="" title="Không yêu cầu" />
					<Option value="very_clean" title="Rất sạch sẽ" />
					<Option value="clean" title="Sạch sẽ" />
					<Option value="normal" title="Bình thường" />
					<Option value="relaxed" title="Thoải mái" />
				</Select>
			</Box>

			{/* Noise Level */}
			<Box className="bg-white rounded-lg p-4 shadow-sm">
				<Text className="font-semibold text-gray-800 mb-3">Mức độ ồn</Text>
				<Select
					value={roommatePreferences.noiseLevel}
					onChange={(value) =>
						setRoommatePreferences({ ...roommatePreferences, noiseLevel: value as string })
					}
					placeholder="Chọn mức độ"
				>
					<Option value="" title="Không yêu cầu" />
					<Option value="quiet" title="Yên tĩnh" />
					<Option value="moderate" title="Vừa phải" />
					<Option value="lively" title="Sôi động" />
				</Select>
			</Box>

			{/* Action Buttons */}
			<Box className="space-y-3">
				<Button
					fullWidth
					variant="primary"
					onClick={handleSaveRoommatePreferences}
					disabled={createOrUpdateRoommatePrefsMutation.isPending}
				>
					{createOrUpdateRoommatePrefsMutation.isPending ? 'Đang lưu...' : 'Lưu sở thích'}
				</Button>
				{roommatePrefs && (
					<Button
						fullWidth
						variant="tertiary"
						onClick={handleDeleteRoommatePreferences}
						disabled={deleteRoommatePrefsMutation.isPending}
					>
						Xóa sở thích
					</Button>
				)}
			</Box>
		</Box>
	);

	return (
		<Page className="bg-gray-50">
			<Box className="p-4">
				{/* Info Card */}
				<Box className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
					<Text className="text-sm text-blue-800">
						💡 Thiết lập sở thích giúp chúng tôi đề xuất phòng và bạn cùng phòng phù hợp nhất với
						bạn.
					</Text>
				</Box>

				{/* Tabs */}
				<Box className="flex space-x-2 mb-4 bg-white rounded-lg p-1 shadow-sm">
					<Button
						size="small"
						variant={activeTab === 'room' ? 'primary' : 'tertiary'}
						onClick={() => setActiveTab('room')}
						className="flex-1"
					>
						Tìm phòng
					</Button>
					<Button
						size="small"
						variant={activeTab === 'roommate' ? 'primary' : 'tertiary'}
						onClick={() => setActiveTab('roommate')}
						className="flex-1"
					>
						Tìm bạn cùng phòng
					</Button>
				</Box>

				{/* Content */}
				{activeTab === 'room' ? renderRoomPreferences() : renderRoommatePreferences()}
			</Box>
		</Page>
	);
};

export default TenantPreferencesPage;
