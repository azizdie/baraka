export const globalStyles = {
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  html: {
    fontSize: '16px',
    scrollBehavior: 'smooth',
  },
  body: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: 1.5,
    color: '#212121',
    backgroundColor: '#f5f5f5',
    '@media (max-width:600px)': {
      fontSize: '14px',
    },
  },
  a: {
    color: '#1976d2',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  img: {
    maxWidth: '100%',
    height: 'auto',
  },
  button: {
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontFamily: 'inherit',
  },
  '.mobile-hidden': {
    '@media (max-width:600px)': {
      display: 'none !important',
    },
  },
  '.desktop-hidden': {
    '@media (min-width:601px)': {
      display: 'none !important',
    },
  },
  '.mobile-full-width': {
    '@media (max-width:600px)': {
      width: '100% !important',
    },
  },
  '.mobile-text-center': {
    '@media (max-width:600px)': {
      textAlign: 'center !important',
    },
  },
  '.mobile-stack': {
    '@media (max-width:600px)': {
      flexDirection: 'column !important',
    },
  },
  '.mobile-spacing': {
    '@media (max-width:600px)': {
      padding: '0.5rem !important',
      margin: '0.25rem 0 !important',
    },
  },
  '.mobile-card-spacing': {
    '@media (max-width:600px)': {
      margin: '0.5rem 0 !important',
    },
  },
  '.mobile-table-responsive': {
    '@media (max-width:600px)': {
      overflowX: 'auto',
      display: 'block',
    },
  },
  '.mobile-button-large': {
    '@media (max-width:600px)': {
      padding: '12px 24px !important',
      fontSize: '1rem !important',
      minHeight: '48px !important',
    },
  },
  '.mobile-input-large': {
    '@media (max-width:600px)': {
      fontSize: '1rem !important',
      padding: '12px !important',
      minHeight: '48px !important',
    },
  },
};
