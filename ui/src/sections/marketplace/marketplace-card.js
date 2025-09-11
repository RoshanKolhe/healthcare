'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

export default function MarketplaceCard({ image, name, description, features }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        height: 400, // 👈 fixed card height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        component="img"
        image={image || '/images/placeholder.jpg'}
        alt={name}
        sx={{
          height: 180,
          objectFit: 'contain', // show full image without cropping
          bgcolor: '#f5f5f5', // optional: light background for transparent images
        }}
      />
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {name}
        </Typography>
        <Box
          sx={{
            maxHeight: '4.5em', // ~3 lines
            overflowY: 'auto',
            mb: 1,
            pr: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none', // IE/Edge
            scrollbarWidth: 'none', // Firefox
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        {/* Features with scroll after 3 lines */}
        {features && (
          <Box
            sx={{
              maxHeight: '4.5em',
              overflowY: 'auto',
              pr: 1,
              fontSize: '12px',
              lineHeight: 1.4,
              textAlign: 'left',
              color: 'green',
              '& *': {
                margin: 0,
                textIndent: 0,
              },
              // ✅ Allow lists to keep their bullets but remove extra padding
              '& ul, & ol': {
                paddingLeft: '16px', // keep bullets aligned nicely
                margin: 0,
              },
              '& li': {
                margin: 0,
                padding: 0,
              },
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
            dangerouslySetInnerHTML={{ __html: features }}
          />
        )}
      </CardContent>
    </Card>
  );
}

MarketplaceCard.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  features: PropTypes.string,
};
