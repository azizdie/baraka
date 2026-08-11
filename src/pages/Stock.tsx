import React, { useState, useEffect, useMemo } from 'react';
import type { Stock as StockType, Product } from '../types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useMobileView } from '../contexts/MobileViewContext';
import { apiService } from '../services/api';

export const Stock: React.FC = () => {
  const { isMobile } = useMobileView();
  const [stocks, setStocks] = useState<StockType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockType | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    depotId: '',
    quantity: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchStocks();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response?.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStocks();
      if (response?.success) {
        setStocks(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStock(null);
    setFormData({
      productId: '',
      depotId: '',
      quantity: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (stock: StockType) => {
    setEditingStock(stock);
    setFormData({
      productId: stock.productId.toString(),
      depotId: stock.depotId != null ? stock.depotId.toString() : (stock.location != null ? stock.location.toString() : ''),
      quantity: stock.quantity.toString(),
    });
    setDialogOpen(true);
  };

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id?.toString() ?? '', product])),
    [products]
  );

  const getProductName = (productId: number) => {
    const product = productMap.get(productId.toString());
    return product?.name || `#${productId}`;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock record?')) {
      try {
        await apiService.deleteStock(id);
        fetchStocks();
      } catch (error) {
        console.error('Error deleting stock:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const stockData = {
        productId: parseInt(formData.productId),
        location: formData.depotId.trim() === '' ? null : parseInt(formData.depotId),
        quantity: parseInt(formData.quantity),
      };

      if (editingStock && editingStock.id) {
        await apiService.updateStock(editingStock.id, stockData);
      } else {
        await apiService.createStock(stockData);
      }

      setDialogOpen(false);
      fetchStocks();
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const getStockStatus = (stock: StockType) => {
    if (stock.availableQuantity < 10) {
      return { label: 'Low Stock', color: 'error' as const };
    } else if (stock.availableQuantity < 50) {
      return { label: 'Medium Stock', color: 'warning' as const };
    }
    return { label: 'In Stock', color: 'success' as const };
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
          Stock Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size={isMobile ? 'small' : 'medium'}
        >
          Add Stock
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Depot ID</TableCell>
                  <TableCell>Total Quantity</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Reserved</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock) => {
                  const status = getStockStatus(stock);
                  return (
                    <TableRow key={stock.id}>
                      <TableCell>{getProductName(stock.productId)}</TableCell>
                      <TableCell>{stock.depotId ?? stock.location ?? '-'}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>{stock.availableQuantity}</TableCell>
                      <TableCell>{stock.reservedQuantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(stock)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => stock.id && handleDelete(stock.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStock ? 'Edit Stock' : 'Add New Stock'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            margin="dense"
            label="Product"
            fullWidth
            variant="outlined"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id?.toString() ?? ''}>
                {product.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Depot ID"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.depotId}
            onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStock ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
