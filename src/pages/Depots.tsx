import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Grid from '../components/AnyGrid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useMobileView } from '../contexts/MobileViewContext';
import { apiService } from '../services/api';
import type { Depot } from '../types';

export const Depots: React.FC = () => {
  const { isMobile } = useMobileView();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDepots();
  }, []);

  const fetchDepots = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepots().catch(() => ({ success: false, data: [] }));
      if (response.success) {
        setDepots(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching depots:', error);
      setDepots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepot(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      phone: '',
      email: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (depot: Depot) => {
    setEditingDepot(depot);
    setFormData({
      name: depot.name || '',
      address: depot.address || '',
      city: depot.city || '',
      country: depot.country || '',
      postalCode: depot.postalCode || '',
      phone: depot.phone || '',
      email: depot.email || '',
        isActive: depot.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this depot?')) {
      try {
          if (id) {
            await apiService.deleteDepot(id);
          }
        fetchDepots();
      } catch (error) {
        console.error('Error deleting depot:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Depot name is required');
        return;
      }

      const depotData = {
        ...formData,
        name: formData.name.trim(),
      };

        if (editingDepot && editingDepot.id) {
          await apiService.updateDepot(editingDepot.id, depotData);
      } else {
        await apiService.createDepot(depotData);
      }

      setDialogOpen(false);
      fetchDepots();
    } catch (error) {
      console.error('Error saving depot:', error);
      alert('Unable to save depot. Please check the values and try again.');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={isMobile ? 40 : 60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant={isMobile ? 'h4' : 'h3'} gutterBottom>
          Depots
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size={isMobile ? 'small' : 'medium'}
        >
          Add Depot
        </Button>
      </Box>

      <Grid container spacing={3}>
        {depots.map((depot) => (
          <Grid item xs={12} sm={6} md={4} key={depot.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarehouseIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {depot.name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(depot)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => depot.id && handleDelete(depot.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {depot.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {depot.address}
                    </Typography>
                  </Box>
                )}

                {(depot.city || depot.country) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {depot.city && depot.country ? `${depot.city}, ${depot.country}` : depot.city || depot.country}
                  </Typography>
                )}

                {depot.phone && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Phone: {depot.phone}
                  </Typography>
                )}

                {depot.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Email: {depot.email}
                  </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: depot.isActive ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {depot.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDepot ? 'Edit Depot' : 'Add New Depot'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="City"
                fullWidth
                variant="outlined"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Country"
                fullWidth
                variant="outlined"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Postal Code"
                fullWidth
                variant="outlined"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Phone"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDepot ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
