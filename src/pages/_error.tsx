import type { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#e5e7eb' }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
        {statusCode === 404 ? 'Page not found' : 'An error occurred'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
