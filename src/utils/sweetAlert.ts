import Swal, { type SweetAlertOptions } from 'sweetalert2'
import i18n from '../i18n'

// Helper function to get translations
const t = (key: string, params?: Record<string, any>) => {
  return i18n.global.t(key, params)
}

// Default configuration for dark theme
const defaultConfig: SweetAlertOptions = {
  background: '#374151',
  color: '#ffffff',
  confirmButtonColor: '#EC4899',
  cancelButtonColor: '#6B7280',
  customClass: {
    popup: 'swal-dark-popup',
    title: 'swal-dark-title',
    confirmButton: 'swal-dark-confirm',
    cancelButton: 'swal-dark-cancel',
  },
}

// Create a configured Swal instance
const Toast = Swal.mixin({
  ...defaultConfig,
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

// Utility functions for common alert types
export const SweetAlert = {
  // Success alerts
  success: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'success',
      title,
      text,
      confirmButtonText: t('common.ok'),
    })
  },

  // Error alerts
  error: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'error',
      title,
      text,
      confirmButtonText: t('common.ok'),
    })
  },

  // Warning alerts
  warning: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text,
      confirmButtonText: t('common.ok'),
    })
  },

  // Info alerts
  info: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'info',
      title,
      text,
      confirmButtonText: t('common.ok'),
    })
  },

  // Question/Confirmation alerts
  // Question/Confirmation alerts
  question: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text,
      confirmButtonText: t('common.ok'),
    })
  },

  // Confirmation with cancel option
  confirm: (title: string, text: string, confirmButtonText: string, cancelButtonText: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    })
  },

  // Loading state
  loading: (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  },

  // Toast notifications
  toast: {
    success: (title: string) => {
      return Toast.fire({
        icon: 'success',
        title,
      })
    },
    error: (title: string) => {
      return Toast.fire({
        icon: 'error',
        title,
      })
    },
    warning: (title: string) => {
      return Toast.fire({
        icon: 'warning',
        title,
      })
    },
    info: (title: string) => {
      return Toast.fire({
        icon: 'info',
        title,
      })
    },
  },

  // Form-related alerts
  form: {
    loadingError: (formType: string) => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.loadingError'),
        text: t('alerts.error.loadingData', { type: formType }),
        confirmButtonText: t('common.ok'),
      })
    },
  },

  // Validation alerts
  validation: {
    required: (field: string) => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.validationError'),
        text: t('validation.required', { field }),
        confirmButtonText: t('common.ok'),
      })
    },
    invalidEmail: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.validationError'),
        text: t('validation.invalidEmail'),
        confirmButtonText: t('common.ok'),
      })
    },
    invalidPhone: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.validationError'),
        text: t('validation.invalidPhone'),
        confirmButtonText: t('common.ok'),
      })
    },
  },

  // File validation alerts
  fileValidation: {
    tooLarge: (size: string) => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.fileTooLarge'),
        text: t('validation.fileTooLarge', { size }),
        confirmButtonText: t('common.ok'),
      })
    },
    invalidType: (types: string[]) => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title: t('alerts.titles.invalidFileType'),
        text: t('validation.invalidFileType', { types: types.join(', ') }),
        confirmButtonText: t('common.ok'),
      })
    },
  },

  // Account management specific alerts
  account: {
    deleteConfirm: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title: t('alerts.titles.finalConfirmation'),
        text: t('alerts.confirm.deleteAccountFinal'),
        showCancelButton: true,
        confirmButtonText: t('alerts.buttons.deletePermanently'),
        cancelButtonText: t('common.cancel'),
        confirmButtonColor: '#DC2626', // Red color for dangerous action
      })
    },
  },
  enterprise: {
    deleteConfirm: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title: t('alerts.titles.finalConfirmation'),
        text: t('alerts.confirm.deleteAccountFinal'),
        showCancelButton: true,
        confirmButtonText: t('alerts.buttons.deletePermanently'),
        cancelButtonText: t('common.cancel'),
        confirmButtonColor: '#DC2626', // Red color for dangerous action
      })
    },
    suspendConfirm: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title: t('alerts.titles.suspendAccount'),
        text: t('alerts.confirm.suspendAccount'),
        showCancelButton: true,
        confirmButtonText: t('alerts.buttons.yesSuspend'),
        cancelButtonText: t('common.cancel'),
      })
    },
    reactivateConfirm: () => {
      return Swal.fire({
        ...defaultConfig,
        icon: 'question',
        title: t('alerts.titles.reactivateAccount'),
        text: t('alerts.confirm.reactivateAccount'),
        showCancelButton: true,
        confirmButtonText: t('alerts.buttons.yesReactivate'),
        cancelButtonText: t('common.cancel'),
      })
    },
  },
}

export default SweetAlert
