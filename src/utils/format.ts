/**
 * Format currency to Vietnamese Dong format
 */
export function formatCurrency(amount: number, currency = 'VND'): string {
	if (currency === 'VND') {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
	}).format(amount);
}

/**
 * Format currency in compact format (e.g., 1M, 2.5M)
 */
export function formatCurrencyCompact(amount: number): string {
	if (amount >= 1000000000) {
		return `${(amount / 1000000000).toFixed(1)}B`;
	}
	if (amount >= 1000000) {
		return `${(amount / 1000000).toFixed(1)}M`;
	}
	if (amount >= 1000) {
		return `${(amount / 1000).toFixed(1)}K`;
	}
	return amount.toString();
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
	const defaultOptions: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	};
	return new Date(date).toLocaleDateString('vi-VN', options || defaultOptions);
}

/**
 * Format datetime to Vietnamese locale
 */
export function formatDateTime(date: string | Date): string {
	return new Date(date).toLocaleString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Format phone number to Vietnamese format
 */
export function formatPhoneNumber(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length === 10) {
		return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
	}
	return phone;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat('vi-VN').format(num);
}
