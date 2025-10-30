import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  width: 350, // Limit toast width to prevent full-side occupation
  customClass: {
    container: 'z-[9999] liquid-glass-container', // Apply custom class for toast
    popup: 'liquid-glass bg-transparent border border-white/20 rounded-2xl shadow-2xl glow-border max-w-[350px]', // Liquid Glass with max width
    title: 'text-white font-semibold', // White text
    content: 'text-gray-200', // Lighter text for content
    timerProgressBar: 'bg-white/20' // Progress bar style
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Custom CSS for SweetAlert2 Liquid Glass (add to global CSS or <style> in layout)
// Added styles to constrain toast size and prevent full-side takeover
const swalStyles = `
  .liquid-glass-container {
    backdrop-filter: blur(20px) saturate(180%);
  }

  .liquid-glass {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .swal2-popup {
    background: transparent !important;
  }

  .swal2-title {
    color: white !important;
    font-weight: 600 !important;
  }

  .swal2-content {
    color: #e5e7eb !important; /* gray-200 */
  }

  .swal2-confirm, .swal2-cancel {
    background: rgba(59, 130, 246, 0.5) !important; /* blue-600/50 */
    border: 1px solid rgba(59, 130, 246, 0.3) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    transition: all 0.3s ease !important;
  }

  .swal2-confirm:hover, .swal2-cancel:hover {
    background: rgba(59, 130, 246, 0.7) !important;
    transform: scale(1.05) !important;
  }

  .swal2-loader {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  .swal2-toast {
    max-width: 350px !important;
    min-width: 250px !important;
  }

  .swal2-container {
    padding: 10px !important;
  }

  /* ✅ FIX: evitar que el toast ocupe todo el lateral derecho */
  .swal2-container.swal2-top-end,
  .swal2-container.swal2-top-right {
    width: auto !important;
    height: auto !important;
    top: 1rem !important;
    right: 1rem !important;
    bottom: auto !important;
    left: auto !important;
    pointer-events: none;
  }

  .swal2-container.swal2-top-end .swal2-popup,
  .swal2-container.swal2-top-right .swal2-popup {
    pointer-events: all;
    max-width: 350px !important;
    width: fit-content !important;
    margin: 0 !important;
  }
`;

// Inject styles (call once in layout or component)
const injectSwalStyles = () => {
  if (!document.getElementById('swal-liquid-glass-styles')) {
    const style = document.createElement('style');
    style.id = 'swal-liquid-glass-styles';
    style.textContent = swalStyles;
    document.head.appendChild(style);
  }
};
injectSwalStyles(); // Run on import

export const openNotification = (type, message) => {
  if (type === 'error') {
    Swal.fire({
      icon: type,
      title: 'An error has occurred!',
      text: message,
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass: {
        container: 'z-[9999]',
        popup: 'liquid-glass rounded-2xl border border-white/20 shadow-2xl glow-border',
        title: 'text-white font-bold',
        content: 'text-gray-200',
        confirmButton: 'bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 rounded-xl'
      }
    });
  } else {
    Toast.fire({
      icon: type,
      title: message
    });
  }
};

const defaultConfigConfirm = {
  icon: 'warning',
  title: 'Are you sure?',
  text: 'You will not be able to revert this!',
  showCancelButton: true,
  confirmButtonText: 'Delete',
  cancelButtonText: 'Cancel',
  padding: '2em',
  showLoaderOnConfirm: true,
  allowOutsideClick: () => !Swal.isLoading(),
  customClass: {
    container: 'z-[9999]',
    popup: 'liquid-glass rounded-2xl border border-white/20 shadow-2xl glow-border',
    title: 'text-white font-bold',
    htmlContainer: 'text-gray-200',
    confirmButton: 'bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 rounded-xl',
    cancelButton: 'bg-gray-600/50 hover:bg-gray-700/50 border border-gray-500/30 rounded-xl'
  }
};

export const confirmDialog = async (config = {}, onConfirm, onCancel) => {
  const finalConfig = {
    ...defaultConfigConfirm,
    ...config,
    showCancelButton: true,
    preConfirm: async () => {
      if (onConfirm) {
        try {
          await onConfirm();
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message || error}`);
        }
      }
    }
  };

  const result = await Swal.fire(finalConfig);

  if (result.dismiss === Swal.DismissReason.cancel && onCancel) {
    onCancel();
  }
};