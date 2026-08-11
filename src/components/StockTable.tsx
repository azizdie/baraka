import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useMobileView } from '../contexts/MobileViewContext';
import { getResponsiveDataGridHeight, getResponsiveDialogMaxWidth } from '../utils/responsive';
import type { Stock, StockWithDetails, Depot, Product } from '../types';
import { apiService } from '../services/api';

interface StockTableProps {
  productId?: number;
}

export const StockTable: React.FC<StockTableProps> = ({ productId }) => {
  const { isMobile } = useMobileView();
  
  const [stocks, setStocks] = useState<StockWithDetails[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{ open: boolean; stock?: Stock }>({
    open: false,
  });
  const [adjustDialog, setAdjustDialog] = useState<{ open: boolean; stock?: Stock }>({
    open: false,
  });
  const [formData, setFormData] = useState<Partial<Stock>>({});
  const [adjustData, setAdjustData] = useState({ quantityChange: 0, reservedChange: 0 });

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stocksResponse, depotsResponse, productsResponse] = await Promise.all([
        apiService.getStocks(productId),
        apiService.getDepots(),
        apiService.getProducts(),
      ]);

      if (stocksResponse.success && stocksResponse.data) {
        const stocksWithDetails = stocksResponse.data.map((stock: Stock) => ({
          ...stock,
          product: productsResponse.data?.find((p: Product) => p.id === stock.productId),
          depot: depotsResponse.data?.find((d: Depot) => d.id === stock.location || d.id === stock.depotId),
        }));
        setStocks(stocksWithDetails);
      }

      if (depotsResponse.success && depotsResponse.data) {
        setDepots(depotsResponse.data);
      }

      // productsResponse kept for lookup in stocks mapping above
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock: Stock) => {
    setFormData(stock);
    setEditDialog({ open: true, stock });
  };

  const handleAdjust = (stock: Stock) => {
    setAdjustData({ quantityChange: 0, reservedChange: 0 });
    setAdjustDialog({ open: true, stock });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.stock) return;

    try {
      await apiService.updateStock(editDialog.stock.id!, formData);
      fetchData();
      setEditDialog({ open: false });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleSaveAdjust = async () => {
    if (!adjustDialog.stock) return;

    try {
      await apiService.adjustStock(adjustDialog.stock.id!, adjustData);
      fetchData();
      setAdjustDialog({ open: false });
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const handleDelete = async (stock: Stock) => {
    if (window.confirm('Are you sure you want to delete this stock record?')) {
      try {
        await apiService.deleteStock(stock.id!);
        fetchData();
      } catch (error) {
        console.error('Error deleting stock:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'product',
      headerName: 'Product',
      width: isMobile ? 150 : 200,
      renderCell: (params) => params.row.product?.name || 'Unknown',
    },
    {
      field: 'depot',
      headerName: 'Location',
      width: isMobile ? 120 : 150,
      renderCell: (params) => params.row.depot?.name || 'Unknown',
    },
    {
      field: 'quantity',
      headerName: 'Total',
      type: 'number',
      width: isMobile ? 80 : 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        />
      ),
    },
    {
      field: 'reservedQuantity',
      headerName: 'Reserved',
      type: 'number',
      width: isMobile ? 80 : 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="warning"
          size={isMobile ? 'small' : 'medium'}
        />
      ),
    },
    {
      field: 'availableQuantity',
      headerName: 'Available',
      type: 'number',
      width: isMobile ? 90 : 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value > 0 ? 'success' : 'error'}
          size={isMobile ? 'small' : 'medium'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: isMobile ? 120 : 180,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          size={isMobile ? 'small' : 'medium'}
        />,
        <GridActionsCellItem
          icon={<AddIcon />}
          label="Adjust"
          onClick={() => handleAdjust(params.row)}
          size={isMobile ? 'small' : 'medium'}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
          size={isMobile ? 'small' : 'medium'}
        />,
      ],
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stock Management
        </Typography>
        
        <Box sx={{ height: getResponsiveDataGridHeight(isMobile, stocks.length), mb: 2 }}>
          <DataGrid
            rows={stocks}
            columns={columns}
            loading={loading}
            initialState={{ pagination: { paginationModel: { pageSize: isMobile ? 5 : 10, page: 0 } } }}
            pageSizeOptions={isMobile ? [5, 10] : [10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
            }}
          />
        </Box>

        {/* Edit Dialog */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false })}
          maxWidth={getResponsiveDialogMaxWidth(isMobile)}
          fullWidth
        >
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                fullWidth
                size={isMobile ? 'medium' : 'small'}
              />
              <TextField
                label="Reserved Quantity"
                type="number"
                value={formData.reservedQuantity || ''}
                onChange={(e) => setFormData({ ...formData, reservedQuantity: parseInt(e.target.value) || 0 })}
                fullWidth
                size={isMobile ? 'medium' : 'small'}
              />
                <FormControl fullWidth size={isMobile ? 'medium' : 'small'}>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.location?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, location: parseInt(e.target.value as string) || 0 })}
                  label="Location"
                >
                  {depots.map((depot) => (
                    <MenuItem key={depot.id} value={depot.id?.toString()}>
                      {depot.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Adjust Dialog */}
        <Dialog
          open={adjustDialog.open}
          onClose={() => setAdjustDialog({ open: false })}
          maxWidth={getResponsiveDialogMaxWidth(isMobile)}
          fullWidth
        >
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Quantity Change"
                type="number"
                value={adjustData.quantityChange}
                onChange={(e) => setAdjustData({ ...adjustData, quantityChange: parseInt(e.target.value) || 0 })}
                helperText="Positive to add, negative to remove"
                fullWidth
                size={isMobile ? 'medium' : 'small'}
              />
              <TextField
                label="Reserved Change"
                type="number"
                value={adjustData.reservedChange}
                onChange={(e) => setAdjustData({ ...adjustData, reservedChange: parseInt(e.target.value) || 0 })}
                helperText="Positive to reserve, negative to unreserve"
                fullWidth
                size={isMobile ? 'medium' : 'small'}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveAdjust} variant="contained">Adjust</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};
