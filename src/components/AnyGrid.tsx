import React from 'react';
import Grid from '@mui/material/Grid';

const AnyGrid: React.FC<any> = (props) => {
  // Wrap MUI Grid with a permissive any-typed prop signature
  return <Grid {...props} />;
};

export default AnyGrid;
