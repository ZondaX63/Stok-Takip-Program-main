import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, useTheme } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary', onClick, isActive }) => {
    const theme = useTheme();
    
    // Extract base color name from color string (e.g., "primary.main" -> "primary")
    const baseColor = color.split('.')[0];
    
    return (
        <Card 
            sx={{ 
                height: '100%',
                border: isActive ? `2px solid ${theme.palette[baseColor]?.dark || theme.palette.primary.dark}` : `2px solid transparent`,
                transition: 'border .2s ease-in-out',
            }}
        >
            <CardActionArea onClick={onClick} sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', p: '0 !important'}}>
                    <Box sx={{ mr: 2, color: `${color}` }}>
                        {icon && React.cloneElement(icon, { sx: { fontSize: 40 }})}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                        <Typography variant="body1">{title}</Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default StatCard; 