import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Snackbar, Alert } from '@mui/material';

export default function AccountDeleteDialog({ open, onClose, onDelete, account, onUndo, undoAccount }) {
  const [deleted, setDeleted] = useState(false);
  const [undoOpen, setUndoOpen] = useState(false);

  const handleDelete = async () => {
    setDeleted(true);
    setUndoOpen(true);
    await onDelete(); // account._id yerine onDelete() çağır
    onClose(); // Dialog'u kapat
    setTimeout(() => {
      setUndoOpen(false);
      setDeleted(false);
    }, 5000); // 5 saniye içinde geri alma imkanı
  };
  const handleUndo = () => {
    setUndoOpen(false);
    setDeleted(false);
    if (onUndo && undoAccount) onUndo(undoAccount);
  };

  if (!account) return null;
  return (
    <>
      <Dialog open={open && !deleted} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Hesabı Sil</DialogTitle>
        <DialogContent>
          <Typography color="error" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz! {account.name} adlı hesabı silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Sil</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={undoOpen} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" sx={{ width: '100%' }} action={<Button color="inherit" size="small" onClick={handleUndo}>Geri Al</Button>}>
          Hesap silindi. Geri almak için tıklayın.
        </Alert>
      </Snackbar>
    </>
  );
} 