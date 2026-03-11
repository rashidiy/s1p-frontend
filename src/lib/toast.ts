import { toast } from 'sonner';
import type { AxiosError } from 'axios';

// ============================================================================
// TOAST UTILITIES - Consistent notification helpers
// ============================================================================

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (id: string | number) => {
  toast.dismiss(id);
};

// ============================================================================
// API ERROR HANDLER - Extracts meaningful messages from API errors
// ============================================================================

export interface ErrorTranslations {
  validationError?: string;
  sessionExpired?: string;
  accessDenied?: string;
  accessDeniedDetail?: string;
  notFound?: string;
  notFoundDetail?: string;
  conflict?: string;
  conflictDetail?: string;
}

export const handleApiError = (error: unknown, fallbackMessage = 'An error occurred', translations?: ErrorTranslations): void => {
  const axiosError = error as AxiosError<{ detail: string | Array<{ msg: string; loc: string[] }> }>;

  if (axiosError?.response?.data?.detail) {
    const detail = axiosError.response.data.detail;

    if (typeof detail === 'string') {
      showError(detail);
      return;
    }

    // Pydantic validation errors — array of error objects
    if (Array.isArray(detail)) {
      const messages = detail
        .map((err) => `${err.loc?.slice(-1)[0] ?? 'field'}: ${err.msg}`)
        .join(', ');
      showError(translations?.validationError ?? 'Validation Error', messages);
      return;
    }
  }

  if (axiosError?.response?.status === 401) {
    showError(translations?.sessionExpired ?? 'Session expired. Please log in again.');
    return;
  }

  if (axiosError?.response?.status === 403) {
    showError(
      translations?.accessDenied ?? 'Access denied',
      translations?.accessDeniedDetail ?? 'You do not have permission to perform this action.',
    );
    return;
  }

  if (axiosError?.response?.status === 404) {
    showError(
      translations?.notFound ?? 'Not found',
      translations?.notFoundDetail ?? 'The requested resource could not be found.',
    );
    return;
  }

  if (axiosError?.response?.status === 409) {
    showError(
      translations?.conflict ?? 'Conflict',
      translations?.conflictDetail ?? 'A record with these details already exists.',
    );
    return;
  }

  if (axiosError?.message) {
    showError(fallbackMessage, axiosError.message);
    return;
  }

  showError(fallbackMessage);
};
