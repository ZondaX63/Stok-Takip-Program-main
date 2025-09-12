import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const ConfirmDialog = ({ open, title, message, onConfirm, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    İptal
                </Button>
                <Button 
                    onClick={() => { 
                        onConfirm(); 
                        onClose(); 
                    }} 
                    color="error" 
                    variant="contained" 
                    autoFocus
                >
                    Onayla
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog; 