import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultImageSrc } from '../../components/ui/default-image';
import { 
  Search, 
  RefreshCw, 
  UserPlus, 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import UserEditForm from './UserEditForm';
import AddUserForm from './AddUserForm';
import ConfirmDialog from './ConfirmDialog';
import PasswordResetForm from './PasswordResetForm';

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { getDocuments, updateDocument, deleteDocument } = useFirestore('users');
  
  // State for user data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('lastLogin');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal state - defined at the component level
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getDocuments();
        
        // Process data to ensure consistent structure
        const processedUsers = usersData.map(user => ({
          ...user,
          isAdmin: user.isAdmin || false,
          lastLogin: user.lastLogin || user.createdAt,
          displayName: user.displayName || 'Unknown User',
          email: user.email || 'No Email',
          createdAt: user.createdAt || '',
        }));
        
        setUsers(processedUsers);
        setFilteredUsers(processedUsers);
        setError(null);
      } catch (err) {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchUsers();
    }
  }, [getDocuments, isAdmin]);
  
  // Filter and sort users
  useEffect(() => {
    if (!users.length) return;
    
    // Apply filters
    let result = [...users];
    
    // Filter by role
    if (filterRole !== 'all') {
      const isAdminFilter = filterRole === 'admin';
      result = result.filter(user => user.isAdmin === isAdminFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user =>
          (user.displayName && user.displayName.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.displayName || '').localeCompare(b.displayName || '');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case 'lastLogin':
        default:
          comparison = new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUsers(result);
  }, [users, filterRole, searchTerm, sortBy, sortDirection]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setSortBy('lastLogin');
    setSortDirection('desc');
  };
  
  // Toggle user admin status
  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await updateDocument(userId, { 
        isAdmin: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isAdmin: !currentStatus } : user
        )
      );
      
      // Show success message
      setSuccessMessage(`User role updated successfully!`);
      
      // Clear message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to update user role. Please try again.');
    }
  };
  
  // Delete user function
  const deleteUser = async (userId) => {
    try {
      // Delete from Firestore
      await deleteDocument(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Show success message
      setSuccessMessage("User deleted successfully!");
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to Load Users</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center text-sm">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="bg-background border border-border rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center">
              <label htmlFor="role-filter" className="text-sm font-medium mr-2">
                Role:
              </label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-3 pr-8 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center">
              <label htmlFor="sort-by" className="text-sm font-medium mr-2">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
              >
                <option value="lastLogin">Last Login</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="createdAt">Signup Date</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="ml-2 p-2 border border-input rounded-md hover:bg-muted transition-colors"
                aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
                )}
              </button>
            </div>
            
            <button
              onClick={resetFilters}
              className="flex items-center justify-center py-2 px-4 border border-input rounded-md hover:bg-muted transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Users Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {searchTerm || filterRole !== 'all'
                ? 'No users match your current filters. Try adjusting your search criteria.'
                : 'There are no users in the system yet.'}
            </p>
            {(searchTerm || filterRole !== 'all') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Signup Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName} 
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = getDefaultImageSrc('avatar');
                              }}
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-medium">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            <User className="h-3 w-3 mr-1" />
                            User
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setCurrentUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors"
                          aria-label="Edit user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        
                        <div className="relative group">
                          <button
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button
                                onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                                className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted"
                              >
                                {user.isAdmin ? (
                                  <>
                                    <ShieldOff className="h-4 w-4 mr-2 text-amber-500" />
                                    Remove Admin Role
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4 mr-2 text-primary" />
                                    Make Admin
                                  </>
                                )}
                              </button>
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted"
                                onClick={() => {
                                  setCurrentUser(user);
                                  setIsResetPasswordOpen(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Reset Password
                              </button>
                              <button
                                className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted text-destructive"
                                onClick={() => {
                                  setCurrentUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                Delete User
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <UserEditForm 
          user={currentUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (updatedUserData) => {
            try {
              // Update in Firestore
              await updateDocument(currentUser.id, updatedUserData);
              
              // Update local state
              setUsers(prevUsers =>
                prevUsers.map(user =>
                  user.id === currentUser.id ? { ...user, ...updatedUserData } : user
                )
              );
              
              // Show success message
              setSuccessMessage("User updated successfully!");
              
              // Clear success message after a delay
              setTimeout(() => {
                setSuccessMessage('');
              }, 3000);
              
              return true;
            } catch (err) {
              setError('Failed to update user.');
              return false;
            }
          }}
        />
      )}
      
      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <AddUserForm 
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={(newUser) => {
            // Add the new user to the users list
            setUsers(prevUsers => [newUser, ...prevUsers]);
            
            // Show success message
            setSuccessMessage("User created successfully!");
            
            // Clear success message after a delay
            setTimeout(() => {
              setSuccessMessage('');
            }, 3000);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && currentUser && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => deleteUser(currentUser.id)}
          title="Delete User"
          message={`Are you sure you want to delete the user "${currentUser.displayName || currentUser.email}"? This action cannot be undone.`}
          confirmText="Delete User"
          cancelText="Cancel"
          type="danger"
        />
      )}
      
      {/* Password Reset Form */}
      {isResetPasswordOpen && currentUser && (
        <PasswordResetForm
          user={currentUser}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;