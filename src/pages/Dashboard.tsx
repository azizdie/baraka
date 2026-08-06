import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { useMobileView } from '../contexts/MobileViewContext';
import { useResponsive, getResponsiveGridCols } from '../utils/responsive';
import { apiService } from '../services/api';

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalDepots: number;
  lowStockItems: number;
}

export const Dashboard: React.FC = () => {
  const { isMobile } = useMobileView();
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [productsResponse, stocksResponse, depotsResponse] = await Promise.all([
        apiService.getProducts().catch(() => ({ success: false, data: [] })),
        apiService.getStocks().catch(() => ({ success: false, data: [] })),
        apiService.getDepots().catch(() => ({ success: false, data: [] })),
      ]);

      const totalProducts = productsResponse.success ? productsResponse.data?.length || 0 : 0;
      const totalStock = stocksResponse.success 
        ? stocksResponse.data?.reduce((sum: number, stock: any) => sum + stock.quantity, 0) || 0 
        : 0;
      const totalDepots = depotsResponse.success ? depotsResponse.data?.length || 0 : 0;
      const lowStockItems = stocksResponse.success 
        ? stocksResponse.data?.filter((stock: any) => stock.availableQuantity < 10).length || 0 
        : 0;

      setStats({
        totalProducts,
        totalStock,
        totalDepots,
        lowStockItems,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values when API fails
      setStats({
        totalProducts: 0,
        totalStock: 0,
        totalDepots: 0,
        lowStockItems: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card
      sx={{
        height: '100%',
        backgroundColor: color,
        color: 'white',
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
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              {value.toLocaleString()}
            </Typography>
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              sx={{ opacity: 0.8 }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              fontSize: isMobile ? '2rem' : '3rem',
              opacity: 0.7,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
      <Typography
        variant={isMobile ? 'h4' : 'h3'}
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
      >
        Dashboard
      </Typography>

      <Grid
        container
        spacing={isMobile ? 2 : 3}
        sx={{ mb: isMobile ? 2 : 4 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={<CategoryIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stock"
            value={stats?.totalStock || 0}
            icon={<InventoryIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Depots"
            value={stats?.totalDepots || 0}
            icon={<WarehouseIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockItems || 0}
            icon={<TrendingUpIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent stock movements and updates will appear here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick access to common operations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
