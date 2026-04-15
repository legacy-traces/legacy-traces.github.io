import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { fetchAdminOrders, updateOrderStatus } from '../api/api';
import { 
  Package, DollarSign, ShoppingCart, 
  CreditCard, Truck, RefreshCcw, CheckCircle 
} from 'lucide-react';

const ADMIN_EMAIL = "legacytraces24@gmail.com";

const AdminDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Double Protection - Check direct URL access
  useEffect(() => {
    // We check both context user and localStorage as fallback
    const localUserStr = localStorage.getItem("user");
    let localUser = null;
    try {
      localUser = localUserStr ? JSON.parse(localUserStr) : null;
    } catch(e) {}
    
    const activeUser = user || localUser;

    if (!activeUser || activeUser.email !== ADMIN_EMAIL) {
      alert("Unauthorized Access");
      navigate("/");
    }
  }, [user, navigate]);

  // Load Data
  useEffect(() => {
    const loadOrders = async () => {
      // Also ensuring only allowed email can trigger the load
      if (user?.email === ADMIN_EMAIL) {
        try {
          const data = await fetchAdminOrders(user.email);
          setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to load orders", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadOrders();
  }, [user]);

  // 2. Initial Route Protection Guard
  const localUserStr = localStorage.getItem("user");
  let localUser = null;
  try {
    localUser = localUserStr ? JSON.parse(localUserStr) : null;
  } catch(e) {}
  
  const activeUser = user || localUser;

  if (!activeUser || activeUser.email !== ADMIN_EMAIL) {
    return <Navigate to="/" />;
  }

  // Calculate Metrics
  const totalOrders = orders.length;
  // Make sure we sum values properly depending on data structure
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amountPaid || o.totalAmount || 0), 0);
  const totalItems = orders.reduce((sum, o) => sum + Number(o.totalTshirts || o.totalItems || 0), 0);
  const codOrders = orders.filter(o => o.cod === "Yes" || o.paymentMethod === "COD").length;
  const prepaidOrders = orders.filter(o => o.cod === "No" || o.paymentMethod !== "COD").length;

  const statusCount = {
    New: orders.filter(o => !o.orderStatus || o.orderStatus === "New" || o.orderStatus === "Pending").length,
    Shipped: orders.filter(o => o.orderStatus === "Shipped").length,
    Delivered: orders.filter(o => o.orderStatus === "Delivered").length
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Optimistic upate
      setOrders(orders.map(o => o.id === orderId || o.ID === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch(err) {
      console.error("Error updating status", err);
      alert("Failed to update status. Remember, the Cloudflare worker needs to support the updateStatus action.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
          Logged in as: <span className="font-semibold text-primary">{activeUser.email}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Orders</h3>
            <Package className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.1)] border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Revenue</h3>
            <DollarSign className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Items Sold</h3>
            <ShoppingCart className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{totalItems}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Payment Breakup</h3>
            <CreditCard className="text-orange-500" size={24} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-sm text-gray-500">COD</p>
              <p className="text-xl font-bold">{codOrders}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <p className="text-sm text-gray-500">Prepaid</p>
              <p className="text-xl font-bold">{prepaidOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center justify-between">
          <div>
            <p className="text-yellow-600 dark:text-yellow-400 font-medium mb-1">New Orders</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCount.New}</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-800/50 p-3 rounded-full">
            <RefreshCcw className="text-yellow-600 dark:text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Shipped</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCount.Shipped}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full">
            <Truck className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div>
            <p className="text-green-600 dark:text-green-400 font-medium mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCount.Delivered}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-800/50 p-3 rounded-full">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold font-heading">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  // Fallback data mapping if schema varies
                  const id = order.id || order.ID || order.orderId;
                  const name = order.name || order.customerName || "N/A";
                  const amount = order.amountPaid || order.totalAmount || 0;
                  const isCOD = order.cod === "Yes" || order.paymentMethod === "COD";
                  const status = order.orderStatus || "New";

                  return (
                    <tr key={id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 font-medium">{id}</td>
                      <td className="p-4">{name}</td>
                      <td className="p-4 font-semibold text-primary">₹{amount}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isCOD ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {isCOD ? 'COD' : 'Prepaid'}
                        </span>
                      </td>
                      <td className="p-4">
                         <span className={`px-2.5 py-1 text-xs font-medium rounded-full 
                          ${status === 'New' || status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            status === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                          value={status}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
