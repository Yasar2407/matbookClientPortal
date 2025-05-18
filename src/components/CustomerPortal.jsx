import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getClientProfile } from "../redux/Slice/AuthSlice";

// Material-UI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  CardMedia,
  CardActions,
  InputAdornment,
  Chip,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  useTheme,
  Collapse
} from "@mui/material";
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Work as ProjectIcon,
  Lightbulb as LeadIcon,
  Receipt as ProposalIcon,
  CalendarToday as DateIcon,
  Assignment as QuoteIcon,
  Star as StarIcon,
  AttachFile as AttachFileIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon
} from "@mui/icons-material";
import { uploadImage } from "../redux/Slice/ImageSlice";
import { ReceiptIcon } from "lucide-react";

// Environment Variables
const API_URL = import.meta.env.VITE_API_URL;
const TOKEN = import.meta.env.VITE_TOKEN;

const statusColors = {
  draft: "default",
  submitted: "info",
  in_review: "warning",
  approved: "success",
  rejected: "error",
  completed: "secondary"
};

const CustomerPortal = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leadData, setLeadData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [proposalData, setProposalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { user, cusprofile } = useSelector(state => state.auth);
  
  // Form state for proposal upload
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Requirements: "",
    PhoneNumber: "",
    Reference: ""
  });
  const [formFile, setFormFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { imageUrl } = useSelector((state) => state.image);
  const clientId = user?.Client_Id;

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(getClientProfile()).unwrap();
        console.log("✅ Client profile fetched");
      } catch (err) {
        console.error("❌ Failed to fetch client profile:", err);
        showSnackbar("Failed to fetch client profile", "error");
      }
    };
    fetchProfile();
  }, [dispatch]);
  
  const fetchAllData = async () => {
    if (!cusprofile || cusprofile.length === 0) {
      console.warn("⚠️ cusprofile is not available yet.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const headers = { Authorization: `Bearer ${TOKEN}` };
  
      if (!API_URL || !TOKEN) {
        console.error("❌ Missing API_URL or TOKEN", { API_URL, TOKEN });
        showSnackbar("Configuration error - missing API details", "error");
        return;
      }
  
      // Fetch lead data
      const leadUrl = `${API_URL}/api/user/service/681c4cdfbad3787228013c70`;
      const leadRes = await axios.get(leadUrl, {
        headers,
        params: { Client_Id: clientId }
      });
  
      const allLeads = leadRes.data || [];
      setLeadData(allLeads);
  
      // Filter leads matching the current clientId
      const filteredLeads = allLeads.filter(lead => lead.Client_Id === clientId);
      const leadIds = filteredLeads.map(lead => lead.Lead_Id);
  
      // Fetch project data
      const projectUrl = `${API_URL}/api/user/service/681c4476bad37872280139f7`;
      const projectRes = await axios.get(projectUrl, {
        headers,
        params: { Client_Id: clientId }
      });
  
      const allProjects = projectRes.data || [];
      setProjectData(allProjects);
  
      const filteredProjects = allProjects.filter(project => project.Client_Id === clientId);
      const projectIds = filteredProjects.map(project => project.Project_Id);
  
      // Fetch proposal data
      const proposalUrl = `${API_URL}/api/user/service/681c454cbad3787228013a5b`;
      const proposalRes = await axios.get(proposalUrl, {
        headers,
        params: { Client_Id: clientId }
      });
  
      const allProposals = proposalRes.data || [];
      setProposalData(allProposals.map(proposal => ({
        ...proposal.data,
        id: proposal._id,
        items: Array.isArray(proposal.data?.["Line Items"])
          ? proposal.data["Line Items"].map(item => ({
              ...item,
              specs: typeof item.Specs === 'string' ? JSON.parse(item.Specs) : item.Specs
            }))
          : []
      })));
  
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Axios error:", err.response?.data || err.message);
        showSnackbar(err.response?.data?.message || "Failed to fetch data", "error");
      } else {
        console.error("❌ Unexpected error:", err);
        showSnackbar("An unexpected error occurred", "error");
      }
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "proposals") {
      fetchAllData();
    }
  }, [activeTab, cusprofile, clientId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      showSnackbar("Only JPEG, PNG, or PDF files are allowed", "error");
      return;
    }
    
    if (file.size > maxSize) {
      showSnackbar("File size must be less than 5MB", "error");
      return;
    }
  
    try {
      setFormSubmitting(true);
      
      // Create preview if image
      if (file.type.startsWith('image/')) {
        setPreviewImage(URL.createObjectURL(file));
      }
      
      // Upload file
      const formData = new FormData();
      formData.append("image", file);
      const imageUrl = await dispatch(uploadImage(formData)).unwrap();
      
      setFormFile({
        file,
        name: file.name,
        url: imageUrl
      });
      
      showSnackbar("File uploaded successfully!", "success");
    } catch (err) {
      console.error("File upload error:", err);
      showSnackbar("Failed to upload file", "error");
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    if (!clientId) {
      setError("Client ID is required but not available");
      showSnackbar("Client ID is missing", "error");
      return;
    }
    
    setFormSubmitting(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("Client_Id", clientId);
      
      // Append file URL if exists
      if (formFile?.url) {
        formDataToSend.append("File", formFile.url);
      }
      
      const response = await axios.post(
        `${API_URL}/api/user/service/681c4cdfbad3787228013c70`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );
      
      console.log("✅ Proposal submitted successfully:", response.data);
      showSnackbar("Proposal submitted successfully!", "success");
      
      // Reset form
      setFormData({
        Name: "",
        Email: "",
        Requirements: "",
        PhoneNumber: "",
        Reference: ""
      });
      setFormFile(null);
      setPreviewImage(null);
      
      // Switch to dashboard tab and refetch data
      setActiveTab("dashboard");
      await fetchAllData();
      
    } catch (err) {
      console.error("Submission error:", err);
      let errorMsg = "Failed to submit proposal";
      
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || 
                 err.response?.data?.error?.message || 
                 errorMsg;
        
        console.error("❌ Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
      }
      
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderSpecsTable = (specs) => {
    if (!specs || !Array.isArray(specs)) return null;
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small" aria-label="product specifications">
          <TableHead>
            <TableRow>
              <TableCell>Specification</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(specs[0]).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const LeadCard = ({ lead }) => {
    const leadStatus = lead.data?.Status || 'submitted';
    const createdDate = new Date(lead._id?.toString().substring(0, 8) * 1000);
    
    return (
      <Card sx={{ 
        mb: 3, 
        borderLeft: `4px solid ${theme.palette.info.main}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.info.light }}>
              <LeadIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" component="div">
              {lead.data?.Name || 'New Lead'}
            </Typography>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <DateIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {createdDate.toLocaleDateString()}
              </Typography>
            </Box>
          }
          action={
            <Chip 
              label={leadStatus.replace('_', ' ')} 
              color={statusColors[leadStatus] || "default"} 
              size="small" 
              sx={{ 
                mr: 1,
                textTransform: 'capitalize',
                fontWeight: 600
              }}
            />
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {lead.data?.Email || 'No email provided'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {lead.data?.["Phone Number"] || 'No phone provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Requirements:
              </Typography>
              <Typography variant="body2" paragraph>
                {lead.data?.Requirements || 'No specific requirements mentioned'}
              </Typography>
            </Grid>
            {(lead.data?.Reference || lead.data?.File) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Attachments:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {lead.data?.Reference && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={lead.data.Reference}
                      target="_blank"
                      startIcon={<LinkIcon />}
                    >
                      Reference Link
                    </Button>
                  )}
                  {lead.data?.File && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={lead.data.File}
                      target="_blank"
                      startIcon={
                        lead.data.File.includes('.pdf') ? <PdfIcon /> : <ImageIcon />
                      }
                    >
                      View Attachment
                    </Button>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button size="small" color="primary">
            View Details
          </Button>
          <Button size="small" color="secondary">
            Convert to Project
          </Button>
        </CardActions>
      </Card>
    );
  };

  const ProjectCard = ({ project }) => {
    const projectStatus = project.data?.Status || 'in_progress';
    const progressValue = project.data?.Progress || 0;
    
    return (
      <Card sx={{ 
        mb: 3, 
        borderLeft: `4px solid ${theme.palette.secondary.main}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.secondary.light }}>
              <ProjectIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" component="div">
              {project.data?.Name || 'New Project'}
            </Typography>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Lead ID: {project.data?.Lead_Id || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Client ID: {project.data?.Client_Id || 'N/A'}
              </Typography>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={projectStatus.replace('_', ' ')} 
                color={statusColors[projectStatus] || "default"} 
                size="small" 
                sx={{ 
                  mr: 1,
                  textTransform: 'capitalize',
                  fontWeight: 600
                }}
              />
              <Tooltip title={`${progressValue}% complete`}>
                <Badge
                  badgeContent={`${progressValue}%`}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Project Progress:
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressValue} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body2" paragraph>
                {project.data?.Description || 'No description available'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Timeline:
              </Typography>
              <Typography variant="body2">
                <strong>Start:</strong> {project.data?.Start_Date || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>End:</strong> {project.data?.End_Date || 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button size="small" color="primary">
            View Details
          </Button>
          <Button size="small" color="secondary">
            Create Proposal
          </Button>
        </CardActions>
      </Card>
    );
  };

  const ProposalCard = ({ proposal }) => {
    const proposalStatus = proposal.Status || 'draft';
    const totalValue = proposal.items?.reduce((sum, item) => sum + (parseFloat(item.Price) || 0), 0);
    
    return (
      <Card sx={{ 
        mb: 3, 
        borderLeft: `4px solid ${theme.palette.success.main}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.success.light }}>
              <ProposalIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" component="div">
              Proposal #{proposal.Id || proposal._id}
            </Typography>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Project ID: {proposal.Project_Id || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value: ${totalValue.toFixed(2)}
              </Typography>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={proposalStatus.replace('_', ' ')} 
                color={statusColors[proposalStatus] || "default"} 
                size="small" 
                sx={{ 
                  mr: 1,
                  textTransform: 'capitalize',
                  fontWeight: 600
                }}
              />
              {proposalStatus === 'approved' && (
                <StarIcon color="warning" sx={{ mr: 1 }} />
              )}
            </Box>
          }
        />
        <CardContent>
          {proposal["Uploaded Image"] && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Reference Image:
              </Typography>
              <CardMedia
                component="img"
                height="200"
                image={proposal["Uploaded Image"]}
                alt="Proposal reference"
                sx={{ 
                  borderRadius: 1, 
                  objectFit: 'contain',
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
            </Box>
          )}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Line Items ({proposal.items?.length || 0})
          </Typography>
          
          <Grid container spacing={2}>
            {proposal.items?.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item["Product Image"] || '/placeholder-product.jpg'}
                      alt={item.Name}
                      sx={{ objectFit: 'contain', p: 1 }}
                    />
                    <Chip
                      label={`$${item.Price || '0.00'}`}
                      color="primary"
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="subtitle1" component="div">
                      {item.Name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.Category}
                    </Typography>
                    
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="caption">View Specifications</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderSpecsTable(item.specs)}
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small">Details</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button size="small" color="primary" startIcon={<DescriptionIcon />}>
            Download PDF
          </Button>
          <Button 
            size="small" 
            color={proposalStatus === 'approved' ? 'success' : 'secondary'}
            variant={proposalStatus === 'approved' ? 'contained' : 'outlined'}
          >
            {proposalStatus === 'approved' ? 'Approved' : 'Approve'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  const ProposalFormTab = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Submit New Proposal
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Please fill out the form below to submit a new proposal request. 
            Provide as much detail as possible about your requirements.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmitProposal}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Requirements"
                  name="Requirements"
                  value={formData.Requirements}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  // required
                  InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reference URL"
                  name="Reference"
                  value={formData.Reference}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="upload-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {formFile ? formFile.name : "Upload Supporting File (JPEG, PNG, PDF)"}
                  </Button>
                </label>
                {previewImage && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption">Preview:</Typography>
                    <CardMedia
                      component="img"
                      image={previewImage}
                      alt="Uploaded Preview"
                      sx={{ 
                        maxWidth: 300, 
                        maxHeight: 300, 
                        mt: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1
                      }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setActiveTab("dashboard")} 
                color="secondary" 
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                color="primary" 
                variant="contained"
                disabled={formSubmitting}
                startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
              >
                {formSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const QuotesTab = () => (
    <Card>
      <CardHeader 
        title="Project Quote Summary" 
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
            <QuoteIcon />
          </Avatar>
        }
      />
      <Divider />
      <CardContent>
        <Typography variant="body1" paragraph>
          Detailed BOQ and breakdown per area will appear here once available.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DescriptionIcon />}
            sx={{ mr: 2 }}
          >
            Download PDF Quote
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<EmailIcon />}
          >
            Email Quote
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const DashboardTab = () => (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h2">
          My Dashboard
        </Typography>
        <Tooltip title="Add new proposal">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setActiveTab("new-proposal")}
            sx={{ 
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Add Proposal
          </Button>
        </Tooltip>
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>
        <LeadIcon color="info" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Your Leads ({leadData.length})
      </Typography>
      {leadData.length > 0 ? (
        leadData.map((lead, index) => (
          <LeadCard key={index} lead={lead} />
        ))
      ) : (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="textSecondary">
            No leads found. Create your first lead to get started.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setActiveTab("new-proposal")}
            sx={{ mt: 2 }}
          >
            Create Lead
          </Button>
        </Card>
      )}
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        <ProjectIcon color="secondary" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Your Projects ({projectData.length})
      </Typography>
      {projectData.length > 0 ? (
        projectData.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))
      ) : (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="textSecondary">
            No projects found. Convert a lead to start a project.
          </Typography>
        </Card>
      )}
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        <ProposalIcon color="success" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Your Proposals ({proposalData.length})
      </Typography>
      {proposalData.length > 0 ? (
        proposalData.map((proposal, index) => (
          <ProposalCard key={index} proposal={proposal} />
        ))
      ) : (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="textSecondary">
            No proposals found. Create a proposal for your project.
          </Typography>
        </Card>
      )}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="Customer portal tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} />
                  Dashboard
                </Box>
              } 
              value="dashboard" 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AddIcon sx={{ mr: 1 }} />
                  New Proposal
                </Box>
              } 
              value="new-proposal" 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ mr: 1 }} />
                  Quotes
                </Box>
              } 
              value="quotes" 
            />
          </Tabs>
        </Box>
        
        <Box sx={{ pt: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
          
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "new-proposal" && <ProposalFormTab />}
          {activeTab === "quotes" && <QuotesTab />}
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerPortal;