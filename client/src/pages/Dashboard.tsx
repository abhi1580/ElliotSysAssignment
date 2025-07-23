import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from '../features/tasks/tasksSlice';
import { logoutUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button, TextField, CircularProgress, MenuItem, Select, InputLabel, FormControl, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Fab, Tooltip, Stack, Pagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const TASKS_PER_PAGE = 6;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch<any>(fetchTasks({}));
  }, [dispatch]);

  // Reset page when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, sortBy, searchTerm]);

  const openAddDialog = () => {
    setEditMode(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setDialogOpen(true);
  };

  const openEditDialog = (task: any) => {
    setEditMode(true);
    setEditId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate.slice(0, 10));
    setPriority(task.priority);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditId(null);
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !priority) return;
    if (editMode && editId) {
      await dispatch<any>(updateTask({ id: editId, updates: { title, description, dueDate, priority } }));
    } else {
      await dispatch<any>(createTask({ title, description, dueDate, priority }));
    }
    setDialogOpen(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  const handleDelete = async (id: string) => {
    await dispatch<any>(deleteTask(id));
  };

  const handleToggle = async (id: string) => {
    await dispatch<any>(toggleTaskStatus(id));
  };

  const handleLogout = async () => {
    await dispatch<any>(logoutUser());
    navigate('/login');
  };

  // Filtering logic
  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  }) : [];

  // Search logic
  const searchedTasks = filteredTasks.filter(task => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (task.title && task.title.toLowerCase().includes(term)) ||
      (task.description && task.description.toLowerCase().includes(term))
    );
  });

  // Sorting logic
  const sortedTasks = [...searchedTasks];
  if (sortBy === 'dueDateAsc') {
    sortedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } else if (sortBy === 'dueDateDesc') {
    sortedTasks.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  } else if (sortBy === 'priorityAsc') {
    const priorityOrder = { low: 1, medium: 2, high: 3 };
    sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortBy === 'priorityDesc') {
    const priorityOrder = { low: 1, medium: 2, high: 3 };
    sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }
  const totalPages = Math.ceil(sortedTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = sortedTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE);

  return (
    <Box maxWidth={900} mx="auto" mt={4} position="relative">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        {/* Filtering controls */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        {/* Sorting control */}
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={e => setSortBy(e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="dueDateAsc">Due Date (Earliest First)</MenuItem>
            <MenuItem value="dueDateDesc">Due Date (Latest First)</MenuItem>
            <MenuItem value="priorityAsc">Priority (Low to High)</MenuItem>
            <MenuItem value="priorityDesc">Priority (High to Low)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? <CircularProgress /> : (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={3}>
            {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
              <Box key={task._id} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} minWidth={280}>
                <Card sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: task.status === 'complete' ? '6px solid #2e7d32' : '6px solid #1976d2' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{task.description}</Typography>
                    <Typography variant="body2">Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Typography>
                    <Typography variant="body2">Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title={task.status === 'complete' ? 'Mark as Incomplete' : 'Mark as Complete'}>
                      <IconButton onClick={() => handleToggle(task._id)} color={task.status === 'complete' ? 'success' : 'default'}>
                        {task.status === 'complete' ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEditDialog(task)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(task._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Box>
            )) : (
              <Box width="100%"><Typography>No tasks found.</Typography></Box>
            )}
          </Stack>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      {error && <Typography color="error">{error}</Typography>}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <Box component="form" onSubmit={handleDialogSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth />
            <TextField label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
            <FormControl required>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editMode ? 'Save' : 'Add'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Tooltip title="Add Task">
        <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={openAddDialog}>
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
} 